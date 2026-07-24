-- V2: Customers and Sites
CREATE TABLE customers (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(255)        NOT NULL,
    email       VARCHAR(255)        NOT NULL UNIQUE,
    phone       VARCHAR(50),
    address     TEXT,
    user_id     BIGINT              REFERENCES users(id) ON DELETE SET NULL,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  customers         IS 'Organisations Meridian serves';
COMMENT ON COLUMN customers.user_id IS 'Portal user account linked to this customer org';

CREATE TABLE sites (
    id          BIGSERIAL PRIMARY KEY,
    customer_id BIGINT              NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    name        VARCHAR(255)        NOT NULL,
    address     TEXT                NOT NULL,
    city        VARCHAR(100),
    postcode    VARCHAR(20),
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sites_customer ON sites (customer_id);
