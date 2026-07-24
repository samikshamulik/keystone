-- V3: Work Orders
CREATE TABLE work_orders (
    id              BIGSERIAL PRIMARY KEY,
    code            VARCHAR(30)         NOT NULL UNIQUE,
    title           VARCHAR(255)        NOT NULL,
    description     TEXT,
    priority        VARCHAR(20)         NOT NULL DEFAULT 'MEDIUM',
    status          VARCHAR(30)         NOT NULL DEFAULT 'NEW',
    customer_id     BIGINT              NOT NULL REFERENCES customers(id),
    site_id         BIGINT              NOT NULL REFERENCES sites(id),
    assignee_id     BIGINT              REFERENCES users(id) ON DELETE SET NULL,
    created_by_id   BIGINT              REFERENCES users(id) ON DELETE SET NULL,
    sla_due_at      TIMESTAMP WITH TIME ZONE,
    sla_breached    BOOLEAN             NOT NULL DEFAULT FALSE,
    completed_at    TIMESTAMP WITH TIME ZONE,
    closed_at       TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN work_orders.priority IS 'CRITICAL | HIGH | MEDIUM | LOW';
COMMENT ON COLUMN work_orders.status   IS 'NEW | ASSIGNED | IN_PROGRESS | ON_HOLD | COMPLETED | CLOSED | CANCELLED';
COMMENT ON COLUMN work_orders.code     IS 'Human-readable WO code, e.g. WO-0001';

CREATE INDEX idx_wo_status      ON work_orders (status);
CREATE INDEX idx_wo_customer    ON work_orders (customer_id);
CREATE INDEX idx_wo_site        ON work_orders (site_id);
CREATE INDEX idx_wo_assignee    ON work_orders (assignee_id);
CREATE INDEX idx_wo_sla_due     ON work_orders (sla_due_at);
CREATE INDEX idx_wo_sla_breached ON work_orders (sla_breached);

-- Sequence for generating WO codes
CREATE SEQUENCE wo_code_seq START 1;
