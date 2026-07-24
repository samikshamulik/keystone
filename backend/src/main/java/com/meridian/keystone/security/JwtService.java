package com.meridian.keystone.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private final JwtProperties props;
    private SecretKey signingKey;

    public JwtService(JwtProperties props) {
        this.props = props;
    }

    @PostConstruct
    void init() {
        byte[] keyBytes = props.getSecret().getBytes(StandardCharsets.UTF_8);
        // Pad or truncate to 32 bytes (256 bits) for HS256
        byte[] keyData = new byte[32];
        System.arraycopy(keyBytes, 0, keyData, 0, Math.min(keyBytes.length, 32));
        this.signingKey = Keys.hmacShaKeyFor(keyData);
    }

    public String generateToken(String email, String role, Long userId) {
        Date now    = new Date();
        Date expiry = new Date(now.getTime() + props.getExpirationMs());

        return Jwts.builder()
                .subject(email)
                .claim("role", role)
                .claim("userId", userId)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(signingKey)
                .compact();
    }

    public Claims validateAndParse(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isValid(String token) {
        try {
            validateAndParse(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public String extractEmail(String token) {
        return validateAndParse(token).getSubject();
    }
}
