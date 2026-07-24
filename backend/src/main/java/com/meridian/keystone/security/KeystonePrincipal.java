package com.meridian.keystone.security;

/**
 * Immutable principal placed in the SecurityContext; carries the user's ID,
 * email, and role string — everything controllers need without an extra DB hit.
 */
public record KeystonePrincipal(Long userId, String email, String role) {}
