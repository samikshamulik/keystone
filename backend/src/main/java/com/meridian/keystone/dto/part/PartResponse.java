package com.meridian.keystone.dto.part;

import com.meridian.keystone.domain.Part;

import java.math.BigDecimal;
import java.time.Instant;

public record PartResponse(
        Long id,
        String name,
        String partNumber,
        BigDecimal unitCost,
        int stockQuantity,
        Instant createdAt
) {
    public static PartResponse from(Part p) {
        return new PartResponse(p.getId(), p.getName(), p.getPartNumber(),
                p.getUnitCost(), p.getStockQuantity(), p.getCreatedAt());
    }
}
