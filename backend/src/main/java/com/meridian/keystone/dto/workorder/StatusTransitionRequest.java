package com.meridian.keystone.dto.workorder;

import com.meridian.keystone.domain.WorkOrderStatus;
import jakarta.validation.constraints.NotNull;

public record StatusTransitionRequest(
        @NotNull WorkOrderStatus toStatus,
        String note
) {}
