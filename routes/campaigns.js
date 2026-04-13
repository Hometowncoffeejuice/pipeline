const express = require('express');
const router = express.Router();
const db = require('../db');
const { nanoid } = require('nanoid');
const emailer = require('../services/emailer');

// List campaigns
router.get('/', (req, res) => {
  const campaigns = db.prepare(`
    SELECT c.*,
      t.name as template_name,
      (SELECT COUNT(*) FROM outreach_emails WHERE campaign_id = c.id) as total_emails,
      (SELECT COUNT(*) FROM outreach_emails WHERE campaign_id = c.id AND status = 'sent') as sent_count,
      (SELECT COUNT(*) FROM outreach_emails WHERE campaign_id = c.id AND (status = 'opened' OR status = 'clicked')) as opened_count,
      (SELECT COUNT(*) FROM outreach_emails WHERE campaign_id = c.id AND status = 'clicked') as clicked_count
    FROM outreach_campaigns c
    LEFT JOIN email_templates t ON c.template_id = t.id
    ORDER BY c.created_at DESC
  `).all();
  res.json(campaigns);
});

// Get campaign detail
router.get('/:id', (req, res) => {
  const campaign = db.prepare(`
    SELECT c.*, t.name as template_name
    FROM outreach_campaigns c
    LEFT JOIN email_templates t ON c.template_id = t.id
    WHERE c.id = ?
  `).get(req.params.id);

  if (!campaign) return res.status(404).json({ error: 'Not found' });

  const emails = db.prepare(`
    SELECT e.*, p.business_name, p.contact_name, p.email as prospect_email
    FROM outreach_emails e
    JOIN prospects p ON e.prospect_id = p.id
    WHERE e.campaign_id = ?
    ORDER BY e.created_at DESC
  `).all(req.params.id);

  res.json({ campaign, emails });
});

// Create campaign
router.post('/', (req, res) => {
  const { name, template_id, filter_category, filter_city, filter_status } = req.body;
  if (!name || !template_id) return res.status(400).json({ error: 'Name and template are required' });

  const id = nanoid();
  db.prepare(`
    INSERT INTO outreach_campaigns (id, name, template_id, filter_category, filter_city, filter_status)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, name, template_id, filter_category || null, filter_city || null, filter_status || null);

  res.status(201).json(db.prepare('SELECT * FROM outreach_campaigns WHERE id = ?').get(id));
});

// Send campaign — queues emails for all matching prospects
router.post('/:id/send', async (req, res) => {
  const campaign = db.prepare('SELECT * FROM outreach_campaigns WHERE id = ?').get(req.params.id);
  if (!campaign) return res.status(404).json({ error: 'Not found' });

  const template = db.prepare('SELECT * FROM email_templates WHERE id = ?').get(campaign.template_id);
  if (!template) return res.status(400).json({ error: 'Template not found' });

  // Build prospect filter
  const where = ['unsubscribed = 0', 'email != ""'];
  const params = [];

  if (campaign.filter_category) {
    where.push('category = ?');
    params.push(campaign.filter_category);
  }
  if (campaign.filter_city) {
    where.push('city = ?');
    params.push(campaign.filter_city);
  }
  if (campaign.filter_status) {
    where.push('pipeline_status = ?');
    params.push(campaign.filter_status);
  }

  // Exclude prospects who were already emailed in this campaign
  where.push(`id NOT IN (SELECT prospect_id FROM outreach_emails WHERE campaign_id = ?)`);
  params.push(campaign.id);

  // Also accept explicit prospect IDs from request body
  let prospects;
  if (req.body.prospect_ids && req.body.prospect_ids.length > 0) {
    const placeholders = req.body.prospect_ids.map(() => '?').join(',');
    prospects = db.prepare(`
      SELECT * FROM prospects WHERE id IN (${placeholders}) AND unsubscribed = 0 AND email != ''
    `).all(...req.body.prospect_ids);
  } else {
    prospects = db.prepare(`SELECT * FROM prospects WHERE ${where.join(' AND ')}`).all(...params);
  }

  if (prospects.length === 0) return res.json({ queued: 0, message: 'No matching prospects found' });

  // Queue emails
  const settings = {};
  db.prepare('SELECT key, value FROM app_settings').all().forEach(s => settings[s.key] = s.value);

  const insertEmail = db.prepare(`
    INSERT INTO outreach_emails (id, campaign_id, prospect_id, template_id, subject, body_html, status)
    VALUES (?, ?, ?, ?, ?, ?, 'queued')
  `);

  const queueEmails = db.transaction((prospects) => {
    let count = 0;
    for (const p of prospects) {
      const data = {
        business_name: p.business_name,
        contact_name: p.contact_name || 'there',
        city: p.city,
        nearest_location: p.nearest_location,
        catering_url: settings.catering_url || '',
        booking_url: settings.booking_url || '',
        menu_url: settings.menu_url || ''
      };
      const subject = renderTemplate(template.subject, data);
      const body = renderTemplate(template.body_html, data);

      insertEmail.run(nanoid(), campaign.id, p.id, template.id, subject, body);
      count++;
    }
    return count;
  });

  const queued = queueEmails(prospects);

  // Update campaign status
  db.prepare('UPDATE outreach_campaigns SET status = "active", updated_at = datetime("now") WHERE id = ?').run(campaign.id);

  // Process the queue asynchronously
  emailer.processQueue();

  res.json({ queued, message: `${queued} emails queued for sending` });
});

function renderTemplate(text, data) {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => data[key] || match);
}

module.exports = router;
