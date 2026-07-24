package com.meridian.keystone.dto.workorder;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record LogPartsRequest(
        @NotNull Long partId,
        @NotNull @Min(1) Integer quantity
) {}
