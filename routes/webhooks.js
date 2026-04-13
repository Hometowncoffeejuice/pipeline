const express = require('express');
const router = express.Router();
const db = require('../db');
const { nanoid } = require('nanoid');

// Resend webhook endpoint
router.post('/resend', (req, res) => {
  const event = req.body;

  if (!event || !event.type) return res.status(200).send('ok');

  // Resend webhook events: email.sent, email.delivered, email.opened, email.clicked, email.bounced, email.complained
  const resendId = event.data?.email_id;
  if (!resendId) return res.status(200).send('ok');

  const email = db.prepare('SELECT * FROM outreach_emails WHERE resend_id = ?').get(resendId);
  if (!email) return res.status(200).send('ok');

  const typeMap = {
    'email.delivered': 'delivered',
    'email.opened': 'opened',
    'email.clicked': 'clicked',
    'email.bounced': 'bounced',
    'email.complained': 'bounced'
  };

  const newStatus = typeMap[event.type];
  if (!newStatus) return res.status(200).send('ok');

  // Only update if it's a progression (don't go backwards)
  const statusOrder = ['queued', 'sent', 'delivered', 'opened', 'clicked', 'bounced'];
  const currentIdx = statusOrder.indexOf(email.status);
  const newIdx = statusOrder.indexOf(newStatus);

  if (newStatus === 'bounced' || newIdx > currentIdx) {
    const updates = [`status = ?`];
    const params = [newStatus];

    if (newStatus === 'opened' && !email.opened_at) {
      updates.push('opened_at = datetime("now")');
    }
    if (newStatus === 'clicked' && !email.clicked_at) {
      updates.push('clicked_at = datetime("now")');
    }

    params.push(email.id);
    db.prepare(`UPDATE outreach_emails SET ${updates.join(', ')} WHERE id = ?`).run(...params);

    // Log activity
    db.prepare('INSERT INTO activity_log (id, prospect_id, action, details) VALUES (?, ?, ?, ?)').run(
      nanoid(), email.prospect_id, `email_${newStatus}`,
      JSON.stringify({ email_id: email.id, campaign_id: email.campaign_id })
    );

    // Auto-advance pipeline status on opens/clicks
    if (newStatus === 'opened' || newStatus === 'clicked') {
      const prospect = db.prepare('SELECT pipeline_status FROM prospects WHERE id = ?').get(email.prospect_id);
      if (prospect && ['not_touched', 'initial_outreach', 'follow_up'].includes(prospect.pipeline_status)) {
        db.prepare('UPDATE prospects SET pipeline_status = "in_contact", updated_at = datetime("now") WHERE id = ?').run(email.prospect_id);
        db.prepare('INSERT INTO activity_log (id, prospect_id, action, details) VALUES (?, ?, ?, ?)').run(
          nanoid(), email.prospect_id, 'status_changed',
          JSON.stringify({ from: prospect.pipeline_status, to: 'in_contact', reason: `email_${newStatus}` })
        );
      }
    }
  }

  res.status(200).send('ok');
});

module.exports = router;
