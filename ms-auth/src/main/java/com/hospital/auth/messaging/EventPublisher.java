package com.hospital.auth.messaging;

import com.hospital.auth.config.RabbitMQConfig;
import com.hospital.auth.entity.UserAccount;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishUserCreated(UserAccount user) {
        AuthEventMessage event = AuthEventMessage.builder()
                .eventType("USER_CREATED")
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole().name())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .patientId(user.getPatientId())
                .timestamp(LocalDateTime.now())
                .build();
        publish(RabbitMQConfig.ROUTING_USER_CREATED, event);
    }

    public void publishUserLoggedIn(UserAccount user) {
        AuthEventMessage event = AuthEventMessage.builder()
                .eventType("USER_LOGGED_IN")
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole().name())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .patientId(user.getPatientId())
                .timestamp(LocalDateTime.now())
                .build();
        publish(RabbitMQConfig.ROUTING_USER_LOGGED_IN, event);
    }

    private void publish(String routingKey, AuthEventMessage event) {
        try {
            rabbitTemplate.convertAndSend(RabbitMQConfig.AUTH_EXCHANGE, routingKey, event);
            log.info("[RabbitMQ] Published event: type={} userId={}", event.getEventType(), event.getUserId());
        } catch (Exception e) {
            // Non-blocking: log the failure but don't interrupt the auth flow
            log.warn("[RabbitMQ] Failed to publish event {}: {}", event.getEventType(), e.getMessage());
        }
    }
}
