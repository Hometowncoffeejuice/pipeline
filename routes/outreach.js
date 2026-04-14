const express = require('express');
const router = express.Router();
const db = require('../db');
const { nanoid } = require('nanoid');
const emailer = require('../services/emailer');
const {
  buildTemplateData,
  renderTemplate,
  validateProspectForSend,
  hasUnresolvedPlaceholder
} = require('../services/template-renderer');

// Send individual email to a prospect
router.post('/send', async (req, res) => {
  const { prospect_id, template_id } = req.body;

  const prospect = db.prepare('SELECT * FROM prospects WHERE id = ?').get(prospect_id);
  const validationError = validateProspectForSend(prospect);
  if (validationError) return res.status(400).json({ error: validationError });

  const template = db.prepare('SELECT * FROM email_templates WHERE id = ?').get(template_id);
  if (!template) return res.status(404).json({ error: 'Template not found' });

  const settings = {};
  db.prepare('SELECT key, value FROM app_settings').all().forEach(s => settings[s.key] = s.value);

  const data = buildTemplateData(prospect, settings);
  const subject = renderTemplate(template.subject, data);
  const body = renderTemplate(template.body_html, data);

  // Final safety net: if anything is still unresolved, refuse to send
  if (hasUnresolvedPlaceholder(subject) || hasUnresolvedPlaceholder(body)) {
    console.error(`Refusing send — unresolved placeholder for prospect ${prospect.id}, template ${template.id}`);
    return res.status(500).json({ error: 'Email could not be rendered cleanly. Please contact support.' });
  }

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

module.exports = router;
