-- V8: In-app notifications
CREATE TABLE notifications (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            VARCHAR(50) NOT NULL,   -- ASSIGNMENT, SLA_BREACH, SLA_AT_RISK
    title           VARCHAR(255) NOT NULL,
    message         TEXT        NOT NULL,
    work_order_id   BIGINT      REFERENCES work_orders(id) ON DELETE CASCADE,
    read            BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user    ON notifications (user_id, read);
CREATE INDEX idx_notifications_wo      ON notifications (work_order_id);

COMMENT ON TABLE notifications IS 'In-app notifications for assignment and SLA breach events';
