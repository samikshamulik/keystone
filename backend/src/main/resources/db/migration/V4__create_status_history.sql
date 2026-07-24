-- V4: Work Order Status History (append-only audit trail)
CREATE TABLE work_order_status_history (
    id              BIGSERIAL PRIMARY KEY,
    work_order_id   BIGINT      NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    from_status     VARCHAR(30),
    to_status       VARCHAR(30) NOT NULL,
    changed_by_id   BIGINT      REFERENCES users(id) ON DELETE SET NULL,
    note            TEXT,
    changed_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE work_order_status_history IS 'Append-only; never edited or deleted';

CREATE INDEX idx_wosh_work_order ON work_order_status_history (work_order_id);
CREATE INDEX idx_wosh_changed_at ON work_order_status_history (changed_at);
