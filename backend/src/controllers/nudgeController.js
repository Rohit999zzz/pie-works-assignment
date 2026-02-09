const db = require('../config/db');

exports.getNudgesForMember = async (req, res) => {
  const { memberId } = req.params;

  try {
    const result = await db.query(
      `SELECT n.*, j.title as job_title, j.company as job_company, j.location as job_location
             FROM nudges n
             JOIN jobs j ON n.job_id = j.id
             WHERE n.member_id = $1
             ORDER BY n.score DESC`,
      [memberId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateNudgeStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Validate status
  const validStatuses = ['pending', 'sent', 'accepted', 'ignored'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const result = await db.query(
      'UPDATE nudges SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Nudge not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
