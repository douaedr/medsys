package com.hospital.patient.messaging;

import com.hospital.patient.config.RabbitMQConfig;
import com.hospital.patient.entity.AppointmentRecord;
import com.hospital.patient.repository.AppointmentRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class AppointmentEventListener {

    private final AppointmentRecordRepository appointmentRepo;
    private final NotificationPublisher notificationPublisher;

    @RabbitListener(queues = RabbitMQConfig.PATIENT_QUEUE)
    public void handleAppointmentEvent(AppointmentEvent event) {
        if (event == null || event.getEventType() == null) {
            log.warn("[RabbitMQ] Received null or invalid appointment event");
            return;
        }

        log.info("[RabbitMQ] Received event: type={} appointmentId={} patientId={}",
                event.getEventType(), event.getAppointmentId(), event.getPatientId());

        switch (event.getEventType()) {
            case "APPOINTMENT_CREATED"   -> handleCreated(event);
            case "APPOINTMENT_CANCELLED" -> handleCancelled(event);
            default -> log.warn("[RabbitMQ] Unknown appointment event type: {}", event.getEventType());
        }
    }

    private void handleCreated(AppointmentEvent event) {
        // Upsert the local appointment record
        AppointmentRecord record = appointmentRepo
                .findByExternalAppointmentId(event.getAppointmentId())
                .orElse(AppointmentRecord.builder()
                        .externalAppointmentId(event.getAppointmentId())
                        .build());

        record.setPatientId(event.getPatientId());
        record.setDoctorId(event.getDoctorId());
        record.setDoctorName(event.getDoctorName());
        record.setSpecialty(event.getSpecialty());
        record.setAppointmentDate(event.getAppointmentDate());
        record.setStatus("SCHEDULED");
        record.setNotes(event.getNotes());
        record.setUpdatedAt(LocalDateTime.now());

        appointmentRepo.save(record);

        // Trigger patient notification
        notificationPublisher.publishPatientNotification(
                event.getPatientId(),
                "Rendez-vous confirme",
                "Votre rendez-vous avec " + event.getDoctorName()
                        + " est confirme pour le " + event.getAppointmentDate(),
                event.getAppointmentId()
        );
    }

    private void handleCancelled(AppointmentEvent event) {
        appointmentRepo.findByExternalAppointmentId(event.getAppointmentId())
                .ifPresent(record -> {
                    record.setStatus("CANCELLED");
                    record.setUpdatedAt(LocalDateTime.now());
                    appointmentRepo.save(record);

                    notificationPublisher.publishPatientNotification(
                            event.getPatientId(),
                            "Rendez-vous annule",
                            "Votre rendez-vous avec " + record.getDoctorName()
                                    + " du " + record.getAppointmentDate() + " a ete annule.",
                            event.getAppointmentId()
                    );
                });
    }
}
