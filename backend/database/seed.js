const { Pool } = require('pg');
require('dotenv').config();
const bcrypt = require('bcryptjs');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/pieworks'
});

const skillsList = [
    'JavaScript', 'Node.js', 'React', 'Python', 'Java', 'AWS', 'Docker',
    'PostgreSQL', 'Figma', 'Product Management', 'Marketing', 'Sales',
    'Kubernetes', 'Terraform', 'Go', 'Rust', 'C++', 'Machine Learning',
    'Data Science', 'UI/UX Design', 'SEO', 'Content Writing', 'Angular', 'Vue.js', 'SQL'
];

const main = async () => {
    try {
        console.log('🌱 Seeding database...');

        // Hashing Password
        console.log('DEBUG: Hashing password...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);
        console.log('DEBUG: Password hashed.');

        // Truncate
        console.log('DEBUG: Truncating tables...');
        await pool.query('TRUNCATE TABLE nudges, member_skills, job_skills, jobs, members, skills RESTART IDENTITY CASCADE');
        console.log('DEBUG: Tables truncated.');

        // Insert Skills
        console.log('DEBUG: Inserting skills...');
        const skillMap = {};
        for (const skill of skillsList) {
            const res = await pool.query('INSERT INTO skills (name) VALUES ($1) RETURNING id', [skill]);
            skillMap[skill] = res.rows[0].id;
        }
        console.log('DEBUG: Skills inserted.');

        // Insert Members
        console.log('DEBUG: Inserting members...');
        const membersData = [
            { name: 'Alice Johnson', email: 'alice@example.com', headline: 'Senior Frontend Developer', location: 'Bengaluru', exp: 5, company: 'TechCorp', skills: ['JavaScript', 'React', 'Figma'] },
            { name: 'Bob Smith', email: 'bob@example.com', headline: 'Backend Engineer', location: 'Mumbai', exp: 3, company: 'StartupHub', skills: ['Node.js', 'PostgreSQL', 'Docker'] },
            { name: 'Charlie Davis', email: 'charlie@example.com', headline: 'Full Stack Developer', location: 'Bengaluru', exp: 2, company: 'Wework Galaxy', skills: ['JavaScript', 'Node.js', 'React', 'AWS'] },
            { name: 'Diana Evans', email: 'diana@example.com', headline: 'Product Manager', location: 'Delhi', exp: 8, company: 'InnovateInc', skills: ['Product Management', 'Marketing'] },
            { name: 'Evan Wright', email: 'evan@example.com', headline: 'Java Developer', location: 'Hyderabad', exp: 4, company: 'BigBank', skills: ['Java', 'AWS', 'PostgreSQL'] },
            { name: 'Fiona Green', email: 'fiona@example.com', headline: 'UI/UX Designer', location: 'Bengaluru', exp: 4, company: 'CreativeStudio', skills: ['Figma', 'UI/UX Design'] },
            { name: 'George Hall', email: 'george@example.com', headline: 'DevOps Engineer', location: 'Remote', exp: 6, company: 'CloudSystems', skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform'] },
            { name: 'Hannah Lee', email: 'hannah@example.com', headline: 'Data Scientist', location: 'Mumbai', exp: 3, company: 'DataWiz', skills: ['Python', 'Machine Learning', 'Data Science'] },
            { name: 'Ian Scott', email: 'ian@example.com', headline: 'Content Strategist', location: 'Delhi', exp: 5, company: 'MediaBuzz', skills: ['Content Writing', 'SEO', 'Marketing'] },
            { name: 'Jack White', email: 'jack@example.com', headline: 'Go Developer', location: 'Bengaluru', exp: 7, company: 'FastTech', skills: ['Go', 'Kubernetes', 'Docker'] }
        ];

        for (const m of membersData) {
            console.log(`DEBUG: Inserting member ${m.name}`);
            const res = await pool.query(
                'INSERT INTO members (name, email, password_hash, headline, location, experience_years, current_company) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
                [m.name, m.email, hashedPassword, m.headline, m.location, m.exp, m.company]
            );
            const memberId = res.rows[0].id;

            for (const s of m.skills) {
                if (skillMap[s]) {
                    await pool.query('INSERT INTO member_skills (member_id, skill_id) VALUES ($1, $2)', [memberId, skillMap[s]]);
                }
            }
        }
        console.log('DEBUG: Members inserted.');

        // Insert Jobs
        console.log('DEBUG: Inserting jobs...');
        const jobsData = [
            { title: 'Frontend Engineer', company: 'Pieworks', location: 'Bengaluru', min_exp: 2, desc: 'Looking for a React expert to build our referral engine.', skills: ['React', 'JavaScript', 'Figma'] },
            { title: 'Backend Developer', company: 'FinTech Co', location: 'Mumbai', min_exp: 3, desc: 'Build scalable APIs using Node.js and Postgres.', skills: ['Node.js', 'PostgreSQL', 'AWS'] },
            { title: 'Full Stack Intern', company: 'StartupHub', location: 'Remote', min_exp: 0, desc: 'Learn and grow with us. JS stack.', skills: ['JavaScript', 'Node.js'] },
            { title: 'Senior DevOps Engineer', company: 'CloudSystems', location: 'Bengaluru', min_exp: 5, desc: 'Manage our AWS infrastructure and Kubernetes clusters.', skills: ['AWS', 'Kubernetes', 'Terraform'] },
            { title: 'Product Designer', company: 'CreativeStudio', location: 'Delhi', min_exp: 3, desc: 'Design intuitive user experiences for our mobile app.', skills: ['Figma', 'UI/UX Design'] },
            { title: 'Data Analyst', company: 'DataWiz', location: 'Mumbai', min_exp: 2, desc: 'Analyze user behavior data to drive product decisions.', skills: ['Python', 'Data Science', 'SQL'] },
            { title: 'Machine Learning Engineer', company: 'AI Solutions', location: 'Bengaluru', min_exp: 4, desc: 'Build and deploy ML models for predictive analytics.', skills: ['Python', 'Machine Learning', 'Data Science'] },
            { title: 'Golang Developer', company: 'FastTech', location: 'Hyderabad', min_exp: 3, desc: 'High-performance backend development in Go.', skills: ['Go', 'Docker', 'Kubernetes'] },
            { title: 'Marketing Manager', company: 'BrandBuilder', location: 'Delhi', min_exp: 5, desc: 'Lead marketing campaigns and brand strategy.', skills: ['Marketing', 'Content Writing', 'SEO'] },
            { title: 'Rust Systems Engineer', company: 'SecureSystems', location: 'Remote', min_exp: 4, desc: 'Build secure and fast systems software using Rust.', skills: ['Rust', 'C++', 'AWS'] }
        ];

        for (const j of jobsData) {
            console.log(`DEBUG: Inserting job ${j.title}`);
            const res = await pool.query(
                'INSERT INTO jobs (title, company, location, min_experience, description) VALUES ($1, $2, $3, $4, $5) RETURNING id',
                [j.title, j.company, j.location, j.min_exp, j.desc]
            );
            const jobId = res.rows[0].id;

            for (const s of j.skills) {
                if (skillMap[s]) {
                    await pool.query('INSERT INTO job_skills (job_id, skill_id) VALUES ($1, $2)', [jobId, skillMap[s]]);
                }
            }
        }
        console.log('DEBUG: Jobs inserted.');

        // Insert Mock Nudges
        console.log('DEBUG: Inserting nudges...');
        const aliceRes = await pool.query("SELECT id FROM members WHERE name = 'Alice Johnson'");
        const feJobRes = await pool.query("SELECT id FROM jobs WHERE title = 'Frontend Engineer'");

        if (aliceRes.rows.length > 0 && feJobRes.rows.length > 0) {
            const memberId = aliceRes.rows[0].id;
            const jobId = feJobRes.rows[0].id;

            await pool.query(
                `INSERT INTO nudges (member_id, job_id, score, reason, status) 
                 VALUES ($1, $2, 85, 'Matches 3 top skills (React, JavaScript, Figma) and location (Bengaluru).', 'pending')`
                , [memberId, jobId]);
            console.log('✨ Inserted mock nudge for Alice');
        }

        const bobRes = await pool.query("SELECT id FROM members WHERE name = 'Bob Smith'");
        const beJobRes = await pool.query("SELECT id FROM jobs WHERE title = 'Backend Developer'");

        if (bobRes.rows.length > 0 && beJobRes.rows.length > 0) {
            const memberId = bobRes.rows[0].id;
            const jobId = beJobRes.rows[0].id;

            await pool.query(
                `INSERT INTO nudges (member_id, job_id, score, reason, status) 
                 VALUES ($1, $2, 90, 'Matches skills (Node.js, Postgres) and domain relevance.', 'pending')`
                , [memberId, jobId]);
            console.log('✨ Inserted mock nudge for Bob');
        }

        console.log('✅ Seeding complete!');
        process.exit(0);

    } catch (err) {
        console.error('❌ Seeding failed!');
        console.error('Message:', err.message);
        console.error('Stack:', err.stack);
        process.exit(1);
    }
};

main();
