const db = require('../config/db');
const matchingService = require('../services/matchingService');

exports.createJob = async (req, res) => {
  const { title, company, location, min_experience, description, skills } = req.body;
  const client = await db.pool.connect();

  try {
    // Transaction to insert job and skills
    await client.query('BEGIN');

    const jobRes = await client.query(
      'INSERT INTO jobs (title, company, location, min_experience, description) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [title, company, location, min_experience, description]
    );
    const jobId = jobRes.rows[0].id;

    // Insert job skills (assuming skills passed as names or IDs, let's assume names for simplicity or IDs if frontend sends IDs)
    // Ideally frontend sends IDs, but if names, we need to lookup.
    // For simplicity, let's assume frontend sends skill IDs or we skip this for now and use seeds.
    // Update: The seed script inserts skills.
    // Let's assume input has skill_ids.

    if (skills && Array.isArray(skills)) {
      for (const skillId of skills) {
        await client.query('INSERT INTO job_skills (job_id, skill_id) VALUES ($1, $2)', [jobId, skillId]);
      }
    }

    await client.query('COMMIT');

    // Trigger Matching Async
    matchingService.matchJobToMembers(jobId).catch(err => console.error('Matching Error:', err));

    res.status(201).json({ message: 'Job created and matching started', jobId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
};

exports.getJobs = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM jobs ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
