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
                    String subject = claims.getSubject();
                    String role = (String) claims.get("role");

                    Optional<User> userOpt;
                    try {
                        Integer userId = Integer.parseInt(subject);
                        userOpt = userRepository.findById(userId);
                    } catch (NumberFormatException e) {
                        userOpt = userRepository.findByEmail(subject);
                    }

                    if (userOpt.isPresent()) {
                        var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role));
                        var auth = new UsernamePasswordAuthenticationToken(
                                userOpt.get(), null, authorities);
                        auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(auth);
                    }
                }
            } catch (Exception ex) {
                log.debug("JWT invalide : {}", ex.getMessage());
            }
        }

        chain.doFilter(request, response);
    }

    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        String pathInfo = request.getServletPath();
        if (pathInfo != null && pathInfo.startsWith("/hubs")) {
            String paramToken = request.getParameter("access_token");
            if (paramToken != null && !paramToken.isBlank()) return paramToken;
        }
        return null;
    }
}