-- V9: Rich Indian seed data for realistic demo
-- Additional users (technicians + dispatchers)
-- Passwords: all use "password123" => $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi

INSERT INTO users (name, email, password, role) VALUES
  ('Rajesh Kumar',     'rajesh.kumar@keystone.dev',    '$2a$10$FWHW6oMeGufjxHu2YwpDpOmMy8dekKB30FxwzfrOALfwz04pjBxc2', 'TECHNICIAN'),
  ('Priya Sharma',     'priya.sharma@keystone.dev',    '$2a$10$FWHW6oMeGufjxHu2YwpDpOmMy8dekKB30FxwzfrOALfwz04pjBxc2', 'TECHNICIAN'),
  ('Amit Verma',       'amit.verma@keystone.dev',      '$2a$10$FWHW6oMeGufjxHu2YwpDpOmMy8dekKB30FxwzfrOALfwz04pjBxc2', 'TECHNICIAN'),
  ('Sunita Patel',     'sunita.patel@keystone.dev',    '$2a$10$kTc/h4cqiOxk6YIgRrawr.C1Z1oa8v4tABCsQJsp.x/Ojnrzmz6Je', 'DISPATCHER'),
  ('Vikram Singh',     'vikram.singh@keystone.dev',    '$2a$10$jkEM5ltLv37Dh8NYI7lxSejfHHkNkMSec3FChp4B7fkytreUnupsm', 'CUSTOMER'),
  ('Meera Nair',       'meera.nair@keystone.dev',      '$2a$10$jkEM5ltLv37Dh8NYI7lxSejfHHkNkMSec3FChp4B7fkytreUnupsm', 'CUSTOMER');

-- Additional customers
INSERT INTO customers (name, email, phone, address, user_id) VALUES
  ('Tata Consultancy Services', 'facilities@tcs.com',      '+91-22-6778-9999', 'TCS House, Raveline St, Fort, Mumbai 400001',
    (SELECT id FROM users WHERE email = 'vikram.singh@keystone.dev')),
  ('Infosys Ltd',               'admin@infosys-facility.com', '+91-80-2852-0261', 'Electronics City Phase 1, Bengaluru 560100',
    (SELECT id FROM users WHERE email = 'meera.nair@keystone.dev')),
  ('Reliance Industries',       'facilities@reliance.com',  '+91-22-3555-5000', 'Maker Chambers IV, Nariman Point, Mumbai 400021',
    NULL);

-- Sites for TCS
INSERT INTO sites (customer_id, name, address, city, postcode) VALUES
  ((SELECT id FROM customers WHERE email = 'facilities@tcs.com'),
   'TCS Mumbai HQ',         'TCS House, Raveline St, Fort',   'Mumbai',    '400001'),
  ((SELECT id FROM customers WHERE email = 'facilities@tcs.com'),
   'TCS Pune Campus',       'Hinjewadi IT Park, Phase 2',     'Pune',      '411057'),
  ((SELECT id FROM customers WHERE email = 'facilities@tcs.com'),
   'TCS Chennai SEZ',       'Sholinganallur, OMR',            'Chennai',   '600119');

-- Sites for Infosys
INSERT INTO sites (customer_id, name, address, city, postcode) VALUES
  ((SELECT id FROM customers WHERE email = 'admin@infosys-facility.com'),
   'Infosys EC Phase 1',    'Electronics City Phase 1',       'Bengaluru', '560100'),
  ((SELECT id FROM customers WHERE email = 'admin@infosys-facility.com'),
   'Infosys Mysore Campus', 'Infosys Campus, Mysore Rd',      'Mysore',    '570010');

-- Sites for Reliance
INSERT INTO sites (customer_id, name, address, city, postcode) VALUES
  ((SELECT id FROM customers WHERE email = 'facilities@reliance.com'),
   'RIL Nariman Point',     'Maker Chambers IV, Nariman Point', 'Mumbai',  '400021'),
  ((SELECT id FROM customers WHERE email = 'facilities@reliance.com'),
   'RIL Jamnagar Refinery', 'Jamnagar Refinery Complex',        'Jamnagar','361142');

-- Additional parts
INSERT INTO parts (name, part_number, unit_cost, stock_quantity) VALUES
  ('Daikin AC Compressor',       'AC-COMP-001',  8500.00,  10),
  ('Copper Wire 2.5sqmm (100m)', 'WIRE-CU-25',    450.00,  80),
  ('MCB 32A Single Pole',        'MCB-32A-SP',    220.00, 150),
  ('PVC Conduit Pipe 25mm',      'PVC-PIPE-25',    35.00, 500),
  ('Exhaust Fan Motor 200W',     'FAN-MOT-200',  1200.00,  25),
  ('Water Pump 0.5HP',           'PUMP-05HP',    3200.00,  15),
  ('LED Panel 24W',              'LED-PNL-24W',   380.00, 200),
  ('RO Membrane 75GPD',          'RO-MEM-75G',    850.00,  40),
  ('Split AC Gas R32 (kg)',       'AC-GAS-R32',    350.00, 100),
  ('ELCB 63A Double Pole',       'ELCB-63A-DP',   780.00,  60);
