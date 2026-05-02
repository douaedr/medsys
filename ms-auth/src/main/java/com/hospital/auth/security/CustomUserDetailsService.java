package com.hospital.auth.security;
import com.hospital.auth.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    private final UserAccountRepository userAccountRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        var account = userAccountRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
        return User.builder()
                .username(account.getEmail())
                .password(account.getPassword())
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_" + account.getRole().name())))
                .disabled(!account.isEnabled())
                .accountLocked(account.getAccountLockedUntil() != null &&
                    account.getAccountLockedUntil().isAfter(java.time.LocalDateTime.now()))
                .build();
    }
}