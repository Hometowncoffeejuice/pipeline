// Rebuilds email templates + signature in the live DB and regenerates seed.sql
// to stay in sync. Run: node db/rebuild-templates.js

const db = require('./index');
const fs = require('fs');
const path = require('path');

// ---------------- BUTTON BLOCK ----------------
// 3 equal-width buttons, all Hometown blue. Primary filled, other two outlined.
// Using width="33.33%" + display:block + matching borders keeps them pixel-identical.
const buttonBlock = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:28px 0;max-width:440px">
  <tr>
    <td width="33.33%" style="padding:0 3px">
      <a href="{{booking_url}}" style="display:block;padding:10px 4px;background:#5a8fc4;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;font-size:13px;text-align:center;font-family:Arial,sans-serif;border:1px solid #5a8fc4;letter-spacing:0.2px">Book a Call</a>
    </td>
    <td width="33.33%" style="padding:0 3px">
      <a href="{{catering_url}}" style="display:block;padding:10px 4px;background:#ffffff;color:#5a8fc4;text-decoration:none;border-radius:6px;font-weight:600;font-size:13px;text-align:center;font-family:Arial,sans-serif;border:1px solid #5a8fc4;letter-spacing:0.2px">Order Catering</a>
    </td>
    <td width="33.33%" style="padding:0 3px">
      <a href="{{menu_url}}" style="display:block;padding:10px 4px;background:#ffffff;color:#5a8fc4;text-decoration:none;border-radius:6px;font-weight:600;font-size:13px;text-align:center;font-family:Arial,sans-serif;border:1px solid #5a8fc4;letter-spacing:0.2px">View Menu</a>
    </td>
  </tr>
</table>`;

// Follow-up final uses slightly different ordering (no booking-first)
const buttonBlockFinal = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:28px 0;max-width:440px">
  <tr>
    <td width="33.33%" style="padding:0 3px">
      <a href="{{catering_url}}" style="display:block;padding:10px 4px;background:#5a8fc4;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;font-size:13px;text-align:center;font-family:Arial,sans-serif;border:1px solid #5a8fc4;letter-spacing:0.2px">Order Catering</a>
    </td>
    <td width="33.33%" style="padding:0 3px">
      <a href="{{menu_url}}" style="display:block;padding:10px 4px;background:#ffffff;color:#5a8fc4;text-decoration:none;border-radius:6px;font-weight:600;font-size:13px;text-align:center;font-family:Arial,sans-serif;border:1px solid #5a8fc4;letter-spacing:0.2px">View Menu</a>
    </td>
    <td width="33.33%" style="padding:0 3px">
      <a href="{{booking_url}}" style="display:block;padding:10px 4px;background:#ffffff;color:#5a8fc4;text-decoration:none;border-radius:6px;font-weight:600;font-size:13px;text-align:center;font-family:Arial,sans-serif;border:1px solid #5a8fc4;letter-spacing:0.2px">Chat With Me</a>
    </td>
  </tr>
</table>`;

// ---------------- SIGNATURE ----------------
// Each field on its own line with a fixed-width label column so nothing wraps.
// Website display text drops the protocol to avoid long-URL line breaks.
const signature = `<div style="font-family:Arial,sans-serif;font-size:14px;color:#222;margin-top:36px">
  <div style="font-size:22px;color:#5a8fc4;font-weight:700;margin-bottom:2px;line-height:1.2">Adam Rubin</div>
  <div style="font-weight:700;color:#222;line-height:1.4">Hometown Coffee &amp; Juice</div>
  <div style="color:#555;line-height:1.4;margin-bottom:10px">Business Development Manager</div>
  <hr style="border:none;border-top:1px solid #d0d0d0;margin:10px 0;width:280px">
  <div style="line-height:1.8"><span style="color:#5a8fc4;font-weight:700;display:inline-block;width:72px">Mobile</span>847-224-5578</div>
  <div style="line-height:1.8"><span style="color:#5a8fc4;font-weight:700;display:inline-block;width:72px">Email</span><a href="mailto:adam@hometowncoffeejuice.com" style="color:#5a8fc4;text-decoration:none">adam@hometowncoffeejuice.com</a></div>
  <div style="line-height:1.8"><span style="color:#5a8fc4;font-weight:700;display:inline-block;width:72px">Website</span><a href="https://hometowncoffeejuice.com" style="color:#5a8fc4;text-decoration:none">hometowncoffeejuice.com</a></div>
  <div style="line-height:1.8"><span style="color:#5a8fc4;font-weight:700;display:inline-block;width:72px">Address</span>700 Vernon Ave., Glencoe IL</div>
</div>`;

// ---------------- COPY ----------------
// Tighter, more Adam-sounding. Commas not em-dashes. Concrete items. Less hedging.
const bodyParagraphs = {
  corporate: [
    `Adam Rubin here, Hometown Coffee & Juice in {{nearest_location}}. We cater breakfast and lunch for a lot of offices on the North Shore, everything from standing weekly orders to one-off team meetings.`,
    `If {{business_name}} ever brings food in for the team, I'd like to put something together for you. Quick call or just hit reply, whichever is easier.`
  ],
  corporate_tasting: [
    `Adam Rubin here, Hometown Coffee & Juice in {{nearest_location}}. We cater breakfast and lunch for a lot of offices on the North Shore, everything from standing weekly orders to one-off team meetings.`,
    `If {{business_name}} ever brings food in for the team, I'd like to put something together for you. Happy to swing by with a small tasting first, coffee, pastries, a sandwich or two, on me. Easiest way to see what we do.`
  ],
  medical: [
    `Adam Rubin here, Hometown Coffee & Juice in {{nearest_location}}. A handful of practices in {{city}} have us drop off breakfast or lunch for their staff, morning coffee and bagels, sandwich trays for longer days, that sort of thing.`,
    `If catering is ever useful for {{business_name}}, I'd love to put together something that fits your schedule.`
  ],
  medical_tasting: [
    `Adam Rubin here, Hometown Coffee & Juice in {{nearest_location}}. A handful of practices in {{city}} have us drop off breakfast or lunch for their staff, morning coffee and bagels, sandwich trays for longer days, that sort of thing.`,
    `If catering is ever useful for {{business_name}}, I'd love to put together something that fits your schedule. Happy to bring by a small tasting for the staff first, on me, so you can see what we do before committing.`
  ],
  school: [
    `Adam Rubin here, Hometown Coffee & Juice in {{nearest_location}}. We cater quite a few schools and PTOs in the area, teacher appreciation breakfasts, board meetings, staff lunches, end-of-year events.`,
    `If {{business_name}} has anything coming up, happy to put together a menu that fits your group and your budget.`
  ],
  school_tasting: [
    `Adam Rubin here, Hometown Coffee & Juice in {{nearest_location}}. We cater quite a few schools and PTOs in the area, teacher appreciation breakfasts, board meetings, staff lunches, end-of-year events.`,
    `If {{business_name}} has anything coming up, happy to put together a menu that fits. I can also drop off a tasting tray for the staff room if it'd help, on me.`
  ],
  worship: [
    `Adam Rubin here, Hometown Coffee & Juice in {{nearest_location}}. We cater for a few congregations and community groups in the area, fellowship gatherings, holiday meals, staff lunches, committee meetings.`,
    `If {{business_name}} ever brings food in, I'd love to put something together. Simple menu, all local, and we deliver and set up.`
  ],
  worship_tasting: [
    `Adam Rubin here, Hometown Coffee & Juice in {{nearest_location}}. We cater for a few congregations and community groups in the area, fellowship gatherings, holiday meals, staff lunches, committee meetings.`,
    `If {{business_name}} ever brings food in, I'd love to put something together. Happy to drop by a tasting for your next gathering first, on me, so people can see what we do.`
  ],
  general: [
    `Adam Rubin here, Hometown Coffee & Juice in {{nearest_location}}. We cater for businesses, offices, schools, and events around {{city}}, breakfast trays, lunch spreads, one-time and recurring.`,
    `If {{business_name}} ever needs food brought in, I'd like to be the first call. Quick call or reply here, whichever works.`
  ],
  general_tasting: [
    `Adam Rubin here, Hometown Coffee & Juice in {{nearest_location}}. We cater for businesses, offices, schools, and events around {{city}}, breakfast trays, lunch spreads, one-time and recurring.`,
    `If {{business_name}} ever needs food brought in, I'd like to be the first call. Happy to swing by with a small tasting first, on me, so you can see what we do before committing.`
  ],
  followup1: [
    `Circling back on my note from last week about catering at {{business_name}}. I know inboxes get busy.`,
    `If catering isn't on your radar right now, no problem, just let me know and I won't keep reaching out. If it is, I can send over a menu or jump on a quick call.`
  ],
  followup2: [
    `Last one from me, promise.`,
    `If catering at {{business_name}} ever comes up, keep us in mind. We handle a lot of the offices, schools, and practices around {{city}}, and I'd love to be your spot when the time's right.`,
    `Links below for whenever you need them.`
  ]
};

// ---------------- ASSEMBLE ----------------
function buildHtml(paragraphs, buttons = buttonBlock) {
  const intro = `<p style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#222;margin:0 0 14px 0">Hi {{contact_name}},</p>`;
  const body = paragraphs.map(p =>
    `<p style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#222;margin:0 0 14px 0">${p}</p>`
  ).join('\n');
  const close = `<p style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#222;margin:0">Best,</p>`;
  return `${intro}\n${body}\n${buttons}\n${close}`;
}

function buildText(paragraphs, isFinal = false) {
  const lines = [`Hi {{contact_name}},`, ``];
  paragraphs.forEach(p => { lines.push(p.replace(/<[^>]+>/g, '')); lines.push(''); });
  if (isFinal) {
    lines.push(`Order catering: {{catering_url}}`);
    lines.push(`View menu: {{menu_url}}`);
    lines.push(`Chat with me: {{booking_url}}`);
  } else {
    lines.push(`Book a call: {{booking_url}}`);
    lines.push(`Order catering: {{catering_url}}`);
    lines.push(`View menu: {{menu_url}}`);
  }
  lines.push('', 'Best,');
  return lines.join('\n');
}

const templates = [
  { id: 'tpl_initial_corporate', name: 'Corporate - Initial Outreach', subject: 'Lunch for the team at {{business_name}}?', type: 'initial', category: 'Corporate', key: 'corporate' },
  { id: 'tpl_initial_medical', name: 'Medical - Initial Outreach', subject: 'Catering for your {{city}} practice', type: 'initial', category: 'Medical', key: 'medical' },
  { id: 'tpl_initial_school', name: 'School - Initial Outreach', subject: 'Catering for {{business_name}} events', type: 'initial', category: 'School', key: 'school' },
  { id: 'tpl_initial_worship', name: 'Worship - Initial Outreach', subject: 'Catering for {{business_name}} gatherings', type: 'initial', category: 'Worship', key: 'worship' },
  { id: 'tpl_initial_general', name: 'General - Initial Outreach', subject: 'Catering from Hometown near {{city}}', type: 'initial', category: null, key: 'general' },
  { id: 'tpl_initial_corporate_tasting', name: 'Corporate - Initial + Tasting', subject: 'Lunch for the team at {{business_name}}?', type: 'initial', category: 'Corporate', key: 'corporate_tasting' },
  { id: 'tpl_initial_medical_tasting', name: 'Medical - Initial + Tasting', subject: 'Catering for your {{city}} practice', type: 'initial', category: 'Medical', key: 'medical_tasting' },
  { id: 'tpl_initial_school_tasting', name: 'School - Initial + Tasting', subject: 'Catering for {{business_name}} events', type: 'initial', category: 'School', key: 'school_tasting' },
  { id: 'tpl_initial_worship_tasting', name: 'Worship - Initial + Tasting', subject: 'Catering for {{business_name}} gatherings', type: 'initial', category: 'Worship', key: 'worship_tasting' },
  { id: 'tpl_initial_general_tasting', name: 'General - Initial + Tasting', subject: 'Catering from Hometown near {{city}}', type: 'initial', category: null, key: 'general_tasting' },
  { id: 'tpl_followup1', name: 'Follow-up 1', subject: 'Following up on catering', type: 'follow_up_1', category: null, key: 'followup1' },
  { id: 'tpl_followup2', name: 'Final Follow-up', subject: 'Just checking in on catering', type: 'follow_up_2', category: null, key: 'followup2', final: true }
];

// ---------------- UPDATE LIVE DB ----------------
const upsert = db.prepare(`
  INSERT INTO email_templates (id, name, subject, body_html, body_text, template_type, category, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
  ON CONFLICT(id) DO UPDATE SET
    name = excluded.name,
    subject = excluded.subject,
    body_html = excluded.body_html,
    body_text = excluded.body_text,
    template_type = excluded.template_type,
    category = excluded.category,
    updated_at = datetime('now')
`);

for (const t of templates) {
  const paras = bodyParagraphs[t.key];
  const buttons = t.final ? buttonBlockFinal : buttonBlock;
  const html = buildHtml(paras, buttons);
  const text = buildText(paras, t.final);
  upsert.run(t.id, t.name, t.subject, html, text, t.type, t.category);
}

// Update signature
db.prepare(`
  INSERT INTO app_settings (key, value) VALUES (?, ?)
  ON CONFLICT(key) DO UPDATE SET value = excluded.value
`).run('email_signature', signature);

console.log(`Updated ${templates.length} templates and signature in live DB.`);

// ---------------- REGENERATE seed.sql ----------------
function sqlEscape(s) { return s.replace(/'/g, "''"); }

const seedLines = [
  `-- Starter Email Templates (auto-generated by db/rebuild-templates.js)`,
  ``
];

for (const t of templates) {
  const paras = bodyParagraphs[t.key];
  const buttons = t.final ? buttonBlockFinal : buttonBlock;
  const html = buildHtml(paras, buttons);
  const text = buildText(paras, t.final);
  const categoryVal = t.category ? `'${sqlEscape(t.category)}'` : 'NULL';
  seedLines.push(
    `INSERT INTO email_templates (id, name, subject, body_html, body_text, template_type, category) VALUES`,
    `('${t.id}', '${sqlEscape(t.name)}', '${sqlEscape(t.subject)}',`,
    `'${sqlEscape(html)}',`,
    `'${sqlEscape(text)}',`,
    `'${t.type}', ${categoryVal});`,
    ``
  );
}

seedLines.push(
  `-- App settings (stored as key-value)`,
  `CREATE TABLE IF NOT EXISTS app_settings (`,
  `  key TEXT PRIMARY KEY,`,
  `  value TEXT`,
  `);`,
  ``,
  `INSERT OR IGNORE INTO app_settings (key, value) VALUES`,
  `('from_email', ''),`,
  `('from_name', 'Adam Rubin at Hometown Coffee & Juice'),`,
  `('reply_to_email', ''),`,
  `('email_signature', '${sqlEscape(signature)}'),`,
  `('daily_send_limit', '80'),`,
  `('catering_url', 'https://www.toasttab.com/catering/locations/9e8dfec4-1c78-4969-8a56-a932e6035c08'),`,
  `('menu_url', 'https://static1.squarespace.com/static/5e83ff731e783a000bed08be/t/69d6b518e4daaf252f859ba4/1775678744575/Hometown+Catering+Menu+%28DIGITAL%29++2026+%281%29.pdf'),`,
  `('booking_url', 'https://calendar.google.com/calendar/appointments/schedules/AcZssZ1BFiYhd0UPEiCqYILN87pWEEqYPfM7bykLdjnjblojctuFDvCaF8eTsnGES2ObitYG4Z48Bp10'),`,
  `('resend_api_key', ''),`,
  `('business_address', '700 Vernon Ave., Glencoe IL'),`,
  `('location_glencoe', 'Glencoe'),`,
  `('location_winnetka', 'Winnetka'),`,
  `('location_glenview', 'Glenview'),`,
  `('location_lake_forest', 'Lake Forest');`,
  ``
);

const seedPath = path.join(__dirname, 'seed.sql');
fs.writeFileSync(seedPath, seedLines.join('\n'));
console.log(`Regenerated ${seedPath}`);
