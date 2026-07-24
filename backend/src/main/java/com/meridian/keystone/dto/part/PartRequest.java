package com.meridian.keystone.dto.part;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record PartRequest(
        @NotBlank String name,
        String partNumber,
        @NotNull @DecimalMin("0.0") BigDecimal unitCost,
        @NotNull @Min(0) Integer stockQuantity
) {}
