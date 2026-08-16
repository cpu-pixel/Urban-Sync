-- 1. Insert Organizations
INSERT INTO organizations (id, name, type, contact_email) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Water Supply & Sewerage Board', 'PUBLIC_UTILITY', 'ops@waterboard.gov'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Telecom Infrastructure Corp', 'PRIVATE_TELECOM', 'build@telecominfra.com'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Public Works Department', 'MUNICIPAL', 'roads@pwd.gov');

-- 2. Insert Projects
INSERT INTO projects (id, organization_id, title, description, utility_layer, status, budget_allocated, budget_spent, start_date, end_date) VALUES
('PRJ-2026-089', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'North Corridor Trunk Main Upgrade', 'Deep sewer trunk replacement.', 'L1_DEEP_SEWER', 'PLANNED', 4200000.00, 1344000.00, '2026-10-01', '2027-03-15'),
('PRJ-2026-104', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Downtown Fiber Backbone', 'High-density fiber optic conduit.', 'L3_DRY_UTILITY', 'PLANNED', 850000.00, 0.00, '2026-11-01', '2027-01-15'),
('PRJ-2026-112', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Main Ave Resurfacing', 'Asphalt milling and resurfacing.', 'L4_SURFACE_PAVING', 'PLANNED', 2100000.00, 0.00, '2027-04-01', '2027-06-30');

-- 3. Insert Spatial Geometry for Project 1 (North-South Trench)
INSERT INTO project_geometries (project_id, geom) VALUES
('PRJ-2026-089', ST_GeomFromText('LINESTRING(-122.414 37.776, -122.414 37.780)', 4326));

-- 4. Insert Spatial Geometry for Project 2 (East-West Trench that intersects Project 1 in space AND time)
-- This insertion will fire trigger_check_4d_clash()
INSERT INTO project_geometries (project_id, geom) VALUES
('PRJ-2026-104', ST_GeomFromText('LINESTRING(-122.415 37.778, -122.412 37.778)', 4326));