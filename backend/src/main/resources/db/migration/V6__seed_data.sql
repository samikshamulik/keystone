-- V6: Seed data — one user per role + sample customers/sites/parts
-- Passwords (BCrypt $2a$10$):
--   manager123    => $2a$10$xMIjsYZ7XG3D5JndZlFvj.TSpSN8uA3IiadgDDYNdQvHzd3c.ApgC
--   dispatcher123 => $2a$10$kTc/h4cqiOxk6YIgRrawr.C1Z1oa8v4tABCsQJsp.x/Ojnrzmz6Je
--   technician123 => $2a$10$FWHW6oMeGufjxHu2YwpDpOmMy8dekKB30FxwzfrOALfwz04pjBxc2
--   customer123   => $2a$10$jkEM5ltLv37Dh8NYI7lxSejfHHkNkMSec3FChp4B7fkytreUnupsm

INSERT INTO users (name, email, password, role) VALUES
  ('Alice Manager',    'manager@keystone.dev',    '$2a$10$xMIjsYZ7XG3D5JndZlFvj.TSpSN8uA3IiadgDDYNdQvHzd3c.ApgC', 'MANAGER'),
  ('Bob Dispatcher',   'dispatcher@keystone.dev', '$2a$10$kTc/h4cqiOxk6YIgRrawr.C1Z1oa8v4tABCsQJsp.x/Ojnrzmz6Je', 'DISPATCHER'),
  ('Carol Technician', 'technician@keystone.dev', '$2a$10$FWHW6oMeGufjxHu2YwpDpOmMy8dekKB30FxwzfrOALfwz04pjBxc2', 'TECHNICIAN'),
  ('David Customer',   'customer@keystone.dev',   '$2a$10$jkEM5ltLv37Dh8NYI7lxSejfHHkNkMSec3FChp4B7fkytreUnupsm', 'CUSTOMER');

-- Sample customer org linked to the customer portal user
INSERT INTO customers (name, email, phone, address, user_id)
VALUES ('Greenfield Corp', 'contact@greenfield.com', '+1-555-0100', '100 Commerce Blvd, New York',
        (SELECT id FROM users WHERE email = 'customer@keystone.dev'));

-- Sample sites
INSERT INTO sites (customer_id, name, address, city, postcode) VALUES
  ((SELECT id FROM customers WHERE email = 'contact@greenfield.com'),
   'HQ Tower',    '100 Commerce Blvd', 'New York', '10001'),
  ((SELECT id FROM customers WHERE email = 'contact@greenfield.com'),
   'Warehouse A', '45 Industrial Park', 'Newark',   '07101');

-- Sample parts inventory
INSERT INTO parts (name, part_number, unit_cost, stock_quantity) VALUES
  ('HVAC Air Filter',        'HVAC-AF-001',  25.00, 100),
  ('Electrical Breaker 20A', 'ELEC-BR-20A',  45.50,  50),
  ('Plumbing O-Ring Kit',    'PLMB-ORK-01',   8.75, 200),
  ('Thermostat Unit',        'HVAC-THERM-1', 120.00,  20),
  ('Copper Pipe 1/2"',       'PLMB-CP-05',    3.50, 500);
