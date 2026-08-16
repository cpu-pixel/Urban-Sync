-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Enumerated Types for Data Integrity
CREATE TYPE organization_type AS ENUM (
    'MUNICIPAL', 
    'PUBLIC_UTILITY', 
    'PRIVATE_TELECOM'
);

CREATE TYPE utility_layer AS ENUM (
    'L1_DEEP_SEWER', 
    'L2_SHALLOW_PIPE', 
    'L3_DRY_UTILITY', 
    'L4_SURFACE_PAVING', 
    'L5_ABOVE_GROUND'
);

CREATE TYPE project_status AS ENUM (
    'DRAFT', 
    'PLANNED', 
    'IN_PROGRESS', 
    'CLASH_DETECTED', 
    'LOCKED', 
    'COMPLETED'
);

CREATE TYPE dependency_type AS ENUM (
    'HARD_PREREQUISITE', 
    'CO_LOCATION_OPPORTUNITY'
);

CREATE TYPE conflict_type AS ENUM (
    'SPATIAL_TEMPORAL_OVERLAP', 
    'MORATORIUM_VIOLATION', 
    'HIERARCHY_INVERSION'
);

CREATE TYPE severity_level AS ENUM (
    'INFO', 
    'WARNING', 
    'CRITICAL'
);








-- 3. Organizations Table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type organization_type NOT NULL,
    contact_email VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Projects Master Table
CREATE TABLE projects (
    id VARCHAR(32) PRIMARY KEY, -- e.g., 'PRJ-2026-089'
    organization_id UUID NOT NULL REFERENCES organizations(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    utility_layer utility_layer NOT NULL,
    status project_status DEFAULT 'PLANNED',
    budget_allocated NUMERIC(14, 2) NOT NULL,
    budget_spent NUMERIC(14, 2) DEFAULT 0.00,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    moratorium_applied BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Spatial Right-of-Way Table (PostGIS)
CREATE TABLE project_geometries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id VARCHAR(32) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    -- EPSG:4326 represents standard WGS 84 coordinate system (Longitude/Latitude)
    geom GEOMETRY(Geometry, 4326) NOT NULL, 
    buffer_meters INTEGER DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Dependency Directed Acyclic Graph (DAG) Table
CREATE TABLE project_dependencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id VARCHAR(32) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    predecessor_id VARCHAR(32) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    dependency_type dependency_type NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (project_id, predecessor_id) -- Prevent duplicate dependency links
);

-- 7. Clash Ledger Table
CREATE TABLE detected_conflicts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    primary_project_id VARCHAR(32) NOT NULL REFERENCES projects(id),
    conflicting_project_id VARCHAR(32) NOT NULL REFERENCES projects(id),
    conflict_type conflict_type NOT NULL,
    severity severity_level NOT NULL,
    overlap_geometry GEOMETRY(Geometry, 4326),
    resolved BOOLEAN DEFAULT false,
    resolution_notes TEXT,
    detected_at TIMESTAMPTZ DEFAULT NOW()
);






-- 8. Create Indexes
-- GIST (Generalized Search Tree) is mandatory for fast PostGIS spatial queries
CREATE INDEX idx_project_geometries_geom ON project_geometries USING GIST (geom);
CREATE INDEX idx_conflict_overlap_geom ON detected_conflicts USING GIST (overlap_geometry);

-- B-Tree indexes for fast temporal lookups
CREATE INDEX idx_projects_dates ON projects (start_date, end_date);
CREATE INDEX idx_projects_status ON projects (status);







-- 9. Clash Detection Function
CREATE OR REPLACE FUNCTION trigger_check_4d_clash()
RETURNS TRIGGER AS $$
DECLARE
    curr_start DATE;
    curr_end DATE;
    clash_record RECORD;
BEGIN
    -- Step 1: Fetch the timeframe for the project associated with this new geometry
    SELECT start_date, end_date INTO curr_start, curr_end
    FROM projects WHERE id = NEW.project_id;

    -- Step 2: Loop through any project that overlaps in BOTH Space and Time
    FOR clash_record IN
        SELECT 
            p.id AS conflicting_project_id,
            pg.geom AS conflicting_geom
        FROM project_geometries pg
        JOIN projects p ON pg.project_id = p.id
        WHERE pg.project_id != NEW.project_id
          -- Temporal overlap check: (Start A <= End B) AND (End A >= Start B)
          AND p.start_date <= curr_end
          AND p.end_date >= curr_start
          -- Spatial overlap check: Do these two polygons/lines touch or cross?
          AND ST_Intersects(NEW.geom, pg.geom)
    LOOP
        -- Step 3: Write the exact geographical overlap to the clash ledger
        INSERT INTO detected_conflicts (
            primary_project_id,
            conflicting_project_id,
            conflict_type,
            severity,
            overlap_geometry
        ) VALUES (
            NEW.project_id,
            clash_record.conflicting_project_id,
            'SPATIAL_TEMPORAL_OVERLAP',
            'CRITICAL',
            -- ST_Intersection calculates the exact polygon/line where they clash
            ST_Intersection(NEW.geom, clash_record.conflicting_geom) 
        );

        -- Step 4: Automatically flag both projects' statuses to 'CLASH_DETECTED'
        UPDATE projects SET status = 'CLASH_DETECTED', updated_at = NOW()
        WHERE id IN (NEW.project_id, clash_record.conflicting_project_id);
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Bind Trigger to the Geometries Table
CREATE TRIGGER after_geometry_insert_or_update
AFTER INSERT OR UPDATE OF geom ON project_geometries
FOR EACH ROW
EXECUTE FUNCTION trigger_check_4d_clash();-- Migration: Add multi-tenant user authentication
-- Run: docker exec -i urban-sync-db psql -U postgres -d urbansync < migration_auth.sql

-- 1. User Role Enum
CREATE TYPE user_role AS ENUM ('ADMIN', 'PLANNER', 'VIEWER');

-- 2. Users table (linked to an organization)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'PLANNER',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_org ON users (organization_id);

-- 3. Seed one demo user per organization
-- All passwords are 'password123', hashed with bcrypt (10 rounds)
-- Hash generated via: node -e "require('bcrypt').hash('password123',10).then(console.log)"
INSERT INTO users (organization_id, email, password_hash, name, role) VALUES
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'ops@waterboard.gov',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'Alice Nkomo',
  'ADMIN'
),
(
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  'build@telecominfra.com',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'Raj Patel',
  'PLANNER'
),
(
  'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  'roads@pwd.gov',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'Sam Chen',
  'PLANNER'
)
ON CONFLICT (email) DO NOTHING;
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