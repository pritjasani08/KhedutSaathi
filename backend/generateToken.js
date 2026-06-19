require('dotenv').config({ path: '../.env' });
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { id: '11111111-1111-1111-1111-111111111111', email: 'test@example.com', user_type: 'farmer' },
  process.env.JWT_SECRET || 'fallback_secret_for_dev_only',
  { expiresIn: '7d' }
);
console.log(token);
