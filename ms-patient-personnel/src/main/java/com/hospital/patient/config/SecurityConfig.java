package com.hospital.patient.config;

import com.hospital.patient.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:3000}")
    private String allowedOrigins;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/actuator/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**",
                                "/api/v1/auth/**",
                                // Endpoints internes (service-to-service, pas de JWT)
                                "/api/internal/**",
                                // WebSocket handshake
                                "/ws/**",
                                "/ws-native/**"
                        ).permitAll()
                        .requestMatchers("/api/v1/patients/**").permitAll()
                        .requestMatchers("/api/v1/medecins/**").permitAll()

                        // â”€â”€â”€â”€â”€â”€â”€â”€â”€ FEAT 1 â€” Chef de service â”€â”€â”€â”€â”€â”€â”€â”€â”€
                        .requestMatchers("/api/v1/chef/**").hasRole("CHEF_SERVICE")

                        // â”€â”€â”€â”€â”€â”€â”€â”€â”€ FEAT 5 â€” Organigramme â”€â”€â”€â”€â”€â”€â”€â”€â”€
                        .requestMatchers("/api/v1/organigramme/**")
                            .hasAnyRole("DIRECTEUR", "ADMIN", "CHEF_SERVICE")

                        // â”€â”€â”€â”€â”€â”€â”€â”€â”€ FEAT 4 â€” Rapports directeur â”€â”€â”€â”€â”€â”€â”€â”€â”€
                        // (dÃ©jÃ  couvert par /api/v1/directeur/** ci-dessous)

                        // â”€â”€â”€â”€â”€â”€â”€â”€â”€ FEAT 7 â€” Endpoints du PERSONNEL (infirmier/brancardier/aide-soignant) â”€â”€â”€â”€â”€â”€â”€â”€â”€
                        .requestMatchers("/api/v1/personnel/me/**").hasAnyRole("PERSONNEL", "MEDECIN", "CHEF_SERVICE")

                        // â”€â”€â”€â”€â”€â”€â”€â”€â”€ FEAT 2 â€” Messagerie inter-personnel (tous rÃ´les personnel) â”€â”€â”€â”€â”€â”€â”€â”€â”€
                        .requestMatchers("/api/v1/personnel/messages/**", "/api/v1/personnel/collegues")
                            .hasAnyRole("MEDECIN", "PERSONNEL", "SECRETARY", "CHEF_SERVICE", "DIRECTEUR", "ADMIN")

                        // â”€â”€â”€â”€â”€â”€â”€â”€â”€ MÃ©decin / Chef â”€â”€â”€â”€â”€â”€â”€â”€â”€
                        .requestMatchers("/api/v1/medecin/**").hasAnyRole("MEDECIN", "CHEF_SERVICE")

                        // â”€â”€â”€â”€â”€â”€â”€â”€â”€ Patient â”€â”€â”€â”€â”€â”€â”€â”€â”€
                        .requestMatchers("/api/v1/patient/**").hasRole("PATIENT")

                        // â”€â”€â”€â”€â”€â”€â”€â”€â”€ Directeur â”€â”€â”€â”€â”€â”€â”€â”€â”€
                        .requestMatchers("/api/v1/directeur/**").hasAnyRole("DIRECTEUR", "ADMIN")

                        // â”€â”€â”€â”€â”€â”€â”€â”€â”€ SecrÃ©taire â”€â”€â”€â”€â”€â”€â”€â”€â”€
                        .requestMatchers("/api/v1/secretaire/**").hasAnyRole("SECRETARY", "MEDECIN", "ADMIN", "CHEF_SERVICE")

                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, e) ->
                                response.sendError(jakarta.servlet.http.HttpServletResponse.SC_UNAUTHORIZED, "Non authentifiÃ©"))
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        List<String> origins = Arrays.asList(allowedOrigins.split(","));
        config.setAllowedOriginPatterns(origins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
