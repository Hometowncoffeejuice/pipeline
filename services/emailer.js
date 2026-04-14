const db = require('../db');
const { nanoid } = require('nanoid');
const { hasUnresolvedPlaceholder } = require('./template-renderer');

let processing = false;

function getSettings() {
  const settings = {};
  db.prepare('SELECT key, value FROM app_settings').all().forEach(s => settings[s.key] = s.value);
  return settings;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function processQueue() {
  if (processing) return;
  processing = true;

  try {
    const settings = getSettings();
    const apiKey = settings.resend_api_key;

    if (!apiKey) {
      console.log('Resend API key not configured, skipping email send');
      processing = false;
      return;
    }

    const dailyLimit = parseInt(settings.daily_send_limit) || 80;
    const todaySent = db.prepare(`
      SELECT COUNT(*) as c FROM outreach_emails WHERE sent_at >= date('now')
    `).get().c;

    if (todaySent >= dailyLimit) {
      console.log(`Daily limit reached (${todaySent}/${dailyLimit}), pausing sends`);
      processing = false;
      return;
    }

    const remaining = dailyLimit - todaySent;
    const queued = db.prepare(`
      SELECT e.*, p.email as to_email, p.id as pid
      FROM outreach_emails e
      JOIN prospects p ON e.prospect_id = p.id
      WHERE e.status = 'queued' AND p.unsubscribed = 0 AND p.email != ''
      ORDER BY e.created_at
      LIMIT ?
    `).all(Math.min(remaining, 50));

    if (queued.length === 0) {
      processing = false;
      return;
    }

    const { Resend } = require('resend');
    const resend = new Resend(apiKey);
    const fromEmail = settings.from_email || 'onboarding@resend.dev';
    const fromName = settings.from_name || 'Hometown Coffee & Juice';

    for (const email of queued) {
      try {
        // Last-mile safety: if somehow a queued email got through with an
        // unrendered placeholder, mark it failed and skip rather than sending
        // garbage to a prospect.
        if (hasUnresolvedPlaceholder(email.subject) || hasUnresolvedPlaceholder(email.body_html)) {
          console.error(`Email ${email.id} has unresolved placeholder, marking failed`);
          db.prepare('UPDATE outreach_emails SET status = \'failed\' WHERE id = ?').run(email.id);
          continue;
        }

        // Add signature + unsubscribe footer
        const unsubUrl = `${getBaseUrl()}/unsubscribe/${email.pid}`;
        const signature = settings.email_signature || '';
        const bodyWithFooter = email.body_html + signature + `
          <hr style="margin-top:30px;border:none;border-top:1px solid #ddd">
          <p style="font-size:12px;color:#999;text-align:center;">
            Hometown Coffee & Juice<br>
            ${settings.business_address || '700 Vernon Ave., Glencoe IL'}<br>
            <a href="${unsubUrl}" style="color:#999">Unsubscribe</a>
          </p>`;

        const sendPayload = {
          from: `${fromName} <${fromEmail}>`,
          to: [email.to_email],
          subject: email.subject,
          html: bodyWithFooter
        };
        if (settings.reply_to_email) sendPayload.replyTo = settings.reply_to_email;

        const result = await resend.emails.send(sendPayload);

        // Update email record
        db.prepare(`
          UPDATE outreach_emails SET status = 'sent', resend_id = ?, sent_at = datetime('now') WHERE id = ?
        `).run(result.data?.id || '', email.id);

        // Update prospect pipeline status
        const prospect = db.prepare('SELECT pipeline_status FROM prospects WHERE id = ?').get(email.pid);
        if (prospect && prospect.pipeline_status === 'not_touched') {
          db.prepare('UPDATE prospects SET pipeline_status = "initial_outreach", updated_at = datetime("now") WHERE id = ?').run(email.pid);
          db.prepare('INSERT INTO activity_log (id, prospect_id, action, details) VALUES (?, ?, ?, ?)').run(
            nanoid(), email.pid, 'status_changed',
            JSON.stringify({ from: 'not_touched', to: 'initial_outreach', reason: 'email_sent' })
          );
        }

        // Log the send
        db.prepare('INSERT INTO activity_log (id, prospect_id, action, details) VALUES (?, ?, ?, ?)').run(
          nanoid(), email.pid, 'email_sent',
          JSON.stringify({ email_id: email.id, subject: email.subject })
        );

        console.log(`Email sent to ${email.to_email}`);

        // Rate limit: 1 second between sends
        await sleep(1000);

      } catch (err) {
        console.error(`Failed to send email ${email.id}:`, err.message);
        db.prepare('UPDATE outreach_emails SET status = "failed" WHERE id = ?').run(email.id);
      }
    }
  } catch (err) {
    console.error('Queue processing error:', err);
  }

  processing = false;
}

function getBaseUrl() {
  const port = process.env.PORT || 3000;
  return `http://localhost:${port}`;
}

module.exports = { processQueue };
