INSERT OR IGNORE INTO customers (id, name, email, country, segment)
VALUES
  ('cust-ministry-jm', 'Ministry of National Security', 'ops@mns.gov.jm', 'Jamaica', 'Education'),
  ('cust-port-tt', 'Port Authority Operations', 'coordination@portauthority.tt', 'Trinidad & Tobago', 'Wholesale'),
  ('cust-customs-bb', 'Customs Modernization Unit', 'systems@customs.gov.bb', 'Barbados', 'Retail'),
  ('cust-border-gy', 'Border Security Secretariat', 'liaison@bordersec.gov.gy', 'Guyana', 'Wholesale'),
  ('cust-training-bz', 'Regional Training Centre', 'programs@rtc.gov.bz', 'Belize', 'Education');

INSERT OR IGNORE INTO products (id, name, category, unit_price, stock, status)
VALUES
  ('prod-watchlist', 'Regional Watchlist Platform', 'Intelligence', 18500, 12, 'Active'),
  ('prod-screening', 'Passenger Screening Desk', 'Border Operations', 12400, 18, 'Active'),
  ('prod-training', 'Analyst Training Cohort', 'Training', 8200, 30, 'Active'),
  ('prod-audit', 'Compliance Audit Package', 'Compliance', 6400, 9, 'Active'),
  ('prod-api', 'Secure Data Exchange API', 'Infrastructure', 21200, 6, 'Active'),
  ('prod-archive', 'Case Archive Migration', 'Infrastructure', 9800, 0, 'Paused');

INSERT OR IGNORE INTO orders (id, customer_id, product_id, order_date, status, quantity, total_amount, region)
VALUES
  ('ord-1001', 'cust-ministry-jm', 'prod-watchlist', '2026-01-18', 'Completed', 1, 18500, 'Jamaica'),
  ('ord-1002', 'cust-port-tt', 'prod-screening', '2026-02-05', 'Completed', 2, 24800, 'Trinidad & Tobago'),
  ('ord-1003', 'cust-customs-bb', 'prod-training', '2026-02-22', 'Completed', 3, 24600, 'Barbados'),
  ('ord-1004', 'cust-border-gy', 'prod-api', '2026-03-07', 'In Review', 1, 21200, 'Guyana'),
  ('ord-1005', 'cust-training-bz', 'prod-training', '2026-03-20', 'Completed', 2, 16400, 'Belize'),
  ('ord-1006', 'cust-ministry-jm', 'prod-audit', '2026-04-12', 'Pending', 1, 6400, 'Jamaica'),
  ('ord-1007', 'cust-port-tt', 'prod-api', '2026-04-26', 'Completed', 1, 21200, 'Trinidad & Tobago'),
  ('ord-1008', 'cust-customs-bb', 'prod-screening', '2026-05-09', 'Completed', 1, 12400, 'Barbados'),
  ('ord-1009', 'cust-border-gy', 'prod-watchlist', '2026-05-21', 'In Review', 1, 18500, 'Guyana'),
  ('ord-1010', 'cust-training-bz', 'prod-audit', '2026-06-02', 'Pending', 2, 12800, 'Belize');
