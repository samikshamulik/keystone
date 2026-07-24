package com.meridian.keystone.controller;

import com.meridian.keystone.dto.notification.NotificationResponse;
import com.meridian.keystone.security.KeystonePrincipal;
import com.meridian.keystone.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notifications", description = "In-app notifications for assignments and SLA breaches")
@SecurityRequirement(name = "bearerAuth")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    @Operation(summary = "Get all notifications for the current user")
    public List<NotificationResponse> getAll(@AuthenticationPrincipal KeystonePrincipal principal) {
        return notificationService.getForUser(principal.userId()).stream()
                .map(NotificationResponse::from).toList();
    }

    @GetMapping("/unread")
    @Operation(summary = "Get unread notifications for the current user")
    public List<NotificationResponse> getUnread(@AuthenticationPrincipal KeystonePrincipal principal) {
        return notificationService.getUnreadForUser(principal.userId()).stream()
                .map(NotificationResponse::from).toList();
    }

    @GetMapping("/count")
    @Operation(summary = "Get unread notification count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @AuthenticationPrincipal KeystonePrincipal principal) {
        return ResponseEntity.ok(Map.of("unread", notificationService.countUnread(principal.userId())));
    }

    @PostMapping("/mark-read")
    @Operation(summary = "Mark all notifications as read")
    public ResponseEntity<Void> markAllRead(@AuthenticationPrincipal KeystonePrincipal principal) {
        notificationService.markAllRead(principal.userId());
        return ResponseEntity.noContent().build();
    }
}
