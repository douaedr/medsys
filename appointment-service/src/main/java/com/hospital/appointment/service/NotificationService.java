package com.hospital.appointment.service;

import com.hospital.appointment.entity.*;
import com.hospital.appointment.repository.NotificationRepository;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

/**
 * Service d'envoi de notifications email + persistance en BDD.
 * Migré depuis Services/NotificationService.cs (.NET).
 *
 * Utilise JavaMailSender (équivalent MailKit côté .NET).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final JavaMailSender mailSender;
    private final NotificationRepository notificationRepository;

    @Value("${app.email.from}")
    private String fromAddress;

    private static final DateTimeFormatter DATE_FR =
            DateTimeFormatter.ofPattern("EEEE dd MMMM yyyy", Locale.FRENCH);
    private static final DateTimeFormatter TIME_FR =
            DateTimeFormatter.ofPattern("HH:mm");
    private static final DateTimeFormatter DATETIME_FR =
            DateTimeFormatter.ofPattern("dd/MM/yyyy 'à' HH:mm", Locale.FRENCH);

    public void sendWaitingListNotification(String email, String name, TimeSlot slot) {
        String subject = "🗓️ Un créneau vient de se libérer !";
        String body = """
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                    <h2 style='color: #2563eb;'>Bonne nouvelle, %s !</h2>
                    <p>Un créneau vient de se libérer :</p>
                    <div style='background: #f0f9ff; border-left: 4px solid #2563eb; padding: 16px; margin: 16px 0;'>
                        <strong>📅 Date :</strong> %s<br/>
                        <strong>🕐 Heure :</strong> %s – %s
                    </div>
                    <p>Connectez-vous rapidement pour le réserver avant qu'il ne soit pris !</p>
                    <p style='color: #6b7280; font-size: 12px;'>Ce message a été envoyé car vous êtes inscrit(e) sur la liste d'attente.</p>
                </div>
                """.formatted(name,
                slot.getStartTime().format(DATE_FR),
                slot.getStartTime().format(TIME_FR),
                slot.getEndTime().format(TIME_FR));

        sendEmail(email, subject, body);
    }

    public void sendPenaltyNotification(User patient) {
        String subject = "⚠️ Pénalité appliquée sur votre compte";
        String body = """
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                    <h2 style='color: #dc2626;'>Pénalité activée</h2>
                    <p>Bonjour %s,</p>
                    <p>Suite à l'annulation de <strong>%d rendez-vous</strong>,
                       votre compte a été temporairement restreint.</p>
                    <div style='background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 16px 0;'>
                        <strong>Blocage jusqu'au :</strong> %s
                    </div>
                    <p>Pendant cette période, vous ne pourrez pas prendre de nouveaux rendez-vous.</p>
                    <p>Pour toute question, contactez notre secrétariat.</p>
                </div>
                """.formatted(patient.getFullName(),
                patient.getCancelCount(),
                patient.getPenaltyUntil() != null ? patient.getPenaltyUntil().format(DATETIME_FR) : "—");

        sendEmail(patient.getEmail(), subject, body);
    }

    public void sendBookingConfirmation(User patient, Appointment appt, TimeSlot slot) {
        String subject = "✅ Confirmation de votre rendez-vous";

        String cancelInfo;
        if (appt.getAnonymousToken() != null) {
            cancelInfo = """
                    <div style='background: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px; margin: 16px 0;'>
                        <strong>⚠️ Code d'annulation :</strong> <code style='font-size: 16px; font-weight: bold;'>%s</code><br/>
                        <small>Conservez ce code précieusement pour pouvoir annuler votre rendez-vous.</small>
                    </div>
                    """.formatted(appt.getAnonymousToken());
        } else {
            cancelInfo = "<p>Pour annuler, connectez-vous à votre espace patient.</p>";
        }

        String reasonLine = appt.getReason() != null
                ? "<strong>📝 Motif :</strong> " + appt.getReason()
                : "";

        String body = """
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                    <h2 style='color: #16a34a;'>Rendez-vous confirmé ✓</h2>
                    <p>Bonjour %s,</p>
                    <p>Votre rendez-vous a bien été enregistré :</p>
                    <div style='background: #f0fdf4; border-left: 4px solid #16a34a; padding: 16px; margin: 16px 0;'>
                        <strong>📅 Date :</strong> %s<br/>
                        <strong>🕐 Heure :</strong> %s – %s<br/>
                        %s
                    </div>
                    %s
                </div>
                """.formatted(patient.getFullName(),
                slot.getStartTime().format(DATE_FR),
                slot.getStartTime().format(TIME_FR),
                slot.getEndTime().format(TIME_FR),
                reasonLine,
                cancelInfo);

        sendEmail(patient.getEmail(), subject, body);
    }

    public void sendCancellationConfirmation(User patient, TimeSlot slot) {
        String subject = "❌ Annulation de votre rendez-vous";
        String body = """
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                    <h2 style='color: #dc2626;'>Rendez-vous annulé</h2>
                    <p>Bonjour %s,</p>
                    <p>Votre rendez-vous du <strong>%s à %s</strong>
                       a bien été annulé.</p>
                    <p>Vous pouvez prendre un nouveau rendez-vous à tout moment.</p>
                </div>
                """.formatted(patient.getFullName(),
                slot.getStartTime().format(DATE_FR),
                slot.getStartTime().format(TIME_FR));

        sendEmail(patient.getEmail(), subject, body);
    }

    /**
     * Persiste la notification, puis tente l'envoi SMTP.
     * Migré depuis SendEmailAsync (.NET) : même logique de tracking en DB.
     */
    @Transactional
    public void sendEmail(String to, String subject, String htmlBody) {
        Notification notification = Notification.builder()
                .recipientEmail(to)
                .subject(subject)
                .body(htmlBody)
                .status(NotificationStatus.Pending)
                .build();
        notificationRepository.save(notification);

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);   // true = HTML

            mailSender.send(mimeMessage);

            notification.setStatus(NotificationStatus.Sent);
            notification.setSentAt(LocalDateTime.now());
        } catch (Exception ex) {
            log.error("Échec envoi email vers {} : {}", to, ex.getMessage());
            notification.setStatus(NotificationStatus.Failed);
        } finally {
            notificationRepository.save(notification);
        }
    }
}
