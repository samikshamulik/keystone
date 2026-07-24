package com.meridian.keystone.dto.site;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SiteRequest(
        @NotBlank @Size(max = 255) String name,
        @NotBlank String address,
        String city,
        String postcode
) {}
