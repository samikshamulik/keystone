-- V10: Indian work orders with realistic scenarios
-- Get IDs dynamically using subqueries

-- Helper: WO code sequence continues from existing

-- WORK ORDER 1: TCS Mumbai - AC not cooling in server room (CRITICAL, IN_PROGRESS)
INSERT INTO work_orders (code, title, description, priority, status, customer_id, site_id, assignee_id, created_by_id, sla_due_at, sla_breached)
VALUES (
  'WO-1001',
  'Server Room AC Failure - Block A',
  'Primary HVAC unit in Server Room Block A has stopped cooling. Room temperature has risen to 32°C. Critical servers at risk of thermal shutdown. Immediate attention required.',
  'CRITICAL', 'IN_PROGRESS',
  (SELECT id FROM customers WHERE email = 'facilities@tcs.com'),
  (SELECT id FROM sites WHERE name = 'TCS Mumbai HQ'),
  (SELECT id FROM users WHERE email = 'rajesh.kumar@keystone.dev'),
  (SELECT id FROM users WHERE email = 'dispatcher@keystone.dev'),
  NOW() + INTERVAL '2 hours',
  false
);

INSERT INTO work_order_status_history (work_order_id, from_status, to_status, changed_by_id, note, changed_at) VALUES
  ((SELECT id FROM work_orders WHERE code='WO-1001'), NULL,        'NEW',         (SELECT id FROM users WHERE email='dispatcher@keystone.dev'),   'Raised on emergency call from TCS NOC team',         NOW() - INTERVAL '3 hours'),
  ((SELECT id FROM work_orders WHERE code='WO-1001'), 'NEW',       'ASSIGNED',    (SELECT id FROM users WHERE email='dispatcher@keystone.dev'),   'Assigned to Rajesh Kumar - nearest available tech',  NOW() - INTERVAL '2 hours 45 minutes'),
  ((SELECT id FROM work_orders WHERE code='WO-1001'), 'ASSIGNED',  'IN_PROGRESS', (SELECT id FROM users WHERE email='rajesh.kumar@keystone.dev'), 'On-site. Inspecting compressor and refrigerant levels', NOW() - INTERVAL '2 hours');

INSERT INTO time_logs (work_order_id, technician_id, minutes, note, logged_at) VALUES
  ((SELECT id FROM work_orders WHERE code='WO-1001'), (SELECT id FROM users WHERE email='rajesh.kumar@keystone.dev'), 45, 'Initial diagnosis - compressor failure confirmed', NOW() - INTERVAL '1 hour 30 minutes');

-- WORK ORDER 2: TCS Pune - Electrical panel tripping (HIGH, ASSIGNED)
INSERT INTO work_orders (code, title, description, priority, status, customer_id, site_id, assignee_id, created_by_id, sla_due_at, sla_breached)
VALUES (
  'WO-1002',
  'Main DB Panel Tripping - Floor 4',
  'Main distribution board on Floor 4 keeps tripping every 2-3 hours. Affecting 40+ workstations. Electrician needed to check load balancing and MCB ratings.',
  'HIGH', 'ASSIGNED',
  (SELECT id FROM customers WHERE email = 'facilities@tcs.com'),
  (SELECT id FROM sites WHERE name = 'TCS Pune Campus'),
  (SELECT id FROM users WHERE email = 'amit.verma@keystone.dev'),
  (SELECT id FROM users WHERE email = 'sunita.patel@keystone.dev'),
  NOW() + INTERVAL '5 hours',
  false
);

INSERT INTO work_order_status_history (work_order_id, from_status, to_status, changed_by_id, note, changed_at) VALUES
  ((SELECT id FROM work_orders WHERE code='WO-1002'), NULL,  'NEW',      (SELECT id FROM users WHERE email='sunita.patel@keystone.dev'),  'Logged via helpdesk ticket #45892', NOW() - INTERVAL '4 hours'),
  ((SELECT id FROM work_orders WHERE code='WO-1002'), 'NEW', 'ASSIGNED', (SELECT id FROM users WHERE email='sunita.patel@keystone.dev'),  'Amit Verma to visit Pune campus tomorrow morning', NOW() - INTERVAL '3 hours 30 minutes');

-- WORK ORDER 3: Infosys Bengaluru - Water leakage (HIGH, ON_HOLD)
INSERT INTO work_orders (code, title, description, priority, status, customer_id, site_id, assignee_id, created_by_id, sla_due_at, sla_breached)
VALUES (
  'WO-1003',
  'Plumbing Leakage - Cafeteria Ceiling',
  'Water dripping from cafeteria ceiling near the main serving counter. Suspected burst pipe on 2nd floor restroom. Area cordoned off. Waiting for building NOC permit.',
  'HIGH', 'ON_HOLD',
  (SELECT id FROM customers WHERE email = 'admin@infosys-facility.com'),
  (SELECT id FROM sites WHERE name = 'Infosys EC Phase 1'),
  (SELECT id FROM users WHERE email = 'priya.sharma@keystone.dev'),
  (SELECT id FROM users WHERE email = 'dispatcher@keystone.dev'),
  NOW() - INTERVAL '1 hour',
  true
);

INSERT INTO work_order_status_history (work_order_id, from_status, to_status, changed_by_id, note, changed_at) VALUES
  ((SELECT id FROM work_orders WHERE code='WO-1003'), NULL,        'NEW',         (SELECT id FROM users WHERE email='dispatcher@keystone.dev'),   'Emergency report from facility manager',            NOW() - INTERVAL '10 hours'),
  ((SELECT id FROM work_orders WHERE code='WO-1003'), 'NEW',       'ASSIGNED',    (SELECT id FROM users WHERE email='dispatcher@keystone.dev'),   'Priya Sharma dispatched',                           NOW() - INTERVAL '9 hours 30 minutes'),
  ((SELECT id FROM work_orders WHERE code='WO-1003'), 'ASSIGNED',  'IN_PROGRESS', (SELECT id FROM users WHERE email='priya.sharma@keystone.dev'), 'On site. Confirmed burst pipe above false ceiling',  NOW() - INTERVAL '9 hours'),
  ((SELECT id FROM work_orders WHERE code='WO-1003'), 'IN_PROGRESS','ON_HOLD',    (SELECT id FROM users WHERE email='priya.sharma@keystone.dev'), 'On hold - waiting for building NOC permit and pipe fitting parts delivery', NOW() - INTERVAL '7 hours');

INSERT INTO time_logs (work_order_id, technician_id, minutes, note, logged_at) VALUES
  ((SELECT id FROM work_orders WHERE code='WO-1003'), (SELECT id FROM users WHERE email='priya.sharma@keystone.dev'), 60, 'Site inspection and damage assessment', NOW() - INTERVAL '8 hours');

INSERT INTO part_usages (work_order_id, part_id, quantity, unit_cost_at_use, logged_by_id, logged_at) VALUES
  ((SELECT id FROM work_orders WHERE code='WO-1003'), (SELECT id FROM parts WHERE part_number='PLMB-ORK-01'), 5, 8.75, (SELECT id FROM users WHERE email='priya.sharma@keystone.dev'), NOW() - INTERVAL '8 hours');

UPDATE parts SET stock_quantity = stock_quantity - 5 WHERE part_number = 'PLMB-ORK-01';

-- WORK ORDER 4: Infosys Mysore - Generator maintenance (MEDIUM, COMPLETED)
INSERT INTO work_orders (code, title, description, priority, status, customer_id, site_id, assignee_id, created_by_id, sla_due_at, completed_at, sla_breached)
VALUES (
  'WO-1004',
  'DG Set Scheduled Maintenance - Block B',
  'Quarterly preventive maintenance for 500KVA Cummins diesel generator. Oil change, filter replacement, load testing required.',
  'MEDIUM', 'COMPLETED',
  (SELECT id FROM customers WHERE email = 'admin@infosys-facility.com'),
  (SELECT id FROM sites WHERE name = 'Infosys Mysore Campus'),
  (SELECT id FROM users WHERE email = 'rajesh.kumar@keystone.dev'),
  (SELECT id FROM users WHERE email = 'sunita.patel@keystone.dev'),
  NOW() - INTERVAL '2 hours',
  NOW() - INTERVAL '3 hours',
  false
);

INSERT INTO work_order_status_history (work_order_id, from_status, to_status, changed_by_id, note, changed_at) VALUES
  ((SELECT id FROM work_orders WHERE code='WO-1004'), NULL,        'NEW',         (SELECT id FROM users WHERE email='sunita.patel@keystone.dev'),   'Scheduled quarterly PM',                        NOW() - INTERVAL '2 days'),
  ((SELECT id FROM work_orders WHERE code='WO-1004'), 'NEW',       'ASSIGNED',    (SELECT id FROM users WHERE email='sunita.patel@keystone.dev'),   'Rajesh Kumar to handle',                        NOW() - INTERVAL '1 day 20 hours'),
  ((SELECT id FROM work_orders WHERE code='WO-1004'), 'ASSIGNED',  'IN_PROGRESS', (SELECT id FROM users WHERE email='rajesh.kumar@keystone.dev'),   'Started maintenance. Oil drained',              NOW() - INTERVAL '5 hours'),
  ((SELECT id FROM work_orders WHERE code='WO-1004'), 'IN_PROGRESS','COMPLETED',  (SELECT id FROM users WHERE email='rajesh.kumar@keystone.dev'),   'PM complete. Load test passed. DG ready.',      NOW() - INTERVAL '3 hours');

INSERT INTO time_logs (work_order_id, technician_id, minutes, note, logged_at) VALUES
  ((SELECT id FROM work_orders WHERE code='WO-1004'), (SELECT id FROM users WHERE email='rajesh.kumar@keystone.dev'), 120, 'Full PM including oil change and load test', NOW() - INTERVAL '3 hours');

-- WORK ORDER 5: Reliance - LED lighting upgrade (MEDIUM, NEW)
INSERT INTO work_orders (code, title, description, priority, status, customer_id, site_id, created_by_id, sla_due_at, sla_breached)
VALUES (
  'WO-1005',
  'LED Lighting Upgrade - Conference Rooms 1-5',
  'Replace old fluorescent tube lights with 24W LED panels in all 5 conference rooms on 3rd floor. Total 60 fixtures to be replaced. Work to be done during non-business hours.',
  'MEDIUM', 'NEW',
  (SELECT id FROM customers WHERE email = 'facilities@reliance.com'),
  (SELECT id FROM sites WHERE name = 'RIL Nariman Point'),
  (SELECT id FROM users WHERE email = 'dispatcher@keystone.dev'),
  NOW() + INTERVAL '20 hours',
  false
);

INSERT INTO work_order_status_history (work_order_id, from_status, to_status, changed_by_id, note, changed_at) VALUES
  ((SELECT id FROM work_orders WHERE code='WO-1005'), NULL, 'NEW', (SELECT id FROM users WHERE email='dispatcher@keystone.dev'), 'Planned upgrade - approved by RIL facilities head', NOW() - INTERVAL '2 hours');

-- WORK ORDER 6: TCS Chennai - RO water purifier service (LOW, CLOSED)
INSERT INTO work_orders (code, title, description, priority, status, customer_id, site_id, assignee_id, created_by_id, sla_due_at, completed_at, closed_at, sla_breached)
VALUES (
  'WO-1006',
  'RO Water Purifier Service - Pantry Block C',
  'Annual service of 5 RO water purifiers in Pantry Block C. Membrane replacement and filter cleaning.',
  'LOW', 'CLOSED',
  (SELECT id FROM customers WHERE email = 'facilities@tcs.com'),
  (SELECT id FROM sites WHERE name = 'TCS Chennai SEZ'),
  (SELECT id FROM users WHERE email = 'amit.verma@keystone.dev'),
  (SELECT id FROM users WHERE email = 'sunita.patel@keystone.dev'),
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day 2 hours',
  NOW() - INTERVAL '22 hours',
  false
);

INSERT INTO work_order_status_history (work_order_id, from_status, to_status, changed_by_id, note, changed_at) VALUES
  ((SELECT id FROM work_orders WHERE code='WO-1006'), NULL,        'NEW',         (SELECT id FROM users WHERE email='sunita.patel@keystone.dev'),  'Annual service schedule',                 NOW() - INTERVAL '3 days'),
  ((SELECT id FROM work_orders WHERE code='WO-1006'), 'NEW',       'ASSIGNED',    (SELECT id FROM users WHERE email='sunita.patel@keystone.dev'),  'Amit Verma assigned',                     NOW() - INTERVAL '2 days 20 hours'),
  ((SELECT id FROM work_orders WHERE code='WO-1006'), 'ASSIGNED',  'IN_PROGRESS', (SELECT id FROM users WHERE email='amit.verma@keystone.dev'),   'On site, started membrane replacement',   NOW() - INTERVAL '1 day 5 hours'),
  ((SELECT id FROM work_orders WHERE code='WO-1006'), 'IN_PROGRESS','COMPLETED',  (SELECT id FROM users WHERE email='amit.verma@keystone.dev'),   'All 5 units serviced and tested OK',      NOW() - INTERVAL '1 day 2 hours'),
  ((SELECT id FROM work_orders WHERE code='WO-1006'), 'COMPLETED', 'CLOSED',      (SELECT id FROM users WHERE email='manager@keystone.dev'),       'Signed off by TCS facilities manager Ramesh Iyer', NOW() - INTERVAL '22 hours');

INSERT INTO time_logs (work_order_id, technician_id, minutes, note, logged_at) VALUES
  ((SELECT id FROM work_orders WHERE code='WO-1006'), (SELECT id FROM users WHERE email='amit.verma@keystone.dev'), 180, 'Service all 5 RO units - membrane + filters', NOW() - INTERVAL '1 day 3 hours');

INSERT INTO part_usages (work_order_id, part_id, quantity, unit_cost_at_use, logged_by_id, logged_at) VALUES
  ((SELECT id FROM work_orders WHERE code='WO-1006'), (SELECT id FROM parts WHERE part_number='RO-MEM-75G'), 5, 850.00, (SELECT id FROM users WHERE email='amit.verma@keystone.dev'), NOW() - INTERVAL '1 day 3 hours');

UPDATE parts SET stock_quantity = stock_quantity - 5 WHERE part_number = 'RO-MEM-75G';

-- WORK ORDER 7: Infosys - Exhaust fan breakdown (HIGH, ASSIGNED)
INSERT INTO work_orders (code, title, description, priority, status, customer_id, site_id, assignee_id, created_by_id, sla_due_at, sla_breached)
VALUES (
  'WO-1007',
  'Exhaust Fan Failure - Server Room B2',
  'Exhaust fan in Server Room B2 has stopped. Backup cooling insufficient. Fan motor needs replacement.',
  'HIGH', 'ASSIGNED',
  (SELECT id FROM customers WHERE email = 'admin@infosys-facility.com'),
  (SELECT id FROM sites WHERE name = 'Infosys EC Phase 1'),
  (SELECT id FROM users WHERE email = 'priya.sharma@keystone.dev'),
  (SELECT id FROM users WHERE email = 'dispatcher@keystone.dev'),
  NOW() + INTERVAL '6 hours',
  false
);

INSERT INTO work_order_status_history (work_order_id, from_status, to_status, changed_by_id, note, changed_at) VALUES
  ((SELECT id FROM work_orders WHERE code='WO-1007'), NULL,  'NEW',      (SELECT id FROM users WHERE email='dispatcher@keystone.dev'), 'Reported by data center ops team',         NOW() - INTERVAL '1 hour'),
  ((SELECT id FROM work_orders WHERE code='WO-1007'), 'NEW', 'ASSIGNED', (SELECT id FROM users WHERE email='dispatcher@keystone.dev'), 'Priya Sharma assigned after WO-1003 site', NOW() - INTERVAL '30 minutes');

-- WORK ORDER 8: Reliance Jamnagar - AC gas top-up (CRITICAL, IN_PROGRESS)
INSERT INTO work_orders (code, title, description, priority, status, customer_id, site_id, assignee_id, created_by_id, sla_due_at, sla_breached)
VALUES (
  'WO-1008',
  'Chiller Plant Gas Leakage - Unit 3',
  'Refrigerant gas leakage detected in Chiller Unit 3 at Jamnagar. Control room temperature rising. Requires immediate R32 gas top-up and leak repair.',
  'CRITICAL', 'IN_PROGRESS',
  (SELECT id FROM customers WHERE email = 'facilities@reliance.com'),
  (SELECT id FROM sites WHERE name = 'RIL Jamnagar Refinery'),
  (SELECT id FROM users WHERE email = 'amit.verma@keystone.dev'),
  (SELECT id FROM users WHERE email = 'manager@keystone.dev'),
  NOW() + INTERVAL '1 hour',
  false
);

INSERT INTO work_order_status_history (work_order_id, from_status, to_status, changed_by_id, note, changed_at) VALUES
  ((SELECT id FROM work_orders WHERE code='WO-1008'), NULL,       'NEW',         (SELECT id FROM users WHERE email='manager@keystone.dev'),   'Emergency escalated from plant ops',         NOW() - INTERVAL '2 hours'),
  ((SELECT id FROM work_orders WHERE code='WO-1008'), 'NEW',      'ASSIGNED',    (SELECT id FROM users WHERE email='manager@keystone.dev'),   'Amit Verma deployed to Jamnagar site',       NOW() - INTERVAL '1 hour 50 minutes'),
  ((SELECT id FROM work_orders WHERE code='WO-1008'), 'ASSIGNED', 'IN_PROGRESS', (SELECT id FROM users WHERE email='amit.verma@keystone.dev'),'On site. Leak detected at condenser outlet.  Repair in progress', NOW() - INTERVAL '1 hour');

INSERT INTO time_logs (work_order_id, technician_id, minutes, note, logged_at) VALUES
  ((SELECT id FROM work_orders WHERE code='WO-1008'), (SELECT id FROM users WHERE email='amit.verma@keystone.dev'), 60, 'Leak detection and partial repair', NOW() - INTERVAL '30 minutes');

INSERT INTO part_usages (work_order_id, part_id, quantity, unit_cost_at_use, logged_by_id, logged_at) VALUES
  ((SELECT id FROM work_orders WHERE code='WO-1008'), (SELECT id FROM parts WHERE part_number='AC-GAS-R32'), 4, 350.00, (SELECT id FROM users WHERE email='amit.verma@keystone.dev'), NOW() - INTERVAL '30 minutes');

UPDATE parts SET stock_quantity = stock_quantity - 4 WHERE part_number = 'AC-GAS-R32';

-- WORK ORDER 9: TCS Mumbai - cancelled (overbooked)
INSERT INTO work_orders (code, title, description, priority, status, customer_id, site_id, created_by_id, sla_due_at, sla_breached)
VALUES (
  'WO-1009',
  'UPS Battery Replacement - Finance Floor',
  'UPS batteries on Finance floor have aged. Scheduled replacement during weekend downtime window.',
  'LOW', 'CANCELLED',
  (SELECT id FROM customers WHERE email = 'facilities@tcs.com'),
  (SELECT id FROM sites WHERE name = 'TCS Mumbai HQ'),
  (SELECT id FROM users WHERE email = 'sunita.patel@keystone.dev'),
  NOW() + INTERVAL '3 days',
  false
);

INSERT INTO work_order_status_history (work_order_id, from_status, to_status, changed_by_id, note, changed_at) VALUES
  ((SELECT id FROM work_orders WHERE code='WO-1009'), NULL,  'NEW',       (SELECT id FROM users WHERE email='sunita.patel@keystone.dev'), 'Planned replacement',                          NOW() - INTERVAL '5 hours'),
  ((SELECT id FROM work_orders WHERE code='WO-1009'), 'NEW', 'CANCELLED', (SELECT id FROM users WHERE email='manager@keystone.dev'),      'Cancelled - TCS has deferred weekend maintenance window to next month', NOW() - INTERVAL '3 hours');

-- Notifications for the seed data
INSERT INTO notifications (user_id, type, title, message, work_order_id, read, created_at) VALUES
  ((SELECT id FROM users WHERE email='rajesh.kumar@keystone.dev'),
   'ASSIGNMENT', 'New work order assigned: WO-1001',
   'You have been assigned WO-1001 — Server Room AC Failure - Block A (CRITICAL priority). Site: TCS Mumbai HQ.',
   (SELECT id FROM work_orders WHERE code='WO-1001'), false, NOW() - INTERVAL '2 hours 45 minutes'),

  ((SELECT id FROM users WHERE email='amit.verma@keystone.dev'),
   'ASSIGNMENT', 'New work order assigned: WO-1002',
   'You have been assigned WO-1002 — Main DB Panel Tripping - Floor 4 (HIGH priority). Site: TCS Pune Campus.',
   (SELECT id FROM work_orders WHERE code='WO-1002'), false, NOW() - INTERVAL '3 hours 30 minutes'),

  ((SELECT id FROM users WHERE email='priya.sharma@keystone.dev'),
   'SLA_BREACH', 'SLA breached: WO-1003',
   'Work order WO-1003 — Plumbing Leakage - Cafeteria Ceiling has breached its SLA. Immediate attention required.',
   (SELECT id FROM work_orders WHERE code='WO-1003'), false, NOW() - INTERVAL '1 hour'),

  ((SELECT id FROM users WHERE email='rajesh.kumar@keystone.dev'),
   'ASSIGNMENT', 'New work order assigned: WO-1004',
   'You have been assigned WO-1004 — DG Set Scheduled Maintenance - Block B (MEDIUM priority). Site: Infosys Mysore Campus.',
   (SELECT id FROM work_orders WHERE code='WO-1004'), true, NOW() - INTERVAL '1 day 20 hours'),

  ((SELECT id FROM users WHERE email='priya.sharma@keystone.dev'),
   'ASSIGNMENT', 'New work order assigned: WO-1007',
   'You have been assigned WO-1007 — Exhaust Fan Failure - Server Room B2 (HIGH priority). Site: Infosys EC Phase 1.',
   (SELECT id FROM work_orders WHERE code='WO-1007'), false, NOW() - INTERVAL '30 minutes'),

  ((SELECT id FROM users WHERE email='amit.verma@keystone.dev'),
   'ASSIGNMENT', 'New work order assigned: WO-1008',
   'You have been assigned WO-1008 — Chiller Plant Gas Leakage - Unit 3 (CRITICAL priority). Site: RIL Jamnagar Refinery.',
   (SELECT id FROM work_orders WHERE code='WO-1008'), false, NOW() - INTERVAL '1 hour 50 minutes');
