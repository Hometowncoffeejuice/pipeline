async function loadDashboard() {
  try {
    const data = await API.get('/dashboard');
    renderDashboard(data);
  } catch (err) {
    console.error('Failed to load dashboard:', err);
  }
}

function renderDashboard(data) {
  const el = document.getElementById('tab-dashboard');
  const p = data.pipeline;
  const o = data.outreach;

  el.innerHTML = `
    <div class="dashboard-grid">
      <div class="stat-card big">
        <div class="num">${p.total}</div>
        <div class="label">Total Prospects</div>
      </div>
      <div class="stat-card">
        <div class="num" style="color:${STATUS_COLORS.not_touched}">${p.not_touched}</div>
        <div class="label">Not Touched</div>
      </div>
      <div class="stat-card">
        <div class="num" style="color:${STATUS_COLORS.initial_outreach}">${p.initial_outreach}</div>
        <div class="label">Initial Outreach</div>
      </div>
      <div class="stat-card">
        <div class="num" style="color:${STATUS_COLORS.follow_up}">${p.follow_up}</div>
        <div class="label">Follow Up</div>
      </div>
      <div class="stat-card">
        <div class="num" style="color:${STATUS_COLORS.in_contact}">${p.in_contact}</div>
        <div class="label">In Contact</div>
      </div>
      <div class="stat-card">
        <div class="num" style="color:${STATUS_COLORS.secured}">${p.secured}</div>
        <div class="label">Secured</div>
      </div>
    </div>

    ${p.total > 0 ? `
    <div class="pipeline-bar">
      ${Object.entries(STATUS_COLORS).map(([status, color]) => {
        const count = p[status] || 0;
        const pct = (count / p.total * 100);
        return pct > 0 ? `<div style="width:${pct}%;background:${color}" title="${STATUS_LABELS[status]}: ${count}"></div>` : '';
      }).join('')}
    </div>` : ''}

    <div class="dashboard-grid" style="margin-top:1rem">
      <div class="stat-card">
        <div class="num">${o.total_sent}</div>
        <div class="label">Emails Sent</div>
      </div>
      <div class="stat-card">
        <div class="num">${o.open_rate}%</div>
        <div class="label">Open Rate</div>
      </div>
      <div class="stat-card">
        <div class="num">${o.click_rate}%</div>
        <div class="label">Click Rate</div>
      </div>
      <div class="stat-card">
        <div class="num">${o.week_sends}</div>
        <div class="label">Sent This Week</div>
      </div>
    </div>

    <div class="card" style="margin-top:1rem">
      <div class="card-header">
        <h3>Quick Actions</h3>
      </div>
      <div class="quick-actions">
        <button onclick="switchTab('prospects')" class="btn">View Prospects</button>
        <button onclick="switchTab('outreach')" class="btn btn-primary">New Campaign</button>
        <button onclick="switchTab('templates')" class="btn">Edit Templates</button>
      </div>
    </div>

    <div class="card" style="margin-top:1rem">
      <div class="card-header">
        <h3>Recent Activity</h3>
      </div>
      <div class="activity-feed">
        ${data.recent_activity.length === 0 ? '<p class="empty-msg">No activity yet. Start by adding prospects!</p>' :
          data.recent_activity.map(a => `
            <div class="activity-item">
              <span class="activity-icon">${getActivityIcon(a.action)}</span>
              <span class="activity-text"><strong>${esc(a.business_name || 'Unknown')}</strong> — ${getActivityLabel(a.action)}</span>
              <span class="activity-time">${formatDateTime(a.created_at)}</span>
            </div>
          `).join('')}
      </div>
    </div>
  `;
}

function getActivityIcon(action) {
  const icons = {
    created: '+',
    email_sent: '>>',
    email_opened: '**',
    email_clicked: '!!',
    email_delivered: '>>',
    email_bounced: 'X',
    status_changed: '~',
    note_added: '#',
    unsubscribed: '-'
  };
  return icons[action] || '?';
}

function getActivityLabel(action) {
  const labels = {
    created: 'Added to pipeline',
    email_sent: 'Email sent',
    email_opened: 'Opened email',
    email_clicked: 'Clicked email link',
    email_delivered: 'Email delivered',
    email_bounced: 'Email bounced',
    status_changed: 'Status changed',
    note_added: 'Note added',
    unsubscribed: 'Unsubscribed'
  };
  return labels[action] || action;
}
