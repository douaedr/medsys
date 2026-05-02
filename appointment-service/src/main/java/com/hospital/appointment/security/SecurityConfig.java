package com.hospital.appointment.security;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;



import java.util.Arrays;
import java.util.List;

/**
 * Configuration de la sécurité (JWT, CORS, autorisation par rôles).
 * Équivalent de la section "JWT", "CORS" et "AddAuthorization" de Program.cs (.NET).
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    public PasswordEncoder passwordEncoder() {
        // Compatible avec BCrypt.Net.BCrypt utilisé côté .NET
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // ── Endpoints publics ─────────────────────────────────
                        .requestMatchers(HttpMethod.POST, "/api/auth/register").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()

                        // Réservation et annulation accessibles aux anonymes
                        .requestMatchers(HttpMethod.POST, "/api/appointments").permitAll()
                        .requestMatchers(HttpMethod.DELETE, "/api/appointments").permitAll()

                        // Lecture de créneaux et services publique
                        .requestMatchers(HttpMethod.GET, "/api/slots/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/services/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/waiting-list").permitAll()
                        .requestMatchers(HttpMethod.DELETE, "/api/waiting-list/**").permitAll()

                        // Bridge interne (pour ms-patient-personnel) — sans auth
                        .requestMatchers("/api/internal/**").permitAll()

                        // WebSocket public (handshake) — l'auth JWT s'applique via le filtre
                        .requestMatchers("/hubs/**", "/ws/**").permitAll()

                        // Swagger
                        .requestMatchers("/swagger/**", "/v3/api-docs/**",
                                "/swagger-ui/**", "/swagger-ui.html").permitAll()

                        // Tout le reste demande auth
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        cfg.setAllowedHeaders(List.of("*"));
        cfg.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
        src.registerCorsConfiguration("/**", cfg);
        return src;
    }
}
