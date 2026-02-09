const db = require('../config/db');

const WEIGHTS = {
  SKILL: 50,
  LOCATION: 20,
  COMPANY: 30
};

class MatchingService {
  async matchJobToMembers(jobId) {
    console.log(`Starting matching for Job ID: ${jobId}`);

    // 1. Fetch Job Details & Skills
    const jobRes = await db.query(
      `SELECT j.*, array_agg(js.skill_id) as skill_ids 
             FROM jobs j 
             LEFT JOIN job_skills js ON j.id = js.job_id 
             WHERE j.id = $1 
             GROUP BY j.id`,
      [jobId]
    );

    if (jobRes.rows.length === 0) throw new Error('Job not found');
    const job = jobRes.rows[0];
    const jobSkillIds = job.skill_ids || [];

    // 2. Fetch All Members with their Skills
    // In a real app, we would filter by location or some heuristic first
    const membersRes = await db.query(
      `SELECT m.*, array_agg(ms.skill_id) as skill_ids, array_agg(s.name) as skill_names
             FROM members m
             LEFT JOIN member_skills ms ON m.id = ms.member_id
             LEFT JOIN skills s ON ms.skill_id = s.id
             GROUP BY m.id`
    );
    const members = membersRes.rows;

    const nudges = [];

    // 3. Calculate Scores
    for (const member of members) {
      let score = 0;
      const reasons = [];

      // Skill Match
      const memberSkillIds = member.skill_ids || [];
      const matchingSkills = memberSkillIds.filter(id => jobSkillIds.includes(id));
      const matchCount = matchingSkills.length;

      if (matchCount > 0) {
        const skillScore = (matchCount / (jobSkillIds.length || 1)) * WEIGHTS.SKILL;
        score += skillScore;
        reasons.push(`Matches ${matchCount} required skills`);
      }

      // Location Match
      if (member.location && job.location && member.location.toLowerCase() === job.location.toLowerCase()) {
        score += WEIGHTS.LOCATION;
        reasons.push('Located in the same city');
      }

      // Company Match (Alumni/Internal)
      if (member.current_company && job.company && member.current_company.toLowerCase() === job.company.toLowerCase()) {
        score += WEIGHTS.COMPANY;
        reasons.push('Works at the same company');
      }

      // Create Nudge if Score > Threshold
      if (score >= 20) { // Threshold
        nudges.push({
          member_id: member.id,
          job_id: job.id,
          score: Math.round(score),
          reason: reasons.join('. '),
          status: 'pending'
        });
      }
    }

    // 4. Batch Insert Nudges
    // Using efficient batch insert or loop
    let insertedCount = 0;
    for (const nudge of nudges) {
      try {
        await db.query(
          `INSERT INTO nudges (member_id, job_id, score, reason, status) 
                     VALUES ($1, $2, $3, $4, $5)
                     ON CONFLICT (member_id, job_id) DO UPDATE 
                     SET score = EXCLUDED.score, reason = EXCLUDED.reason`,
          [nudge.member_id, nudge.job_id, nudge.score, nudge.reason, nudge.status]
        );
        insertedCount++;
      } catch (err) {
        console.error(`Error processing nudge for member ${nudge.member_id}:`, err);
      }
    }

    console.log(`Generated ${insertedCount} nudges for Job ${jobId}`);
    return { success: true, count: insertedCount };
  }
  async matchMemberToJobs(memberId) {
    console.log(`Starting matching for Member ID: ${memberId}`);

    // 1. Fetch Member Details & Skills
    const memberRes = await db.query(
      `SELECT m.*, array_agg(ms.skill_id) as skill_ids 
             FROM members m
             LEFT JOIN member_skills ms ON m.id = ms.member_id 
             WHERE m.id = $1 
             GROUP BY m.id`,
      [memberId]
    );

    if (memberRes.rows.length === 0) throw new Error('Member not found');
    const member = memberRes.rows[0];
    const memberSkillIds = member.skill_ids || [];

    // 2. Fetch All Jobs with their Skills
    const jobsRes = await db.query(
      `SELECT j.*, array_agg(js.skill_id) as skill_ids, array_agg(s.name) as skill_names
             FROM jobs j
             LEFT JOIN job_skills js ON j.id = js.job_id
             LEFT JOIN skills s ON js.skill_id = s.id
             GROUP BY j.id`
    );
    const jobs = jobsRes.rows;

    const nudges = [];

    // 3. Calculate Scores
    for (const job of jobs) {
      let score = 0;
      const reasons = [];

      // Skill Match
      const jobSkillIds = job.skill_ids || [];
      const matchingSkills = memberSkillIds.filter(id => jobSkillIds.includes(id));
      const matchCount = matchingSkills.length;

      if (matchCount > 0) {
        const skillScore = (matchCount / (jobSkillIds.length || 1)) * WEIGHTS.SKILL;
        score += skillScore;
        reasons.push(`Matches ${matchCount} required skills`);
      }

      // Location Match
      if (member.location && job.location && member.location.toLowerCase() === job.location.toLowerCase()) {
        score += WEIGHTS.LOCATION;
        reasons.push('Located in the same city');
      }

      // Company Match (Alumni/Internal)
      if (member.current_company && job.company && member.current_company.toLowerCase() === job.company.toLowerCase()) {
        score += WEIGHTS.COMPANY;
        reasons.push('Works at the same company');
      }

      // Create Nudge if Score > Threshold
      if (score >= 20) { // Threshold
        nudges.push({
          member_id: member.id,
          job_id: job.id,
          score: Math.round(score),
          reason: reasons.join('. '),
          status: 'pending'
        });
      }
    }

    // 4. Batch Insert Nudges
    let insertedCount = 0;
    for (const nudge of nudges) {
      try {
        await db.query(
          `INSERT INTO nudges (member_id, job_id, score, reason, status) 
                     VALUES ($1, $2, $3, $4, $5)
                     ON CONFLICT (member_id, job_id) DO UPDATE 
                     SET score = EXCLUDED.score, reason = EXCLUDED.reason`,
          [nudge.member_id, nudge.job_id, nudge.score, nudge.reason, nudge.status]
        );
        insertedCount++;
      } catch (err) {
        console.error(`Error processing nudge for job ${nudge.job_id}:`, err);
      }
    }

    // 5. Cleanup Invalid Nudges
    // Remove 'pending' nudges that are no longer matches (score < 20)
    const validJobIds = nudges.map(n => n.job_id);
    if (validJobIds.length > 0) {
      await db.query(
        `DELETE FROM nudges 
         WHERE member_id = $1 
         AND status = 'pending' 
         AND NOT (job_id = ANY($2))`,
        [memberId, validJobIds]
      );
    } else {
      // No matches found, remove all pending nudges
      await db.query(
        `DELETE FROM nudges 
         WHERE member_id = $1 
         AND status = 'pending'`,
        [memberId]
      );
    }

    console.log(`Generated ${insertedCount} nudges for Member ${memberId}`);
    return { success: true, count: insertedCount };
  }
}

module.exports = new MatchingService();
