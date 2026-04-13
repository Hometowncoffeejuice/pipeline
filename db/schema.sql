-- Hometown Pipeline Database Schema

CREATE TABLE IF NOT EXISTS prospects (
  id TEXT PRIMARY KEY,
  business_name TEXT NOT NULL,
  category TEXT DEFAULT 'Corporate',
  contact_name TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  address TEXT DEFAULT '',
  city TEXT DEFAULT '',
  nearest_location TEXT DEFAULT '',
  website TEXT DEFAULT '',
  pipeline_status TEXT DEFAULT 'not_touched',
  source TEXT DEFAULT 'manual',
  notes TEXT DEFAULT '',
  unsubscribed INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS email_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT DEFAULT '',
  template_type TEXT DEFAULT 'initial',
  category TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS outreach_campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  template_id TEXT REFERENCES email_templates(id),
  status TEXT DEFAULT 'draft',
  filter_category TEXT,
  filter_city TEXT,
  filter_status TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS outreach_emails (
  id TEXT PRIMARY KEY,
  campaign_id TEXT REFERENCES outreach_campaigns(id),
  prospect_id TEXT REFERENCES prospects(id),
  template_id TEXT REFERENCES email_templates(id),
  subject TEXT,
  body_html TEXT,
  status TEXT DEFAULT 'queued',
  resend_id TEXT,
  scheduled_for TEXT,
  sent_at TEXT,
  opened_at TEXT,
  clicked_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS follow_up_rules (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  trigger_status TEXT DEFAULT 'sent',
  days_delay INTEGER NOT NULL,
  template_id TEXT REFERENCES email_templates(id),
  sequence_order INTEGER DEFAULT 1,
  enabled INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS activity_log (
  id TEXT PRIMARY KEY,
  prospect_id TEXT REFERENCES prospects(id),
  action TEXT NOT NULL,
  details TEXT DEFAULT '{}',
  created_at TEXT DEFAULT (datetime('now'))
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_prospects_status ON prospects(pipeline_status);
CREATE INDEX IF NOT EXISTS idx_prospects_category ON prospects(category);
CREATE INDEX IF NOT EXISTS idx_prospects_city ON prospects(city);
CREATE INDEX IF NOT EXISTS idx_outreach_emails_prospect ON outreach_emails(prospect_id);
CREATE INDEX IF NOT EXISTS idx_outreach_emails_campaign ON outreach_emails(campaign_id);
CREATE INDEX IF NOT EXISTS idx_outreach_emails_status ON outreach_emails(status);
CREATE INDEX IF NOT EXISTS idx_activity_log_prospect ON activity_log(prospect_id);
