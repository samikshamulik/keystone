package com.meridian.keystone.dto.customer;

import com.meridian.keystone.domain.Customer;

import java.time.Instant;

public record CustomerResponse(
        Long id,
        String name,
        String email,
        String phone,
        String address,
        Long userId,
        Instant createdAt
) {
    public static CustomerResponse from(Customer c) {
        return new CustomerResponse(
                c.getId(), c.getName(), c.getEmail(), c.getPhone(), c.getAddress(),
                c.getUser() == null ? null : c.getUser().getId(),
                c.getCreatedAt());
    }
}
