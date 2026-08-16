import { Router } from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../db.js';
import { generateToken, authenticateToken } from '../auth.js';

const router = Router();

// POST /api/auth/login
// Returns a JWT token + user profile on valid credentials
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  try {
    // Fetch user with their org in a single join
    const result = await pool.query(
      `SELECT 
         u.id, u.email, u.name, u.role, u.password_hash,
         o.id AS org_id, o.name AS org_name, o.type AS org_type
       FROM users u
       JOIN organizations o ON u.organization_id = o.id
       WHERE u.email = $1`,
      [email.toLowerCase().trim()]
    );

    const user = result.rows[0];

    if (!user) {
      // Return vague error to prevent user enumeration
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = generateToken({
      userId: user.id,
      orgId: user.org_id,
      role: user.role,
      name: user.name,
      email: user.email,
    });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: {
          id: user.org_id,
          name: user.org_name,
          type: user.org_type,
        },
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// GET /api/auth/me
// Returns current user from JWT — used on app boot to restore session
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
         u.id, u.email, u.name, u.role,
         o.id AS org_id, o.name AS org_name, o.type AS org_type
       FROM users u
       JOIN organizations o ON u.organization_id = o.id
       WHERE u.id = $1`,
      [req.user!.userId]
    );

    const user = result.rows[0];
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organization: {
        id: user.org_id,
        name: user.org_name,
        type: user.org_type,
      },
    });
  } catch (err) {
    console.error('Auth/me error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/auth/register
// Creates a new organization and user, then logs them in
router.post('/register', async (req, res) => {
  const { email, password, name, agencyName, agencyType } = req.body;

  if (!email || !password || !name || !agencyName || !agencyType) {
    res.status(400).json({ error: 'All fields are required.' });
    return;
  }

  const validOrgTypes = ['MUNICIPAL', 'PUBLIC_UTILITY', 'PRIVATE_TELECOM'];
  if (!validOrgTypes.includes(agencyType)) {
    res.status(400).json({ error: 'Invalid agency type.' });
    return;
  }

  const client = await pool.connect();
  try {
    // Check if email already exists first to avoid unnecessary transaction overhead
    const emailCheck = await client.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (emailCheck.rows.length > 0) {
      res.status(409).json({ error: 'Email already in use.' });
      return;
    }

    await client.query('BEGIN');

    // 1. Create Organization
    const orgResult = await client.query(
      `INSERT INTO organizations (name, type, contact_email) 
       VALUES ($1, $2, $3) RETURNING id, name, type`,
      [agencyName.trim(), agencyType, email.toLowerCase().trim()]
    );
    const org = orgResult.rows[0];

    // 2. Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. Create User (defaulting to ADMIN since they created the org)
    const userResult = await client.query(
      `INSERT INTO users (organization_id, email, password_hash, name, role) 
       VALUES ($1, $2, $3, $4, 'ADMIN') RETURNING id, email, name, role`,
      [org.id, email.toLowerCase().trim(), passwordHash, name.trim()]
    );
    const user = userResult.rows[0];

    await client.query('COMMIT');

    // Auto-login: generate token
    const token = generateToken({
      userId: user.id,
      orgId: org.id,
      role: user.role,
      name: user.name,
      email: user.email,
    });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: {
          id: org.id,
          name: org.name,
          type: org.type,
        },
      },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  } finally {
    client.release();
  }
});

export default router;
