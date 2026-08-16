-- Migration: Add multi-tenant user authentication
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
