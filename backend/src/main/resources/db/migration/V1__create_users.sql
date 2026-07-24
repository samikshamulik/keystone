-- V1: Users table
CREATE TABLE users (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(150)        NOT NULL,
    email       VARCHAR(255)        NOT NULL UNIQUE,
    password    VARCHAR(255)        NOT NULL,
    role        VARCHAR(30)         NOT NULL,
    enabled     BOOLEAN             NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_role  ON users (role);

COMMENT ON TABLE  users         IS 'Platform users — dispatcher, technician, manager, customer';
COMMENT ON COLUMN users.role    IS 'DISPATCHER | TECHNICIAN | MANAGER | CUSTOMER';
COMMENT ON COLUMN users.password IS 'BCrypt-hashed; never plain text';
