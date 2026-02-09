const db = require('../config/db');
const matchingService = require('../services/matchingService');

exports.getProfile = async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch member details
    const memberRes = await db.query('SELECT * FROM members WHERE id = $1', [id]);

    if (memberRes.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const member = memberRes.rows[0];

    // Fetch skills
    const skillsRes = await db.query(
      `SELECT s.id, s.name 
             FROM skills s
             JOIN member_skills ms ON s.id = ms.skill_id
             WHERE ms.member_id = $1`,
      [id]
    );

    member.skills = skillsRes.rows;

    // Fetch all available skills for the dropdown
    const allSkillsRes = await db.query('SELECT * FROM skills ORDER BY name');

    res.json({ member, allSkills: allSkillsRes.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  const { id } = req.params;
  const { name, headline, location, experience_years, current_company, skills } = req.body; // skills is array of skill IDs

  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // Update member details
    const updateRes = await client.query(
      `UPDATE members 
             SET name = $1, headline = $2, location = $3, experience_years = $4, current_company = $5
             WHERE id = $6
             RETURNING *`,
      [name, headline, location, experience_years, current_company, id]
    );

    if (updateRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Member not found' });
    }

    // Update Skills (Delete all and re-insert for simplicity)
    await client.query('DELETE FROM member_skills WHERE member_id = $1', [id]);

    if (skills && Array.isArray(skills)) {
      for (const skillId of skills) {
        await client.query(
          'INSERT INTO member_skills (member_id, skill_id) VALUES ($1, $2)',
          [id, skillId]
        );
      }
    }

    await client.query('COMMIT');

    // Trigger Matching Async
    matchingService.matchMemberToJobs(id).catch(err => console.error('Matching Error:', err));

    // Return updated profile with skills
    const updatedMember = updateRes.rows[0];
    // Re-fetch skills names
    const skillsRes = await client.query(
      `SELECT s.id, s.name 
             FROM skills s
             JOIN member_skills ms ON s.id = ms.skill_id
             WHERE ms.member_id = $1`,
      [id]
    );
    updatedMember.skills = skillsRes.rows;

    res.json(updatedMember);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
};
