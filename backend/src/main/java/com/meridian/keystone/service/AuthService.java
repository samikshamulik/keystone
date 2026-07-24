package com.meridian.keystone.service;

import com.meridian.keystone.domain.User;
import com.meridian.keystone.dto.auth.LoginRequest;
import com.meridian.keystone.dto.auth.LoginResponse;
import com.meridian.keystone.exception.ApiException;
import com.meridian.keystone.repository.UserRepository;
import com.meridian.keystone.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepo, PasswordEncoder encoder, JwtService jwtService) {
        this.userRepo   = userRepo;
        this.encoder    = encoder;
        this.jwtService = jwtService;
    }

    public LoginResponse login(LoginRequest req) {
        User user = userRepo.findByEmail(req.email())
                .orElseThrow(() -> ApiException.badRequest("Invalid email or password"));

        if (!user.isEnabled()) {
            throw ApiException.forbidden("Account is disabled");
        }

        if (!encoder.matches(req.password(), user.getPassword())) {
            throw ApiException.badRequest("Invalid email or password");
        }

        String token = jwtService.generateToken(user.getEmail(), user.getRole().name(), user.getId());
        return LoginResponse.of(token, user.getId(), user.getEmail(), user.getName(),
                user.getRole().name());
    }
}
