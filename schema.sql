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
EXECUTE FUNCTION trigger_check_4d_clash();