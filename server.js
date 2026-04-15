require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/prospects', require('./routes/prospects'));
app.use('/api/templates', require('./routes/templates'));
app.use('/api/template-coach', require('./routes/template-coach'));
app.use('/api/campaigns', require('./routes/campaigns'));
app.use('/api/outreach', require('./routes/outreach'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/webhooks', require('./routes/webhooks'));

// Unsubscribe endpoint (public-facing)
const db = require('./db');
const { nanoid } = require('nanoid');
app.get('/unsubscribe/:prospectId', (req, res) => {
  const prospect = db.prepare('SELECT id, business_name FROM prospects WHERE id = ?').get(req.params.prospectId);
  if (prospect) {
    db.prepare('UPDATE prospects SET unsubscribed = 1, updated_at = datetime("now") WHERE id = ?').run(prospect.id);
    db.prepare('INSERT INTO activity_log (id, prospect_id, action, details) VALUES (?, ?, ?, ?)').run(
      nanoid(), prospect.id, 'unsubscribed', JSON.stringify({ method: 'email_link' })
    );
  }
  res.send('<html><body style="font-family:sans-serif;text-align:center;padding:60px"><h2>You have been unsubscribed.</h2><p>You will no longer receive emails from Hometown Coffee & Juice.</p></body></html>');
});

// SPA fallback
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start follow-up scheduler
require('./services/scheduler');

app.listen(PORT, () => {
  console.log(`Hometown Pipeline running at http://localhost:${PORT}`);
});
