const express = require('express');
const router = express.Router();
const db = require('../db');
const { nanoid } = require('nanoid');
const emailer = require('../services/emailer');

// Send individual email to a prospect
router.post('/send', async (req, res) => {
  const { prospect_id, template_id } = req.body;

  const prospect = db.prepare('SELECT * FROM prospects WHERE id = ?').get(prospect_id);
  if (!prospect) return res.status(404).json({ error: 'Prospect not found' });
  if (!prospect.email) return res.status(400).json({ error: 'Prospect has no email address' });
  if (prospect.unsubscribed) return res.status(400).json({ error: 'Prospect is unsubscribed' });

  const template = db.prepare('SELECT * FROM email_templates WHERE id = ?').get(template_id);
  if (!template) return res.status(404).json({ error: 'Template not found' });

  const settings = {};
  db.prepare('SELECT key, value FROM app_settings').all().forEach(s => settings[s.key] = s.value);

  const data = {
    business_name: prospect.business_name,
    contact_name: prospect.contact_name || 'there',
    city: prospect.city,
    nearest_location: prospect.nearest_location,
    catering_url: settings.catering_url || '',
    booking_url: settings.booking_url || '',
    menu_url: settings.menu_url || ''
  };

  const subject = renderTemplate(template.subject, data);
  const body = renderTemplate(template.body_html, data);

  const emailId = nanoid();
  db.prepare(`
    INSERT INTO outreach_emails (id, prospect_id, template_id, subject, body_html, status)
    VALUES (?, ?, ?, ?, ?, 'queued')
  `).run(emailId, prospect.id, template.id, subject, body);

  // Process queue
  emailer.processQueue();

  res.json({ success: true, email_id: emailId });
});

// Get emails for a prospect
router.get('/prospect/:id', (req, res) => {
  const emails = db.prepare(`
    SELECT e.*, t.name as template_name
    FROM outreach_emails e
    LEFT JOIN email_templates t ON e.template_id = t.id
    WHERE e.prospect_id = ?
    ORDER BY e.created_at DESC
  `).all(req.params.id);
  res.json(emails);
});

function renderTemplate(text, data) {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => data[key] || match);
}

module.exports = router;
