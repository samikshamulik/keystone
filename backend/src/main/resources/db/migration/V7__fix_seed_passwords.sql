-- V7: Fix seed user passwords to correctly BCrypt-hashed values
-- (V6 had incorrect pre-generated hashes; this replaces them)

UPDATE users SET password = '$2a$10$xMIjsYZ7XG3D5JndZlFvj.TSpSN8uA3IiadgDDYNdQvHzd3c.ApgC'
WHERE email = 'manager@keystone.dev';

UPDATE users SET password = '$2a$10$kTc/h4cqiOxk6YIgRrawr.C1Z1oa8v4tABCsQJsp.x/Ojnrzmz6Je'
WHERE email = 'dispatcher@keystone.dev';

UPDATE users SET password = '$2a$10$FWHW6oMeGufjxHu2YwpDpOmMy8dekKB30FxwzfrOALfwz04pjBxc2'
WHERE email = 'technician@keystone.dev';

UPDATE users SET password = '$2a$10$jkEM5ltLv37Dh8NYI7lxSejfHHkNkMSec3FChp4B7fkytreUnupsm'
WHERE email = 'customer@keystone.dev';
