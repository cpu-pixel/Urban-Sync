import express from 'express';
import cors from 'cors';
import { pool } from './db.js';
import { authenticateToken } from './auth.js';
import authRoutes from './routes/authRoutes.js';

const app = express();
app.use(cors());
app.use(express.json());

// ── Public routes ────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);

// ── Protected routes (all require a valid JWT) ────────────────────────────────

// GET /api/projects
// Returns only projects belonging to the authenticated user's organization
app.get('/api/projects', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT 
        p.id, p.title, o.name as agency, p.utility_layer, p.status, 
        p.budget_allocated, p.budget_spent, p.start_date, p.end_date,
        ST_AsGeoJSON(pg.geom)::json AS geometry
      FROM projects p
      JOIN organizations o ON p.organization_id = o.id
      LEFT JOIN project_geometries pg ON p.id = pg.project_id
      WHERE p.organization_id = $1
      ORDER BY p.created_at DESC;
    `;
    // req.user is guaranteed by authenticateToken middleware
    const result = await pool.query(query, [req.user!.orgId]);

    const toTitleCase = (s: string) =>
      s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

    const projects = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      agency: row.agency,
      // e.g. 'L1_DEEP_SEWER' -> layer: 'L1', layerName: 'Deep Sewer'
      layer: row.utility_layer.split('_')[0],
      layerName: toTitleCase(row.utility_layer.split('_').slice(1).join(' ')),
      budget: Number(row.budget_allocated),
      spent: Number(row.budget_spent),
      // pg type parser returns DATE as 'YYYY-MM-DD' string directly
      status: toTitleCase(row.status.replaceAll('_', ' ')),
      startDate: String(row.start_date).slice(0, 10),
      endDate: String(row.end_date).slice(0, 10),
      geometry: row.geometry,
      predecessors: [],
    }));

    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching projects' });
  }
});

// POST /api/projects
// Ingests a new project scoped to the authenticated user's organization
// (ignores any agency_id from the request body — org comes from the JWT)
app.post('/api/projects', authenticateToken, async (req, res) => {
  const { id, title, layer, budget, startDate, endDate, geometry } = req.body;
  // org comes from verified JWT, not the client
  const orgId = req.user!.orgId;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const layerMap: Record<string, string> = {
      'L1': 'L1_DEEP_SEWER',
      'L2': 'L2_SHALLOW_PIPE',
      'L3': 'L3_DRY_UTILITY',
      'L4': 'L4_SURFACE_PAVING',
      'L5': 'L5_ABOVE_GROUND',
    };
    const fullLayer = layerMap[layer] ?? 'L4_SURFACE_PAVING';

    // 1. Insert Project — org_id comes from the verified JWT
    await client.query(
      `INSERT INTO projects (id, organization_id, title, utility_layer, budget_allocated, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, orgId, title, fullLayer, budget, startDate, endDate]
    );

    // 2. Insert Geometry — fires the PostGIS 4D Clash trigger
    if (geometry) {
      await client.query(
        `INSERT INTO project_geometries (project_id, geom)
         VALUES ($1, ST_GeomFromGeoJSON($2))`,
        [id, JSON.stringify(geometry)]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Project ingested and spatial triggers fired.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to ingest project' });
  } finally {
    client.release();
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
});