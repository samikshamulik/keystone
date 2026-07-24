package com.meridian.keystone.service;

import com.meridian.keystone.domain.WorkOrder;
import com.meridian.keystone.repository.WorkOrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

/**
 * Scheduled job that marks work orders as SLA-breached when their due date has passed
 * and they are not yet in a terminal state.
 * Runs every 5 minutes.
 */
@Service
public class SlaBreachScheduler {

    private static final Logger log = LoggerFactory.getLogger(SlaBreachScheduler.class);

    private final WorkOrderRepository woRepo;
    private final NotificationService notificationService;

    public SlaBreachScheduler(WorkOrderRepository woRepo, NotificationService notificationService) {
        this.woRepo              = woRepo;
        this.notificationService = notificationService;
    }

    @Scheduled(fixedDelay = 5 * 60 * 1000)   // every 5 minutes
    @Transactional
    public void checkBreaches() {
        List<WorkOrder> overdue = woRepo.findUnmarkedBreaches(Instant.now());
        if (overdue.isEmpty()) return;

        overdue.forEach(wo -> {
            wo.setSlaBreached(true);
            notificationService.notifySlaBreached(wo);
            log.warn("SLA BREACH flagged: {} [{}] priority={} slaDue={}",
                    wo.getCode(), wo.getStatus(), wo.getPriority(), wo.getSlaDueAt());
        });
        woRepo.saveAll(overdue);
        log.info("SLA breach check: {} work order(s) marked as breached", overdue.size());
    }
}
