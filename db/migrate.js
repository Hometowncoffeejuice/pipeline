const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const { nanoid } = require('nanoid');

const DB_PATH = path.join(__dirname, 'hometown.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');
const SEED_PATH = path.join(__dirname, 'seed.sql');

console.log('Initializing database at', DB_PATH);

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Run schema
const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
db.exec(schema);
console.log('Schema applied.');

// Run seed if templates table is empty
const count = db.prepare('SELECT COUNT(*) as c FROM email_templates').get();
if (count.c === 0) {
  const seed = fs.readFileSync(SEED_PATH, 'utf8');
  db.exec(seed);
  console.log('Seed data inserted.');
} else {
  console.log('Seed data already exists, skipping.');
}

// Insert default follow-up rules if empty
const ruleCount = db.prepare('SELECT COUNT(*) as c FROM follow_up_rules').get();
if (ruleCount.c === 0) {
  const insertRule = db.prepare(`
    INSERT INTO follow_up_rules (id, name, trigger_status, days_delay, template_id, sequence_order, enabled)
    VALUES (?, ?, ?, ?, ?, ?, 1)
  `);
  // These reference template IDs that get created in seed.sql
  // 1 week after initial outreach, 3 weeks after initial outreach
  insertRule.run(nanoid(), 'First Follow-up (1 week)', 'sent', 7, 'tpl_followup1', 1);
  insertRule.run(nanoid(), 'Final Follow-up (3 weeks)', 'sent', 21, 'tpl_followup2', 2);
  console.log('Default follow-up rules created.');
}

db.close();
console.log('Migration complete.');
