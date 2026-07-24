package com.meridian.keystone.dto.auth;

public record LoginResponse(
        String token,
        String tokenType,
        Long userId,
        String email,
        String name,
        String role
) {
    public static LoginResponse of(String token, Long userId, String email, String name, String role) {
        return new LoginResponse(token, "Bearer", userId, email, name, role);
    }
}
