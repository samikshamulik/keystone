package com.meridian.keystone.dto.workorder;

import com.meridian.keystone.domain.*;

import java.time.Instant;
import java.util.List;

public record WorkOrderResponse(
        Long id,
        String code,
        String title,
        String description,
        String priority,
        String status,
        Long customerId,
        String customerName,
        Long siteId,
        String siteName,
        Long assigneeId,
        String assigneeName,
        Instant slaDueAt,
        boolean slaBreached,
        Instant completedAt,
        Instant closedAt,
        Instant createdAt,
        Instant updatedAt,
        List<StatusHistoryEntry> statusHistory,
        PartTimeSummary summary
) {
    public record StatusHistoryEntry(
            String fromStatus,
            String toStatus,
            String changedBy,
            String note,
            Instant changedAt
    ) {}

    public record PartTimeSummary(
            int totalMinutes,
            java.math.BigDecimal totalPartsCost
    ) {}

    public static WorkOrderResponse from(WorkOrder wo,
                                         int totalMinutes,
                                         java.math.BigDecimal totalPartsCost) {
        var history = wo.getStatusHistory().stream()
                .map(h -> new StatusHistoryEntry(
                        h.getFromStatus() == null ? null : h.getFromStatus().name(),
                        h.getToStatus().name(),
                        h.getChangedBy() == null ? "system" : h.getChangedBy().getName(),
                        h.getNote(),
                        h.getChangedAt()))
                .toList();

        return new WorkOrderResponse(
                wo.getId(),
                wo.getCode(),
                wo.getTitle(),
                wo.getDescription(),
                wo.getPriority().name(),
                wo.getStatus().name(),
                wo.getCustomer().getId(),
                wo.getCustomer().getName(),
                wo.getSite().getId(),
                wo.getSite().getName(),
                wo.getAssignee() == null ? null : wo.getAssignee().getId(),
                wo.getAssignee() == null ? null : wo.getAssignee().getName(),
                wo.getSlaDueAt(),
                wo.isSlaBreached(),
                wo.getCompletedAt(),
                wo.getClosedAt(),
                wo.getCreatedAt(),
                wo.getUpdatedAt(),
                history,
                new PartTimeSummary(totalMinutes, totalPartsCost)
        );
    }
}
