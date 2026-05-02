package com.hospital.appointment.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * Configuration WebSocket / STOMP — équivalent SignalR (Hubs/SlotHub.cs).
 *
 * Endpoint de connexion : /hubs/slots (compatible avec les chemins .NET)
 *
 * Topics diffusés :
 *   /topic/slots          — tous les changements de créneaux
 *   /topic/slots/{doctor} — changements pour un médecin spécifique
 *
 * Événements publiés (mêmes noms qu'en .NET pour compatibilité front) :
 *   - SlotStatusChanged  { slotId, status, isClickable }
 *   - SlotAdded          { id, startTime, endTime, status, isClickable, ... }
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Le broker simple distribue les messages aux abonnés des topics
        config.enableSimpleBroker("/topic", "/queue");
        // Préfixe pour les messages envoyés par les clients vers le serveur
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Endpoint principal — équivalent à app.MapHub<SlotHub>("/hubs/slots")
        registry.addEndpoint("/hubs/slots")
                .setAllowedOriginPatterns(allowedOrigins.split(","))
                .withSockJS();   // fallback SockJS pour compat navigateurs anciens

        // Endpoint sans SockJS (clients STOMP natifs)
        registry.addEndpoint("/ws/slots")
                .setAllowedOriginPatterns(allowedOrigins.split(","));
    }
}
