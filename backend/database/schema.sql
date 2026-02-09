-- Enable pg_trgm for fuzzy text matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- SKILLS
CREATE TABLE IF NOT EXISTS skills (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

CREATE INDEX idx_skills_name ON skills(name);

-- MEMBERS
CREATE TABLE IF NOT EXISTS members (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    headline VARCHAR(255),
    location VARCHAR(255) NOT NULL,
    experience_years INTEGER DEFAULT 0,
    current_company VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_members_location ON members(location);

-- JOBS
CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    min_experience INTEGER DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_jobs_location ON jobs(location);

-- MEMBER SKILLS (Junction)
CREATE TABLE IF NOT EXISTS member_skills (
    member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
    skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
    PRIMARY KEY (member_id, skill_id)
);

-- JOB SKILLS (Junction)
CREATE TABLE IF NOT EXISTS job_skills (
    job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
    PRIMARY KEY (job_id, skill_id)
);

-- NUDGES
CREATE TYPE nudge_status AS ENUM ('pending', 'sent', 'accepted', 'ignored');

CREATE TABLE IF NOT EXISTS nudges (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
    job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    score NUMERIC(5, 2),
    reason TEXT,
    status nudge_status DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(member_id, job_id)
);

CREATE INDEX idx_nudges_member ON nudges(member_id);
CREATE INDEX idx_nudges_status ON nudges(status);
