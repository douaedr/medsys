package com.hospital.appointment.security;

import com.hospital.appointment.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.LocalDateTime;
import java.util.Date;

/**
 * Service de gestion des tokens JWT.
 * Compatible jjwt 0.12+ (nouvelle API).
 *
 * Migré depuis Services/JwtService.cs (.NET).
 */
@Service
public class JwtService {

    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.issuer}")
    private String issuer;

    @Value("${app.jwt.audience}")
    private String audience;

    @Value("${app.jwt.expiration-hours}")
    private long expirationHours;

    /**
     * Génère un token JWT pour un utilisateur (Patient/Doctor/Secretary).
     * Le subject = ID utilisateur, et on ajoute le rôle comme claim custom.
     */
    public String generateToken(User user) {
        long expirationMillis = expirationHours * 60 * 60 * 1000L;
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMillis);

        return Jwts.builder()
                .subject(String.valueOf(user.getId()))
                .claim("role", user.getRole().name())
                .claim("email", user.getEmail())
                .claim("fullName", user.getFullName())
                .issuer(issuer)
                .audience().add(audience).and()
                .issuedAt(now)
                .expiration(expiry)
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Retourne la date d'expiration (Instant ISO) pour la prochaine génération.
     * Utilisé par AuthController pour renvoyer expiresAt au client.
     */
    public LocalDateTime getExpiresAt() {
        return LocalDateTime.now().plusHours(expirationHours);
    }

    /**
     * Vérifie si un token est valide (signature OK + non expiré).
     * Utilisé par JwtAuthenticationFilter.
     */
    public boolean isValid(String token) {
        try {
            Claims claims = parseToken(token);
            return claims.getExpiration().after(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Parse le token et retourne tous les claims (nouvelle API jjwt 0.12+).
     * Utilisé par JwtAuthenticationFilter.
     */
    public Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Construit la clé HMAC à partir du secret de application.properties.
     * Le secret doit faire au moins 256 bits (32 caractères) pour HS256.
     */
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }
}