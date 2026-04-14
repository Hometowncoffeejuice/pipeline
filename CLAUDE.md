# Hometown Pipeline — Catering Outreach Tool

## What This Is
A catering outreach pipeline tool for **Hometown Coffee & Juice**, a multi-location cafe on Chicago's North Shore (Glencoe, Winnetka, Glenview, Lake Forest). Catering is currently 1.7% of revenue vs 5-15% industry standard. This tool manages prospects, sends personalized outreach emails, automates follow-ups, and tracks engagement.

**Owner:** Adam Rubin (Adam@hometowncoffeejuice.com)
**Repo:** git@github.com:Hometowncoffeejuice/pipeline.git

## Tech Stack
- **Backend:** Node.js + Express v5, single `server.js` entry point
- **Database:** SQLite via better-sqlite3 (file at `db/hometown.db`)
- **Email:** Resend npm package (free tier 100/day, rate-limited to 80/day)
- **Scheduler:** node-cron for automated hourly follow-up checks
- **Frontend:** Vanilla HTML/CSS/JS (no framework, no build step), single-page app with tab navigation
- **Design:** Matches Hometown Command Center app — Navy #0C2340, Blue #5a8fc4, Gold #c9a962, Tan #ddd8cc

## Key Architecture
- `server.js` — Express entry point, mounts all routes, serves static from `public/`, starts scheduler
- `db/schema.sql` — 6 tables: prospects, email_templates, outreach_campaigns, outreach_emails, follow_up_rules, activity_log
- `db/seed.sql` — All email templates (10 initial: 5 standard + 5 with tasting offer, 2 follow-ups, plus 3 follow-up templates) and app_settings
- `db/migrate.js` — Runs schema + seed, creates default follow-up rules (7 day + 21 day)
- `routes/` — prospects.js, templates.js, campaigns.js, outreach.js, webhooks.js, dashboard.js, settings.js
- `services/emailer.js` — Resend integration, queue processing with 1-sec delays
- `services/scheduler.js` — Hourly cron checks for follow-ups due
- `public/js/` — app.js (nav/constants), prospects.js, outreach.js, templates.js, settings.js, help.js, dashboard.js

## Email Templates
- **10 initial outreach templates:** 5 categories (Corporate, Medical, School, Worship, General) x 2 versions (standard + "with tasting" offer)
- **2 follow-up templates:** Follow-up 1 (1 week after initial), Follow-up 2 / final (3 weeks after initial)
- Tone: Short, personal, from "Adam Rubin", commas not dashes, three CTA buttons (Book a Call, Order Catering, View Our Menu)
- Placeholders: `{{business_name}}`, `{{contact_name}}`, `{{city}}`, `{{nearest_location}}`, `{{catering_url}}`, `{{booking_url}}`, `{{menu_url}}`

## Pipeline Stages
not_touched → initial_outreach → follow_up → in_contact → secured → lost

## CSV Import (Smart)
- Fuzzy column matching (handles "Company Name", "E-mail", "Contact Person", "Industry", etc.)
- Category normalization (maps "Wealth Management", "Dental Practice", "Real Estate Brokerage", etc. to our 5 categories)
- Duplicate detection by business name (case-insensitive) or email
- Preview modal before importing
- Merges Contact Title into contact name, State/Zip into address, Employee count into notes
- Phone number formatting to (xxx) xxx-xxxx

## Prospect Detail Panel
- Navy header with business name + category/city subtitle
- "Start Outreach" button → inline compose area with auto-selected category-matching template
- Editable contact info card (all fields)
- Email history and activity feed

## Important URLs (in app_settings)
- Catering: Toast link
- Menu PDF: Squarespace hosted
- Booking: Google Calendar (needs to be set up by Adam)

## Database Rebuild
When changing templates or schema: `rm db/hometown.db && node db/migrate.js`

## Express v5 Note
Uses `/{*path}` for wildcard routes (not `*`), which throws PathError in Express v5.

## Git Config
- user.email: Adam@hometowncoffeejuice.com
- user.name: Adam Rubin
- Remote uses SSH (git@github.com:...)

## Still Needs Setup
- Google Calendar booking link (booking_url in Settings)
- Resend account + verified domain (resend_api_key + from_email in Settings)
- Business address for CAN-SPAM footer (business_address in Settings)
