const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;
  let { location } = req.body;

  if (!location) location = "Bengaluru"; // Default location

  try {
    // Check if user exists
    const userCheck = await db.query('SELECT * FROM members WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const result = await db.query(
      'INSERT INTO members (name, email, password_hash, location) VALUES ($1, $2, $3, $4) RETURNING id, name, email',
      [name, email, hashedPassword, location]
    );
    const user = result.rows[0];

    // Create Token
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', { email, password: password ? '***' : 'missing' });

  try {
    // Check user
    const result = await db.query('SELECT * FROM members WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      console.log(`Login failed: User ${email} not found`);
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      console.log(`Login failed: Password mismatch for ${email}`);
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    console.log(`Login successful for ${email}`);

    // Create Token
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
