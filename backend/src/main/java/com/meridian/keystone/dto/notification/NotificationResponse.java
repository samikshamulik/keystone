package com.meridian.keystone.dto.notification;

import com.meridian.keystone.domain.Notification;

import java.time.Instant;

public record NotificationResponse(
        Long id,
        String type,
        String title,
        String message,
        Long workOrderId,
        String workOrderCode,
        boolean read,
        Instant createdAt
) {
    public static NotificationResponse from(Notification n) {
        return new NotificationResponse(
                n.getId(),
                n.getType(),
                n.getTitle(),
                n.getMessage(),
                n.getWorkOrder() == null ? null : n.getWorkOrder().getId(),
                n.getWorkOrder() == null ? null : n.getWorkOrder().getCode(),
                n.isRead(),
                n.getCreatedAt()
        );
    }
}
