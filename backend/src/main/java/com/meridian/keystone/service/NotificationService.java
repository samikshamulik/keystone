package com.meridian.keystone.service;

import com.meridian.keystone.domain.Notification;
import com.meridian.keystone.domain.User;
import com.meridian.keystone.domain.WorkOrder;
import com.meridian.keystone.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository repo;

    public NotificationService(NotificationRepository repo) {
        this.repo = repo;
    }

    public List<Notification> getForUser(Long userId) {
        return repo.findAllByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getUnreadForUser(Long userId) {
        return repo.findAllByUserIdAndReadFalseOrderByCreatedAtDesc(userId);
    }

    public long countUnread(Long userId) {
        return repo.countByUserIdAndReadFalse(userId);
    }

    @Transactional
    public void markAllRead(Long userId) {
        repo.markAllReadForUser(userId);
    }

    @Transactional
    public void notifyAssignment(WorkOrder wo, User technician) {
        Notification n = Notification.builder()
                .user(technician)
                .type("ASSIGNMENT")
                .title("New work order assigned: " + wo.getCode())
                .message("You have been assigned work order %s — %s (%s priority). Site: %s."
                        .formatted(wo.getCode(), wo.getTitle(), wo.getPriority(), wo.getSite().getName()))
                .workOrder(wo)
                .build();
        repo.save(n);
        log.info("NOTIFICATION [ASSIGNMENT] → user={} wo={}", technician.getEmail(), wo.getCode());
    }

    @Transactional
    public void notifySlaBreached(WorkOrder wo) {
        // Notify the assignee (if any) and log — managers see it on dashboard
        if (wo.getAssignee() != null) {
            Notification n = Notification.builder()
                    .user(wo.getAssignee())
                    .type("SLA_BREACH")
                    .title("SLA breached: " + wo.getCode())
                    .message("Work order %s — %s has breached its SLA. Immediate attention required."
                            .formatted(wo.getCode(), wo.getTitle()))
                    .workOrder(wo)
                    .build();
            repo.save(n);
        }
        log.warn("NOTIFICATION [SLA_BREACH] wo={} priority={} slaAt={}",
                wo.getCode(), wo.getPriority(), wo.getSlaDueAt());
    }
}
