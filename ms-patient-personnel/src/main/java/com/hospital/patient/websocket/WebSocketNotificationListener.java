package com.hospital.patient.websocket;

import com.hospital.patient.config.RabbitMQConfig;
import com.hospital.patient.messaging.NotificationEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * 🔧 V4: Pont entre RabbitMQ et WebSocket.
 *
 * Ce listener consomme les messages de la queue patient.notification.queue
 * (publies par NotificationPublisher quand un RDV est cree/annule, etc.)
 * et les pousse en temps reel via WebSocket aux clients abonnes
 * au topic /topic/notifications/{patientId}.
 *
 * Flux complet :
 *   1. appointment-service publie un AppointmentEvent dans appointment.exchange
 *   2. AppointmentEventListener (existant) consomme depuis patient.queue
 *      et appelle NotificationPublisher.publishPatientNotification(...)
 *   3. NotificationPublisher publie un NotificationEvent dans patient.exchange
 *   4. CE listener consomme depuis patient.notification.queue
 *   5. Push via SimpMessagingTemplate vers /topic/notifications/{patientId}
 *   6. Le frontend abonne recoit la notif en temps reel et affiche la cloche
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketNotificationListener {

    private final SimpMessagingTemplate messagingTemplate;

    @RabbitListener(queues = RabbitMQConfig.PATIENT_NOTIFICATION_QUEUE)
    public void handleNotification(NotificationEvent event) {
        if (event == null || event.getPatientId() == null) {
            log.warn("[WS] Received null or invalid notification event");
            return;
        }

        log.info("[WS] Pushing notification to patient {} : {}",
                event.getPatientId(), event.getSubject());

        // Construire le payload pour le frontend
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", event.getEventType());
        payload.put("subject", event.getSubject());
        payload.put("message", event.getMessage());
        payload.put("appointmentId", event.getAppointmentId());
        payload.put("timestamp", event.getTimestamp() != null
                ? event.getTimestamp().toString()
                : LocalDateTime.now().toString());

        // Pousser vers le topic specifique au patient
        // Le frontend s'abonne a "/topic/notifications/{patientId}"
        String destination = "/topic/notifications/" + event.getPatientId();
        try {
            messagingTemplate.convertAndSend(destination, payload);
            log.info("[WS] Notification pushed to {}", destination);
        } catch (Exception e) {
            log.error("[WS] Failed to push notification : {}", e.getMessage(), e);
        }
    }
}
