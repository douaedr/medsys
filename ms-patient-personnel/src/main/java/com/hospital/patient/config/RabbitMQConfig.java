package com.hospital.patient.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // ── Exchanges ─────────────────────────────────────────────────────────────
    public static final String PATIENT_EXCHANGE     = "patient.exchange";
    public static final String APPOINTMENT_EXCHANGE = "appointment.exchange";

    // ── Queues ────────────────────────────────────────────────────────────────
    public static final String PATIENT_QUEUE             = "patient.queue";
    public static final String PATIENT_NOTIFICATION_QUEUE = "patient.notification.queue";

    // ── Routing keys (inbound) ────────────────────────────────────────────────
    public static final String ROUTING_APPOINTMENT_CREATED   = "appointment.created";
    public static final String ROUTING_APPOINTMENT_CANCELLED = "appointment.cancelled";

    // ── Routing keys (outbound) ───────────────────────────────────────────────
    public static final String ROUTING_PATIENT_NOTIFICATION  = "patient.notification";
    public static final String ROUTING_APPOINTMENT_REBOOK    = "appointment.rebook";

    // ── Exchanges ─────────────────────────────────────────────────────────────
    @Bean
    public TopicExchange patientExchange() {
        return ExchangeBuilder.topicExchange(PATIENT_EXCHANGE).durable(true).build();
    }

    @Bean
    public TopicExchange appointmentExchange() {
        return ExchangeBuilder.topicExchange(APPOINTMENT_EXCHANGE).durable(true).build();
    }

    // ── Queues ────────────────────────────────────────────────────────────────
    @Bean
    public Queue patientQueue() {
        return QueueBuilder.durable(PATIENT_QUEUE).build();
    }

    @Bean
    public Queue patientNotificationQueue() {
        return QueueBuilder.durable(PATIENT_NOTIFICATION_QUEUE).build();
    }

    // ── Bindings ──────────────────────────────────────────────────────────────
    @Bean
    public Binding appointmentCreatedBinding(Queue patientQueue,
                                              TopicExchange appointmentExchange) {
        return BindingBuilder.bind(patientQueue)
                .to(appointmentExchange)
                .with(ROUTING_APPOINTMENT_CREATED);
    }

    @Bean
    public Binding appointmentCancelledBinding(Queue patientQueue,
                                                TopicExchange appointmentExchange) {
        return BindingBuilder.bind(patientQueue)
                .to(appointmentExchange)
                .with(ROUTING_APPOINTMENT_CANCELLED);
    }

    @Bean
    public Binding patientNotificationBinding(Queue patientNotificationQueue,
                                               TopicExchange patientExchange) {
        return BindingBuilder.bind(patientNotificationQueue)
                .to(patientExchange)
                .with(ROUTING_PATIENT_NOTIFICATION);
    }

    // ── JSON serialization (interoperable with .NET) ──────────────────────────
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}
