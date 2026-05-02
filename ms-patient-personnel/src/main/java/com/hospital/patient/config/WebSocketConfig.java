package com.hospital.patient.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * 🔧 V4: Configuration de Spring WebSocket avec broker STOMP.
 *
 * Permet aux clients web (frontend React) de se connecter en temps reel
 * pour recevoir des notifications push (nouveaux RDV, messages, etc.)
 *
 * Architecture :
 *   1. Le navigateur ouvre une connexion WebSocket sur /ws
 *   2. Il s'abonne a /topic/notifications/{patientId}
 *   3. Quand RabbitMQ recoit un event NotificationEvent,
 *      WebSocketNotificationListener pousse vers le bon topic
 *   4. Le navigateur recoit la notif en temps reel
 *
 * Endpoints :
 *   - WebSocket handshake : ws://localhost:8081/ws
 *   - Topic d'abonnement   : /topic/notifications/{patientId}
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Topics simples (in-memory) - destinataires des messages PUSH du serveur
        config.enableSimpleBroker("/topic", "/queue");

        // Prefix pour les messages envoyes PAR le client AU serveur (pas utilise ici, mais standard)
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Endpoint WebSocket public avec SockJS fallback (pour navigateurs sans support natif)
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")  // Autorise tous origins en dev
                .withSockJS();

        // Endpoint sans SockJS (WebSocket pur) si necessaire
        registry.addEndpoint("/ws-native")
                .setAllowedOriginPatterns("*");
    }
}
