package com.meridian.keystone;

import com.meridian.keystone.domain.WorkOrderStatus;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit test for the work-order state machine — no Spring context needed.
 */
class WorkOrderLifecycleTest {

    @Test
    void allowedTransitions() {
        assertThat(WorkOrderStatus.NEW.canTransitionTo(WorkOrderStatus.ASSIGNED)).isTrue();
        assertThat(WorkOrderStatus.ASSIGNED.canTransitionTo(WorkOrderStatus.IN_PROGRESS)).isTrue();
        assertThat(WorkOrderStatus.IN_PROGRESS.canTransitionTo(WorkOrderStatus.ON_HOLD)).isTrue();
        assertThat(WorkOrderStatus.ON_HOLD.canTransitionTo(WorkOrderStatus.IN_PROGRESS)).isTrue();
        assertThat(WorkOrderStatus.IN_PROGRESS.canTransitionTo(WorkOrderStatus.COMPLETED)).isTrue();
        assertThat(WorkOrderStatus.COMPLETED.canTransitionTo(WorkOrderStatus.CLOSED)).isTrue();
    }

    @Test
    void illegalTransitions() {
        assertThat(WorkOrderStatus.NEW.canTransitionTo(WorkOrderStatus.IN_PROGRESS)).isFalse();
        assertThat(WorkOrderStatus.NEW.canTransitionTo(WorkOrderStatus.CLOSED)).isFalse();
        assertThat(WorkOrderStatus.CLOSED.canTransitionTo(WorkOrderStatus.NEW)).isFalse();
        assertThat(WorkOrderStatus.CANCELLED.canTransitionTo(WorkOrderStatus.ASSIGNED)).isFalse();
        assertThat(WorkOrderStatus.COMPLETED.canTransitionTo(WorkOrderStatus.IN_PROGRESS)).isFalse();
    }

    @Test
    void terminalStates() {
        assertThat(WorkOrderStatus.CLOSED.isTerminal()).isTrue();
        assertThat(WorkOrderStatus.CANCELLED.isTerminal()).isTrue();
        assertThat(WorkOrderStatus.COMPLETED.isTerminal()).isFalse();
        assertThat(WorkOrderStatus.NEW.isTerminal()).isFalse();
    }
}
