-- V5: Parts inventory and usage; time logs
CREATE TABLE parts (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(255)    NOT NULL,
    part_number     VARCHAR(100)    UNIQUE,
    unit_cost       NUMERIC(12, 2)  NOT NULL DEFAULT 0,
    stock_quantity  INTEGER         NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN parts.stock_quantity IS 'Cannot go negative — enforced by CHECK and service layer';

CREATE TABLE part_usages (
    id              BIGSERIAL PRIMARY KEY,
    work_order_id   BIGINT          NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    part_id         BIGINT          NOT NULL REFERENCES parts(id),
    quantity        INTEGER         NOT NULL CHECK (quantity > 0),
    unit_cost_at_use NUMERIC(12, 2) NOT NULL,
    logged_by_id    BIGINT          REFERENCES users(id) ON DELETE SET NULL,
    logged_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  part_usages IS 'Parts consumed per work order; stock decremented in same transaction';

CREATE INDEX idx_part_usages_wo   ON part_usages (work_order_id);
CREATE INDEX idx_part_usages_part ON part_usages (part_id);

CREATE TABLE time_logs (
    id              BIGSERIAL PRIMARY KEY,
    work_order_id   BIGINT          NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    technician_id   BIGINT          REFERENCES users(id) ON DELETE SET NULL,
    minutes         INTEGER         NOT NULL CHECK (minutes > 0),
    note            TEXT,
    logged_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_timelogs_wo   ON time_logs (work_order_id);
CREATE INDEX idx_timelogs_tech ON time_logs (technician_id);
