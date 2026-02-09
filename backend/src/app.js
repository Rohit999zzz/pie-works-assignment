const express = require('express');
const cors = require('cors');
const jobController = require('./controllers/jobController');
const nudgeController = require('./controllers/nudgeController');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const memberController = require('./controllers/memberController');
const authController = require('./controllers/authController');
const authMiddleware = require('./middleware/authMiddleware');

// Auth
app.post('/api/auth/signup', authController.signup);
app.post('/api/auth/login', authController.login);

// Jobs (Public for now, or protect creation?)
app.post('/api/jobs', jobController.createJob);
app.get('/api/jobs', jobController.getJobs);

// Nudges (Protected)
app.get('/api/members/:memberId/nudges', authMiddleware, nudgeController.getNudgesForMember);
app.patch('/api/nudges/:id', authMiddleware, nudgeController.updateNudgeStatus);

// Members (Profile) (Protected)
app.get('/api/members/:id', authMiddleware, memberController.getProfile);
app.put('/api/members/:id', authMiddleware, memberController.updateProfile);

// Health Check
app.get('/health', (req, res) => res.send('OK'));

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
