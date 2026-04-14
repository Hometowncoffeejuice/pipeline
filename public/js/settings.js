async function loadSettings() {
  try {
    const settings = await API.get('/settings');
    const rules = await API.get('/settings/follow-up-rules');
    renderSettingsView(settings, rules);
  } catch (err) {
    console.error('Failed to load settings:', err);
  }
}

function renderSettingsView(settings, rules) {
  const el = document.getElementById('tab-settings');
  el.innerHTML = `
    <div class="card">
      <div class="card-header"><h3>Email Settings</h3></div>
      <div style="padding:1rem">
        <div class="form-grid">
          <div class="field">
            <label>Resend API Key</label>
            <input id="setResendKey" type="password" placeholder="${settings.resend_configured ? 'Configured (hidden)' : 'Enter your Resend API key'}" value="">
            <small>${settings.resend_configured ? 'API key is configured. Enter a new one to update.' : 'Get your API key from resend.com/api-keys'}</small>
          </div>
          <div class="field">
            <label>From Email</label>
            <input id="setFromEmail" value="${esc(settings.from_email || '')}" placeholder="catering@yourdomain.com">
          </div>
          <div class="field">
            <label>From Name</label>
            <input id="setFromName" value="${esc(settings.from_name || 'Adam at Hometown Coffee & Juice')}">
          </div>
          <div class="field">
            <label>Reply-To Email</label>
            <input id="setReplyTo" value="${esc(settings.reply_to_email || '')}" placeholder="adam@gmail.com">
            <small>Where prospect replies should land (e.g., your personal Gmail). Leave blank to use From Email.</small>
          </div>
          <div class="field">
            <label>Daily Send Limit</label>
            <input id="setDailyLimit" type="number" value="${settings.daily_send_limit || 80}">
          </div>
        </div>

        <h4 style="margin-top:1.5rem">Business Info & Links</h4>
        <div class="form-grid">
          <div class="field">
            <label>Catering Menu URL</label>
            <input id="setCateringUrl" value="${esc(settings.catering_url || '')}">
            <small>The Toast link where people can order catering</small>
          </div>
          <div class="field">
            <label>Catering Menu URL (PDF)</label>
            <input id="setMenuUrl" value="${esc(settings.menu_url || '')}" placeholder="https://yoursite.com/menu.pdf">
            <small>Link to your catering menu PDF or page</small>
          </div>
          <div class="field">
            <label>Booking / Calendar URL</label>
            <input id="setBookingUrl" value="${esc(settings.booking_url || '')}" placeholder="https://calendar.google.com/...">
            <small>Your Google Calendar booking link for scheduling calls</small>
          </div>
          <div class="field">
            <label>Business Address (for email footer)</label>
            <input id="setBizAddr" value="${esc(settings.business_address || '')}" placeholder="123 Main St, Glencoe IL 60022">
            <small>Required by CAN-SPAM law in every outreach email</small>
          </div>
        </div>

        <h4 style="margin-top:1.5rem">Email Signature</h4>
        <p style="font-size:0.85rem;color:#666;margin-bottom:0.5rem">Appended to the bottom of every outreach email, above the unsubscribe footer. Use inline HTML styles (Gmail-style signatures won't carry into Resend, so we replicate yours here).</p>
        <div class="field">
          <textarea id="setSignature" rows="10" style="width:100%;font-family:monospace;font-size:12px;padding:0.5rem;border:1px solid #ccc;border-radius:4px">${esc(settings.email_signature || '')}</textarea>
        </div>
        <details style="margin-top:0.5rem">
          <summary style="cursor:pointer;font-size:0.85rem;color:#5a8fc4">Preview signature</summary>
          <div id="sigPreview" style="margin-top:0.75rem;padding:1rem;background:#f9f9f9;border:1px solid #eee;border-radius:4px">${settings.email_signature || '<em style="color:#999">No signature saved</em>'}</div>
        </details>

        <button class="btn btn-primary" style="margin-top:1rem" onclick="saveSettings()">Save Settings</button>
      </div>
    </div>

    <div class="card" style="margin-top:1rem">
      <div class="card-header"><h3>Follow-up Automation Rules</h3></div>
      <div style="padding:1rem">
        <p style="font-size:0.85rem;color:#666;margin-bottom:1rem">When a prospect doesn't open your initial email, the system automatically sends follow-ups after these delays. Disable any rule to skip that follow-up.</p>
        <table style="width:100%">
          <thead><tr><th>Rule</th><th>Template</th><th>Days After Last Email</th><th>Enabled</th></tr></thead>
          <tbody>
            ${rules.map(r => `
              <tr>
                <td>${esc(r.name)}</td>
                <td>${esc(r.template_name || '-')}</td>
                <td>${r.days_delay} days</td>
                <td>
                  <input type="checkbox" ${r.enabled ? 'checked' : ''} onchange="toggleFollowUpRule('${r.id}', this.checked)">
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function saveSettings() {
  const data = {};
  const apiKey = document.getElementById('setResendKey').value.trim();
  if (apiKey) data.resend_api_key = apiKey;

  data.from_email = document.getElementById('setFromEmail').value.trim();
  data.from_name = document.getElementById('setFromName').value.trim();
  data.reply_to_email = document.getElementById('setReplyTo').value.trim();
  data.daily_send_limit = document.getElementById('setDailyLimit').value;
  data.catering_url = document.getElementById('setCateringUrl').value.trim();
  data.menu_url = document.getElementById('setMenuUrl').value.trim();
  data.booking_url = document.getElementById('setBookingUrl').value.trim();
  data.business_address = document.getElementById('setBizAddr').value.trim();
  data.email_signature = document.getElementById('setSignature').value;

  try {
    await API.put('/settings', data);
    showToast('Settings saved!');
  } catch (err) {
    showToast('Failed to save settings', 'error');
  }
}

async function toggleFollowUpRule(id, enabled) {
  try {
    await API.put(`/settings/follow-up-rules/${id}`, { enabled });
    showToast(enabled ? 'Rule enabled' : 'Rule disabled');
  } catch (err) {
    showToast('Failed to update rule', 'error');
  }
}
