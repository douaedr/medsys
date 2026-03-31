package com.hospital.auth.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // ── Exchange ──────────────────────────────────────────────────────────────
    public static final String AUTH_EXCHANGE = "auth.exchange";

    // ── Queues ────────────────────────────────────────────────────────────────
    public static final String AUTH_QUEUE    = "auth.queue";
    public static final String PATIENT_QUEUE = "patient.queue";

    // ── Routing keys ─────────────────────────────────────────────────────────
    public static final String ROUTING_USER_CREATED   = "user.created";
    public static final String ROUTING_USER_LOGGED_IN = "user.logged_in";

    @Bean
    public TopicExchange authExchange() {
        return ExchangeBuilder.topicExchange(AUTH_EXCHANGE).durable(true).build();
    }

    @Bean
    public Queue authQueue() {
        return QueueBuilder.durable(AUTH_QUEUE).build();
    }

    @Bean
    public Queue patientQueue() {
        return QueueBuilder.durable(PATIENT_QUEUE).build();
    }

    @Bean
    public Binding authQueueBinding(Queue authQueue, TopicExchange authExchange) {
        return BindingBuilder.bind(authQueue).to(authExchange).with("user.#");
    }

    @Bean
    public Binding patientQueueBinding(Queue patientQueue, TopicExchange authExchange) {
        return BindingBuilder.bind(patientQueue).to(authExchange).with("user.created");
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
