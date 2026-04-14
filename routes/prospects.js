const express = require('express');
const router = express.Router();
const db = require('../db');
const { nanoid } = require('nanoid');

// List prospects with filters
router.get('/', (req, res) => {
  const { search, status, category, city, unsubscribed, limit, offset } = req.query;
  let where = [];
  let params = [];

  if (search) {
    where.push('(business_name LIKE ? OR contact_name LIKE ? OR email LIKE ?)');
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (status && status !== 'all') {
    where.push('pipeline_status = ?');
    params.push(status);
  }
  if (category && category !== 'all') {
    where.push('category = ?');
    params.push(category);
  }
  if (city && city !== 'all') {
    where.push('city = ?');
    params.push(city);
  }
  if (unsubscribed !== undefined) {
    where.push('unsubscribed = ?');
    params.push(unsubscribed === 'true' ? 1 : 0);
  }

  const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';
  const limitClause = limit ? `LIMIT ${parseInt(limit)}` : '';
  const offsetClause = offset ? `OFFSET ${parseInt(offset)}` : '';

  const prospects = db.prepare(`
    SELECT p.*,
      (SELECT COUNT(*) FROM outreach_emails WHERE prospect_id = p.id) as email_count,
      (SELECT MAX(sent_at) FROM outreach_emails WHERE prospect_id = p.id AND sent_at IS NOT NULL) as last_emailed
    FROM prospects p
    ${whereClause}
    ORDER BY p.updated_at DESC
    ${limitClause} ${offsetClause}
  `).all(...params);

  const total = db.prepare(`SELECT COUNT(*) as c FROM prospects ${whereClause}`).get(...params);

  res.json({ prospects, total: total.c });
});

// Get single prospect with activity
router.get('/:id', (req, res) => {
  const prospect = db.prepare(`
    SELECT p.*,
      (SELECT COUNT(*) FROM outreach_emails WHERE prospect_id = p.id) as email_count,
      (SELECT MAX(sent_at) FROM outreach_emails WHERE prospect_id = p.id AND sent_at IS NOT NULL) as last_emailed
    FROM prospects p WHERE p.id = ?
  `).get(req.params.id);

  if (!prospect) return res.status(404).json({ error: 'Not found' });

  const activity = db.prepare('SELECT * FROM activity_log WHERE prospect_id = ? ORDER BY created_at DESC LIMIT 50').all(req.params.id);
  const emails = db.prepare('SELECT * FROM outreach_emails WHERE prospect_id = ? ORDER BY created_at DESC').all(req.params.id);

  res.json({ prospect, activity, emails });
});

// Create prospect
router.post('/', (req, res) => {
  const { business_name, category, contact_name, phone, email, address, city, nearest_location, website, notes, source } = req.body;
  if (!business_name) return res.status(400).json({ error: 'Business name is required' });

  const id = nanoid();
  const loc = nearest_location || autoAssignLocation(city);

  db.prepare(`
    INSERT INTO prospects (id, business_name, category, contact_name, phone, email, address, city, nearest_location, website, notes, source)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, business_name, category || 'Corporate', contact_name || '', phone || '', email || '', address || '', city || '', loc, website || '', notes || '', source || 'manual');

  db.prepare('INSERT INTO activity_log (id, prospect_id, action, details) VALUES (?, ?, ?, ?)').run(
    nanoid(), id, 'created', JSON.stringify({ source: source || 'manual' })
  );

  const prospect = db.prepare('SELECT * FROM prospects WHERE id = ?').get(id);
  res.status(201).json(prospect);
});

// Update prospect
router.put('/:id', (req, res) => {
  const prospect = db.prepare('SELECT * FROM prospects WHERE id = ?').get(req.params.id);
  if (!prospect) return res.status(404).json({ error: 'Not found' });

  const fields = ['business_name', 'category', 'contact_name', 'phone', 'email', 'address', 'city', 'nearest_location', 'website', 'pipeline_status', 'notes', 'unsubscribed'];
  const updates = [];
  const params = [];

  for (const field of fields) {
    if (req.body[field] !== undefined) {
      updates.push(`${field} = ?`);
      params.push(req.body[field]);
    }
  }

  if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });

  updates.push("updated_at = datetime('now')");
  params.push(req.params.id);

  db.prepare(`UPDATE prospects SET ${updates.join(', ')} WHERE id = ?`).run(...params);

  // Log status changes
  if (req.body.pipeline_status && req.body.pipeline_status !== prospect.pipeline_status) {
    db.prepare('INSERT INTO activity_log (id, prospect_id, action, details) VALUES (?, ?, ?, ?)').run(
      nanoid(), req.params.id, 'status_changed',
      JSON.stringify({ from: prospect.pipeline_status, to: req.body.pipeline_status })
    );
  }

  const updated = db.prepare('SELECT * FROM prospects WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// Delete prospect
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM prospects WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
});

// CSV Export
router.get('/export/csv', (req, res) => {
  const prospects = db.prepare('SELECT * FROM prospects ORDER BY business_name').all();
  const headers = ['Business Name', 'Category', 'Contact', 'Phone', 'Email', 'Address', 'City', 'Nearest Location', 'Status', 'Notes', 'Created'];
  const rows = prospects.map(p => [
    p.business_name, p.category, p.contact_name, p.phone, p.email, p.address, p.city, p.nearest_location, p.pipeline_status, p.notes, p.created_at
  ]);

  const csv = [headers, ...rows].map(r => r.map(c => '"' + (c || '').replace(/"/g, '""') + '"').join(',')).join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=catering_pipeline_${new Date().toISOString().slice(0, 10)}.csv`);
  res.send(csv);
});

// CSV Import
router.post('/import/csv', (req, res) => {
  const { data, skip_duplicates } = req.body;
  if (!Array.isArray(data) || data.length === 0) return res.status(400).json({ error: 'No data provided' });

  const insert = db.prepare(`
    INSERT INTO prospects (id, business_name, category, contact_name, phone, email, address, city, nearest_location, website, notes, source)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'csv_import')
  `);

  // For duplicate detection: match on business_name (case-insensitive) OR email (if both exist)
  const findByName = db.prepare('SELECT id FROM prospects WHERE LOWER(business_name) = LOWER(?)');
  const findByEmail = db.prepare("SELECT id FROM prospects WHERE LOWER(email) = LOWER(?) AND email != ''");

  const insertMany = db.transaction((rows) => {
    let imported = 0;
    let skipped = 0;
    for (const row of rows) {
      if (!row.business_name) continue;

      if (skip_duplicates !== false) {
        const dupeByName = findByName.get(row.business_name);
        if (dupeByName) { skipped++; continue; }
        if (row.email) {
          const dupeByEmail = findByEmail.get(row.email);
          if (dupeByEmail) { skipped++; continue; }
        }
      }

      const id = nanoid();
      const city = row.city || '';
      insert.run(id, row.business_name, row.category || 'Corporate', row.contact_name || '', row.phone || '', row.email || '', row.address || '', city, row.nearest_location || autoAssignLocation(city), row.website || '', row.notes || '');
      imported++;
    }
    return { imported, skipped };
  });

  const result = insertMany(data);
  res.json(result);
});

function autoAssignLocation(city) {
  const c = (city || '').toLowerCase();
  if (c.includes('glencoe')) return 'Glencoe';
  if (c.includes('winnetka') || c.includes('wilmette') || c.includes('kenilworth')) return 'Winnetka';
  if (c.includes('glenview') || c.includes('northbrook') || c.includes('golf')) return 'Glenview';
  if (c.includes('lake forest') || c.includes('highland park') || c.includes('highwood') || c.includes('deerfield')) return 'Lake Forest';
  return '';
}

module.exports = router;
