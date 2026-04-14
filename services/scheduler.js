const cron = require('node-cron');
const db = require('../db');
const { nanoid } = require('nanoid');
const emailer = require('./emailer');
const {
  buildTemplateData,
  renderTemplate,
  hasUnresolvedPlaceholder
} = require('./template-renderer');

function getSettings() {
  const settings = {};
  db.prepare('SELECT key, value FROM app_settings').all().forEach(s => settings[s.key] = s.value);
  return settings;
}

// Run every hour to check for follow-ups due
cron.schedule('0 * * * *', () => {
  console.log('Running follow-up check...');
  processFollowUps();
});

function processFollowUps() {
  try {
    const rules = db.prepare('SELECT * FROM follow_up_rules WHERE enabled = 1 ORDER BY sequence_order').all();
    if (rules.length === 0) return;

    const settings = getSettings();
    if (!settings.resend_api_key) return;

    for (const rule of rules) {
      const template = db.prepare('SELECT * FROM email_templates WHERE id = ?').get(rule.template_id);
      if (!template) continue;

      // Find prospects who:
      // 1. Have been sent at least one email
      // 2. Haven't opened/clicked (still in sent/delivered status)
      // 3. Last email was sent more than rule.days_delay days ago
      // 4. Haven't received this sequence level yet
      // 5. Aren't unsubscribed
      // 6. Total follow-ups < 2
      const prospects = db.prepare(`
        SELECT p.*,
          (SELECT COUNT(*) FROM outreach_emails WHERE prospect_id = p.id AND template_id IN (
            SELECT template_id FROM follow_up_rules
          )) as followup_count,
          (SELECT MAX(sent_at) FROM outreach_emails WHERE prospect_id = p.id AND sent_at IS NOT NULL) as last_sent
        FROM prospects p
        WHERE p.unsubscribed = 0
          AND p.email != ''
          AND p.pipeline_status IN ('initial_outreach', 'follow_up')
          AND (SELECT COUNT(*) FROM outreach_emails WHERE prospect_id = p.id AND sent_at IS NOT NULL) > 0
          AND (SELECT COUNT(*) FROM outreach_emails WHERE prospect_id = p.id AND template_id = ?) = 0
          AND (SELECT MAX(sent_at) FROM outreach_emails WHERE prospect_id = p.id AND sent_at IS NOT NULL) <= datetime('now', '-' || ? || ' days')
          AND (SELECT COUNT(*) FROM outreach_emails oe WHERE oe.prospect_id = p.id AND oe.status IN ('opened', 'clicked')) = 0
      `).all(rule.template_id, rule.days_delay);

      if (prospects.length === 0) continue;

      console.log(`Follow-up rule "${rule.name}": ${prospects.length} prospects due`);

      const insertEmail = db.prepare(`
        INSERT INTO outreach_emails (id, prospect_id, template_id, subject, body_html, status)
        VALUES (?, ?, ?, ?, ?, 'queued')
      `);

      for (const p of prospects) {
        // Safety: skip prospects without a business name — won't send garbled subjects
        if (!p.business_name || !p.business_name.trim()) {
          console.warn(`Skipping follow-up for prospect ${p.id}: missing business name`);
          continue;
        }

        const data = buildTemplateData(p, settings);
        const subject = renderTemplate(template.subject, data);
        const body = renderTemplate(template.body_html, data);

        // Final safety net — refuse to queue if anything failed to render
        if (hasUnresolvedPlaceholder(subject) || hasUnresolvedPlaceholder(body)) {
          console.error(`Skipping follow-up for prospect ${p.id}: unresolved placeholder in rendered content`);
          continue;
        }

        insertEmail.run(nanoid(), p.id, template.id, subject, body);

        // Update pipeline status to follow_up
        if (p.pipeline_status === 'initial_outreach') {
          db.prepare('UPDATE prospects SET pipeline_status = \'follow_up\', updated_at = datetime(\'now\') WHERE id = ?').run(p.id);
        }
      }
    }

    // Process the queued emails
    emailer.processQueue();

  } catch (err) {
    console.error('Follow-up processing error:', err);
  }
}

console.log('Follow-up scheduler initialized (runs hourly).');

module.exports = { processFollowUps };
