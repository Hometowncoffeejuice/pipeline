const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all settings
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT key, value FROM app_settings').all();
  const settings = {};
  rows.forEach(r => {
    // Mask API key for display
    if (r.key === 'resend_api_key' && r.value) {
      settings[r.key] = r.value.slice(0, 6) + '...' + r.value.slice(-4);
      settings['resend_configured'] = true;
    } else {
      settings[r.key] = r.value;
    }
  });
  res.json(settings);
});

// Update settings
router.put('/', (req, res) => {
  const allowedKeys = ['from_email', 'from_name', 'reply_to_email', 'email_signature', 'daily_send_limit', 'catering_url', 'menu_url', 'booking_url', 'resend_api_key', 'business_address', 'location_glencoe', 'location_winnetka', 'location_glenview', 'location_lake_forest'];

  const upsert = db.prepare('INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');

  const update = db.transaction((data) => {
    for (const [key, value] of Object.entries(data)) {
      if (allowedKeys.includes(key)) {
        upsert.run(key, value);
      }
    }
  });

  update(req.body);
  res.json({ success: true });
});

// Get follow-up rules
router.get('/follow-up-rules', (req, res) => {
  const rules = db.prepare(`
    SELECT f.*, t.name as template_name
    FROM follow_up_rules f
    LEFT JOIN email_templates t ON f.template_id = t.id
    ORDER BY f.sequence_order
  `).all();
  res.json(rules);
});

// Update follow-up rule
router.put('/follow-up-rules/:id', (req, res) => {
  const { days_delay, template_id, enabled } = req.body;
  const updates = [];
  const params = [];

  if (days_delay !== undefined) { updates.push('days_delay = ?'); params.push(days_delay); }
  if (template_id !== undefined) { updates.push('template_id = ?'); params.push(template_id); }
  if (enabled !== undefined) { updates.push('enabled = ?'); params.push(enabled ? 1 : 0); }

  if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });
  params.push(req.params.id);

  db.prepare(`UPDATE follow_up_rules SET ${updates.join(', ')} WHERE id = ?`).run(...params);
  res.json({ success: true });
});

module.exports = router;
