package com.meridian.keystone.dto.workorder;

import com.meridian.keystone.domain.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record WorkOrderRequest(
        @NotBlank @Size(max = 255) String title,
        String description,
        @NotNull Priority priority,
        @NotNull Long customerId,
        @NotNull Long siteId
) {}
