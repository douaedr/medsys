package com.hospital.appointment.security;

import com.hospital.appointment.entity.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Helper statique pour récupérer l'utilisateur authentifié dans le SecurityContext.
 * Équivalent de User.FindFirstValue(ClaimTypes.NameIdentifier) côté .NET.
 */
public final class SecurityUtils {

    private SecurityUtils() {}

    /**
     * Retourne l'ID de l'utilisateur connecté, ou null s'il est anonyme.
     */
    public static Integer getCurrentUserId() {
        User user = getCurrentUser();
        return user != null ? user.getId() : null;
    }

    /**
     * Retourne l'utilisateur connecté, ou null s'il est anonyme.
     */
    public static User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null
                || !auth.isAuthenticated()
                || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }
        Object principal = auth.getPrincipal();
        if (principal instanceof User u) {
            return u;
        }
        return null;
    }
}
