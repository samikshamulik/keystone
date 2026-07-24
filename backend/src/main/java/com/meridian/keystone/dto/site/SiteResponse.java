package com.meridian.keystone.dto.site;

import com.meridian.keystone.domain.Site;

import java.time.Instant;

public record SiteResponse(
        Long id,
        Long customerId,
        String customerName,
        String name,
        String address,
        String city,
        String postcode,
        Instant createdAt
) {
    public static SiteResponse from(Site s) {
        return new SiteResponse(
                s.getId(),
                s.getCustomer().getId(),
                s.getCustomer().getName(),
                s.getName(),
                s.getAddress(),
                s.getCity(),
                s.getPostcode(),
                s.getCreatedAt());
    }
}
