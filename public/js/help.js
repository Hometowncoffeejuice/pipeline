function loadHelp() {
  const el = document.getElementById('tab-help');
  el.innerHTML = `
    <div class="help-wrap">

      <!-- Hero -->
      <div class="help-hero">
        <h2>Welcome to <span class="accent">Hometown Pipeline</span></h2>
        <p>Your catering outreach command center. Track prospects, send personalized emails, and turn cold leads into recurring catering clients — without the spreadsheet chaos.</p>
        <div class="hero-pills">
          <span class="hero-pill">4 North Shore locations</span>
          <span class="hero-pill">6-stage pipeline</span>
          <span class="hero-pill">12 email templates</span>
          <span class="hero-pill">Manual follow-ups</span>
        </div>
      </div>

      <!-- How it works flow -->
      <div>
        <div class="help-section-title">How It Works</div>
        <div class="help-flow">
          <div class="help-flow-card">
            <div class="flow-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
            </div>
            <h4>1. Add Prospects</h4>
            <p>Import a CSV or add businesses manually. Each gets a contact, category, and auto-assigned nearest Hometown location.</p>
          </div>
          <div class="help-flow-card gold">
            <div class="flow-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <h4>2. Send Outreach</h4>
            <p>Open a prospect and click <strong>Start Outreach</strong>. Pick a template, preview the personalized email, send.</p>
          </div>
          <div class="help-flow-card navy">
            <div class="flow-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            </div>
            <h4>3. Track Engagement</h4>
            <p>Resend webhooks pipe opens and clicks back to the dashboard. Engaged prospects auto-advance to In Contact.</p>
          </div>
          <div class="help-flow-card green">
            <div class="flow-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h4>4. Close the Deal</h4>
            <p>When someone replies, click <strong>Mark as In Contact</strong>. Manually send follow-ups only when it makes sense.</p>
          </div>
        </div>
      </div>

      <!-- Callout — Manual follow-up change -->
      <div class="help-callout blue">
        <div class="callout-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <div>
          <h4>You control every send</h4>
          <p>Automatic follow-ups are <strong>disabled</strong>. Nothing goes out without an explicit click from you. After an initial email is sent, the prospect panel shows two buttons: <strong>Send Follow-up</strong> (if you still haven't heard back) and <strong>Mark as In Contact</strong> (if they replied). This keeps the system safe while we build inbound email detection later.</p>
        </div>
      </div>

      <!-- Quick Start -->
      <div class="help-quickstart">
        <div class="help-section-title">Quick Start</div>
        <div class="help-steps">
          <div class="help-step">
            <div class="step-circle">1</div>
            <h5>Configure Settings</h5>
            <p>Resend API key, from email, booking URL, business address.</p>
          </div>
          <div class="help-step">
            <div class="step-circle">2</div>
            <h5>Add Prospects</h5>
            <p>Manually or import a CSV from the old tracker.</p>
          </div>
          <div class="help-step">
            <div class="step-circle">3</div>
            <h5>Send Test Email</h5>
            <p>Pick one prospect, send to yourself first to verify the flow.</p>
          </div>
          <div class="help-step">
            <div class="step-circle">4</div>
            <h5>Start Real Outreach</h5>
            <p>Send to 10-20 prospects. Watch for opens and clicks on the dashboard.</p>
          </div>
          <div class="help-step">
            <div class="step-circle">5</div>
            <h5>Follow Up Manually</h5>
            <p>Check weekly. Send a Follow-up, or Mark as In Contact if they replied.</p>
          </div>
          <div class="help-step">
            <div class="step-circle">6</div>
            <h5>Close &amp; Repeat</h5>
            <p>When they book catering, move to Secured. Then do it again.</p>
          </div>
        </div>
      </div>

      <!-- Pipeline Stages -->
      <div class="help-pipeline">
        <div class="help-section-title">Pipeline Stages</div>
        <p style="font-size:0.88rem;color:var(--navy-light);line-height:1.55">Every prospect moves through these six stages. Most transitions happen automatically — you only need to manually flip someone to <strong>Secured</strong> or <strong>Lost</strong>.</p>
        <div class="help-pipeline-stages">
          <div class="help-pipeline-stage" style="background:#95a5a6">Not Touched<span class="stage-label">No outreach yet</span></div>
          <div class="help-pipeline-stage" style="background:var(--blue)">Initial Outreach<span class="stage-label">First email sent</span></div>
          <div class="help-pipeline-stage" style="background:#f39c12">Follow Up<span class="stage-label">Follow-up sent</span></div>
          <div class="help-pipeline-stage" style="background:var(--gold);color:var(--navy)">In Contact<span class="stage-label">Opened or replied</span></div>
          <div class="help-pipeline-stage" style="background:#2ecc71">Secured<span class="stage-label">Booked catering</span></div>
          <div class="help-pipeline-stage" style="background:#e74c3c">Lost<span class="stage-label">Not a fit</span></div>
        </div>
      </div>

      <!-- Tab guide -->
      <div>
        <div class="help-section-title">The Tabs</div>
        <div class="help-tab-grid">

          <div class="help-tab-card">
            <div class="help-tab-card-header">
              <div class="tab-icon navy">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              </div>
              <h4>Dashboard</h4>
            </div>
            <div class="help-tab-card-body">
              <ul>
                <li><strong>Pipeline funnel</strong> — prospect count at each stage.</li>
                <li><strong>Outreach stats</strong> — sent, open rate, click rate, this-week totals.</li>
                <li><strong>Recent Activity</strong> — live feed of sends, opens, clicks, status changes.</li>
              </ul>
            </div>
          </div>

          <div class="help-tab-card">
            <div class="help-tab-card-header">
              <div class="tab-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <h4>Prospects</h4>
            </div>
            <div class="help-tab-card-body">
              <ul>
                <li><strong>Add manually</strong> — business name required; everything else optional.</li>
                <li><strong>Smart CSV import</strong> — auto-detects column names, dedupes, normalizes categories.</li>
                <li><strong>Click any row</strong> to open the detail panel with contact info, email history, and action buttons.</li>
                <li><strong>Bulk select</strong> checkboxes for multi-prospect campaign sends.</li>
                <li><strong>Filters</strong> by status, category, city + search.</li>
              </ul>
            </div>
          </div>

          <div class="help-tab-card">
            <div class="help-tab-card-header">
              <div class="tab-icon gold">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <h4>Outreach (Campaigns)</h4>
            </div>
            <div class="help-tab-card-body">
              <ul>
                <li><strong>4-step wizard</strong> — name, template, filters, preview recipients.</li>
                <li><strong>Filter by</strong> category, city, pipeline status, or "only never-emailed."</li>
                <li><strong>Rate limited</strong> — 1 email per second, max 80/day.</li>
                <li><strong>Track per-email status</strong> in the campaign detail view.</li>
              </ul>
            </div>
          </div>

          <div class="help-tab-card">
            <div class="help-tab-card-header">
              <div class="tab-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              </div>
              <h4>Templates</h4>
            </div>
            <div class="help-tab-card-body">
              <ul>
                <li><strong>10 initial</strong> — 5 categories × 2 versions (standard + tasting offer).</li>
                <li><strong>2 follow-ups</strong> — Follow-up 1 (gentle) and Final Follow-up.</li>
                <li><strong>Placeholders</strong> auto-fill from prospect data (see below).</li>
                <li><strong>Click to edit</strong> — rich editor with preview.</li>
              </ul>
            </div>
          </div>

          <div class="help-tab-card">
            <div class="help-tab-card-header">
              <div class="tab-icon gold">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              </div>
              <h4>Settings</h4>
            </div>
            <div class="help-tab-card-body">
              <ul>
                <li><strong>Resend API key</strong> + from email + signature.</li>
                <li><strong>Daily send limit</strong> (default 80).</li>
                <li><strong>Catering / booking / menu URLs</strong> — used as placeholders.</li>
                <li><strong>Business address</strong> — required by CAN-SPAM law.</li>
              </ul>
            </div>
          </div>

          <div class="help-tab-card">
            <div class="help-tab-card-header">
              <div class="tab-icon navy">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <h4>Help (you are here)</h4>
            </div>
            <div class="help-tab-card-body">
              <p>Everything you need to know about using the app. If you find yourself wishing something was documented better, tell Claude.</p>
            </div>
          </div>

        </div>
      </div>

      <!-- Placeholders -->
      <div class="help-placeholders">
        <div class="help-section-title">Template Placeholders</div>
        <p style="font-size:0.88rem;color:var(--navy-light);line-height:1.55">Drop these into any email template and they'll auto-fill from each prospect's data at send time. If a field is empty, the renderer substitutes a safe default — you'll never send an email with a leaked <code style="background:var(--cream);padding:1px 4px;border-radius:3px;font-size:0.82rem">{{placeholder}}</code>.</p>
        <div class="help-placeholder-grid">
          <div class="help-placeholder"><code>{{contact_name}}</code><span>First name (or "there")</span></div>
          <div class="help-placeholder"><code>{{business_name}}</code><span>Their business</span></div>
          <div class="help-placeholder"><code>{{city}}</code><span>Their city</span></div>
          <div class="help-placeholder"><code>{{nearest_location}}</code><span>Auto-assigned HCJ location</span></div>
          <div class="help-placeholder"><code>{{catering_url}}</code><span>Toast order link</span></div>
          <div class="help-placeholder"><code>{{booking_url}}</code><span>Calendar link</span></div>
          <div class="help-placeholder"><code>{{menu_url}}</code><span>Menu PDF link</span></div>
        </div>
      </div>

      <!-- Callout — Fool-proof rendering -->
      <div class="help-callout">
        <div class="callout-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <div>
          <h4>Fool-proof email rendering</h4>
          <p>Every email runs through four layers of safety before it leaves the app: missing fields get safe fallbacks (e.g. empty contact becomes "there"), unmapped cities default to the Glencoe location, leftover placeholders trigger a refusal to send, and the queue re-checks at the last mile. You can't accidentally send a "Hi {{contact_name}}" email — the system literally won't let it happen.</p>
        </div>
      </div>

      <!-- Pro Tips -->
      <div>
        <div class="help-section-title">Pro Tips</div>
        <div class="help-tips-grid">
          <div class="help-tip">
            <div class="tip-icon">1</div>
            <div>
              <h5>Start small</h5>
              <p>Send to 10-20 first. Make sure everything looks right before a big blast.</p>
            </div>
          </div>
          <div class="help-tip">
            <div class="tip-icon">2</div>
            <div>
              <h5>Fill in contact names</h5>
              <p>"Hi Jane" converts way better than "Hi there." Research before adding.</p>
            </div>
          </div>
          <div class="help-tip">
            <div class="tip-icon">3</div>
            <div>
              <h5>Respond fast</h5>
              <p>When someone opens or clicks, reach out personally that day.</p>
            </div>
          </div>
          <div class="help-tip">
            <div class="tip-icon">4</div>
            <div>
              <h5>Use category templates</h5>
              <p>Medical offices care about different things than corporate. Tailored templates convert.</p>
            </div>
          </div>
          <div class="help-tip">
            <div class="tip-icon">5</div>
            <div>
              <h5>Push the call</h5>
              <p>The booking link is your weapon. Scheduled calls become regular clients 10× more often.</p>
            </div>
          </div>
          <div class="help-tip">
            <div class="tip-icon">6</div>
            <div>
              <h5>Sell recurring</h5>
              <p>A weekly Monday lunch is worth 50× a one-time order. Pitch the relationship.</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  `;
}
