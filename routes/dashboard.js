const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  // Pipeline counts
  const statuses = db.prepare(`
    SELECT pipeline_status, COUNT(*) as count FROM prospects GROUP BY pipeline_status
  `).all();

  const statusMap = {};
  statuses.forEach(s => statusMap[s.pipeline_status] = s.count);

  const total = db.prepare('SELECT COUNT(*) as c FROM prospects').get().c;

  // Outreach stats
  const emailStats = db.prepare(`
    SELECT
      COUNT(*) as total_sent,
      SUM(CASE WHEN status = 'opened' OR status = 'clicked' THEN 1 ELSE 0 END) as opened,
      SUM(CASE WHEN status = 'clicked' THEN 1 ELSE 0 END) as clicked,
      SUM(CASE WHEN status = 'bounced' THEN 1 ELSE 0 END) as bounced
    FROM outreach_emails WHERE sent_at IS NOT NULL
  `).get();

  // This week's sends
  const weekSends = db.prepare(`
    SELECT COUNT(*) as c FROM outreach_emails
    WHERE sent_at >= datetime('now', '-7 days')
  `).get().c;

  // Today's sends (for rate limit tracking)
  const todaySends = db.prepare(`
    SELECT COUNT(*) as c FROM outreach_emails
    WHERE sent_at >= date('now')
  `).get().c;

  // Recent activity
  const recentActivity = db.prepare(`
    SELECT a.*, p.business_name
    FROM activity_log a
    LEFT JOIN prospects p ON a.prospect_id = p.id
    ORDER BY a.created_at DESC LIMIT 20
  `).all();

  // Campaign stats
  const activeCampaigns = db.prepare(`
    SELECT COUNT(*) as c FROM outreach_campaigns WHERE status = 'active'
  `).get().c;

  res.json({
    pipeline: {
      total,
      not_touched: statusMap.not_touched || 0,
      initial_outreach: statusMap.initial_outreach || 0,
      follow_up: statusMap.follow_up || 0,
      in_contact: statusMap.in_contact || 0,
      secured: statusMap.secured || 0,
      lost: statusMap.lost || 0
    },
    outreach: {
      total_sent: emailStats.total_sent || 0,
      opened: emailStats.opened || 0,
      clicked: emailStats.clicked || 0,
      bounced: emailStats.bounced || 0,
      open_rate: emailStats.total_sent ? Math.round((emailStats.opened / emailStats.total_sent) * 100) : 0,
      click_rate: emailStats.total_sent ? Math.round((emailStats.clicked / emailStats.total_sent) * 100) : 0,
      week_sends: weekSends,
      today_sends: todaySends
    },
    active_campaigns: activeCampaigns,
    recent_activity: recentActivity
  });
});

module.exports = router;
