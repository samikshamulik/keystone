package com.meridian.keystone.dto.user;

import com.meridian.keystone.domain.User;

import java.time.Instant;

public record UserResponse(
        Long id,
        String name,
        String email,
        String role,
        boolean enabled,
        Instant createdAt
) {
    public static UserResponse from(User u) {
        return new UserResponse(u.getId(), u.getName(), u.getEmail(),
                u.getRole().name(), u.isEnabled(), u.getCreatedAt());
    }
}
