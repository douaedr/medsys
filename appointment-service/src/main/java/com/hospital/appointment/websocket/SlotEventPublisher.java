package com.hospital.appointment.websocket;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Publication d'événements WebSocket — équivalent de IHubContext<SlotHub> (.NET).
 *
 * Permet aux services métier (AppointmentService, SlotService) d'émettre
 * des notifications en temps réel vers tous les clients connectés.
 *
 * Topic : /topic/slots
 * Événements (mêmes noms que SignalR pour compatibilité front) :
 *   - SlotStatusChanged
 *   - SlotAdded
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SlotEventPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    private static final String TOPIC_SLOTS = "/topic/slots";

    /**
     * Émet un événement "SlotStatusChanged" — équivalent de :
     *   await _hub.Clients.All.SendAsync("SlotStatusChanged", new {...})
     */
    public void publishSlotStatusChanged(Integer slotId, String status, boolean isClickable) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("event", "SlotStatusChanged");
        payload.put("slotId", slotId);
        payload.put("status", status);
        payload.put("isClickable", isClickable);

        log.debug("WS publish SlotStatusChanged: slot={} status={}", slotId, status);
        messagingTemplate.convertAndSend(TOPIC_SLOTS, payload);
    }

    /**
     * Émet un événement "SlotAdded" — équivalent de :
     *   await _hub.Clients.All.SendAsync("SlotAdded", slotDto)
     */
    public void publishSlotAdded(Object slotDto) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("event", "SlotAdded");
        payload.put("data", slotDto);

        log.debug("WS publish SlotAdded");
        messagingTemplate.convertAndSend(TOPIC_SLOTS, payload);
    }
}
