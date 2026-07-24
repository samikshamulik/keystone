package com.meridian.keystone.domain;

import java.util.Set;

public enum WorkOrderStatus {
    NEW,
    ASSIGNED,
    IN_PROGRESS,
    ON_HOLD,
    COMPLETED,
    CLOSED,
    CANCELLED;

    public boolean isTerminal() {
        return this == CLOSED || this == CANCELLED;
    }

    /**
     * Returns true if transitioning from {@code this} to {@code target} is permitted.
     * Role restrictions are enforced separately in the service layer.
     */
    public boolean canTransitionTo(WorkOrderStatus target) {
        return ALLOWED_TRANSITIONS.getOrDefault(this, Set.of()).contains(target);
    }

    private static final java.util.Map<WorkOrderStatus, Set<WorkOrderStatus>> ALLOWED_TRANSITIONS =
            java.util.Map.of(
                    NEW,         Set.of(ASSIGNED, CANCELLED),
                    ASSIGNED,    Set.of(IN_PROGRESS, ON_HOLD, CANCELLED),
                    IN_PROGRESS, Set.of(ON_HOLD, COMPLETED, CANCELLED),
                    ON_HOLD,     Set.of(IN_PROGRESS, CANCELLED),
                    COMPLETED,   Set.of(CLOSED, CANCELLED),
                    CLOSED,      Set.of(),      // terminal
                    CANCELLED,   Set.of()        // terminal
            );
}
