package com.hospital.appointment.security;

import com.hospital.appointment.entity.User;
import com.hospital.appointment.repository.UserRepository;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

/**
 * Filtre exécuté à chaque requête : extrait le JWT du header Authorization
 * (ou du paramètre access_token pour les requêtes WebSocket),
 * valide le token, et place l'utilisateur authentifié dans le SecurityContext.
 *
 * Équivalent du paramétrage AddJwtBearer + Events.OnMessageReceived dans Program.cs (.NET).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain chain) throws ServletException, IOException {

        String token = extractToken(request);

        if (token != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                if (jwtService.isValid(token)) {
                    Claims claims = jwtService.parseToken(token);
                    Integer userId = Integer.parseInt(claims.getSubject());
                    String role = (String) claims.get("role");

                    Optional<User> userOpt = userRepository.findById(userId);
                    if (userOpt.isPresent()) {
                        // Spring Security exige le préfixe "ROLE_" pour le matching @PreAuthorize
                        var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role));
                        var auth = new UsernamePasswordAuthenticationToken(
                                userOpt.get(), null, authorities);
                        auth.setDetails(new WebAuthenticationDetailsSource()
                                .buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(auth);
                    }
                }
            } catch (Exception ex) {
                log.debug("JWT invalide : {}", ex.getMessage());
            }
        }

        chain.doFilter(request, response);
    }

    /**
     * Extrait le token depuis :
     * 1. Le header "Authorization: Bearer ..."
     * 2. OU le paramètre "access_token" (pour les requêtes WebSocket)
     */
    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }

        // Pour les WebSocket (équivalent SignalR)
        String pathInfo = request.getServletPath();
        if (pathInfo != null && pathInfo.startsWith("/hubs")) {
            String paramToken = request.getParameter("access_token");
            if (paramToken != null && !paramToken.isBlank()) {
                return paramToken;
            }
        }

        return null;
    }
}
