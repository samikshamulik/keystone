package com.meridian.keystone.service;

import com.meridian.keystone.domain.Priority;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
public class SlaService {

    private final long criticalMinutes;
    private final long highMinutes;
    private final long mediumMinutes;
    private final long lowMinutes;

    public SlaService(
            @Value("${keystone.sla.critical-minutes:240}") long criticalMinutes,
            @Value("${keystone.sla.high-minutes:480}")     long highMinutes,
            @Value("${keystone.sla.medium-minutes:1440}")  long mediumMinutes,
            @Value("${keystone.sla.low-minutes:4320}")     long lowMinutes) {
        this.criticalMinutes = criticalMinutes;
        this.highMinutes     = highMinutes;
        this.mediumMinutes   = mediumMinutes;
        this.lowMinutes      = lowMinutes;
    }

    public Instant calculateDueDate(Priority priority) {
        return Instant.now().plus(minutesFor(priority), ChronoUnit.MINUTES);
    }

    public long minutesFor(Priority priority) {
        return switch (priority) {
            case CRITICAL -> criticalMinutes;
            case HIGH     -> highMinutes;
            case MEDIUM   -> mediumMinutes;
            case LOW      -> lowMinutes;
        };
    }
}
