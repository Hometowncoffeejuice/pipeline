const express = require('express');
const router = express.Router();
const db = require('../db');
const { nanoid } = require('nanoid');
const { renderTemplate, buildTemplateData } = require('../services/template-renderer');

// List all templates
router.get('/', (req, res) => {
  const { type } = req.query;
  let sql = 'SELECT * FROM email_templates';
  const params = [];
  if (type) {
    sql += ' WHERE template_type = ?';
    params.push(type);
  }
  sql += ' ORDER BY template_type, name';
  res.json(db.prepare(sql).all(...params));
});

// Get single template
router.get('/:id', (req, res) => {
  const template = db.prepare('SELECT * FROM email_templates WHERE id = ?').get(req.params.id);
  if (!template) return res.status(404).json({ error: 'Not found' });
  res.json(template);
});

// Create template
router.post('/', (req, res) => {
  const { name, subject, body_html, body_text, template_type, category } = req.body;
  if (!name || !subject || !body_html) return res.status(400).json({ error: 'Name, subject, and body_html are required' });

  const id = nanoid();
  db.prepare(`
    INSERT INTO email_templates (id, name, subject, body_html, body_text, template_type, category)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, name, subject, body_html, body_text || '', template_type || 'initial', category || null);

  res.status(201).json(db.prepare('SELECT * FROM email_templates WHERE id = ?').get(id));
});

// Update template
router.put('/:id', (req, res) => {
  const template = db.prepare('SELECT * FROM email_templates WHERE id = ?').get(req.params.id);
  if (!template) return res.status(404).json({ error: 'Not found' });

  const fields = ['name', 'subject', 'body_html', 'body_text', 'template_type', 'category'];
  const updates = [];
  const params = [];

  for (const field of fields) {
    if (req.body[field] !== undefined) {
      updates.push(`${field} = ?`);
      params.push(req.body[field]);
    }
  }

  if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });
  updates.push('updated_at = datetime("now")');
  params.push(req.params.id);

  db.prepare(`UPDATE email_templates SET ${updates.join(', ')} WHERE id = ?`).run(...params);
  res.json(db.prepare('SELECT * FROM email_templates WHERE id = ?').get(req.params.id));
});

// Delete template
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM email_templates WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
});

// Preview template with sample data
router.post('/:id/preview', (req, res) => {
  const template = db.prepare('SELECT * FROM email_templates WHERE id = ?').get(req.params.id);
  if (!template) return res.status(404).json({ error: 'Not found' });

  const settings = {};
  db.prepare('SELECT key, value FROM app_settings').all().forEach(s => settings[s.key] = s.value);

  // Build preview data using the same helper real sends use, so what you see
  // in preview matches what prospects actually receive. Don't pre-default
  // nearest_location — let buildTemplateData derive it from city the same way
  // a real send would.
  const fakeProspect = {
    business_name: req.body.business_name || 'Sample Business',
    contact_name: req.body.contact_name || 'John',
    city: req.body.city || 'Glencoe',
    nearest_location: req.body.nearest_location || ''
  };
  const sampleData = buildTemplateData(fakeProspect, settings);

  const rendered = renderTemplate(template.body_html, sampleData);
  const renderedSubject = renderTemplate(template.subject, sampleData);

  res.json({ subject: renderedSubject, body_html: rendered });
});

module.exports = router;
