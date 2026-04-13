async function loadCampaigns() {
  try {
    const campaigns = await API.get('/campaigns');
    renderOutreachView(campaigns);
  } catch (err) {
    console.error('Failed to load campaigns:', err);
  }
}

function renderOutreachView(campaigns) {
  const el = document.getElementById('tab-outreach');
  el.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3>Outreach Campaigns</h3>
        <button class="btn btn-primary btn-sm" onclick="showNewCampaignModal()">+ New Campaign</button>
      </div>
      <div style="padding:1rem">
        <div class="outreach-intro">
          <p><strong>How campaigns work:</strong> A campaign sends the same email template to a group of prospects at once.
          You pick a template, choose who to target (by category, city, or pipeline status), preview exactly who will get the email, then send.
          The system tracks every email — who opened it, who clicked, who bounced — and automatically sends follow-ups to people who haven't responded.</p>
        </div>
      </div>
      ${campaigns.length === 0 ?
        '<div class="empty-msg" style="padding:2rem">No campaigns yet. Click "+ New Campaign" to start your first outreach blast!</div>' :
        `<div class="table-wrap">
          <table>
            <thead><tr>
              <th>Campaign</th>
              <th>Template</th>
              <th>Status</th>
              <th>Total</th>
              <th>Sent</th>
              <th>Opened</th>
              <th>Clicked</th>
              <th>Open Rate</th>
              <th>Created</th>
            </tr></thead>
            <tbody>
              ${campaigns.map(c => `
                <tr onclick="openCampaignDetail('${c.id}')" style="cursor:pointer">
                  <td class="biz-name">${esc(c.name)}</td>
                  <td>${esc(c.template_name || '-')}</td>
                  <td><span class="status-badge-sm" style="background:${getCampaignStatusColor(c.status)}">${c.status}</span></td>
                  <td>${c.total_emails || 0}</td>
                  <td>${c.sent_count || 0}</td>
                  <td>${c.opened_count || 0}</td>
                  <td>${c.clicked_count || 0}</td>
                  <td>${c.sent_count ? Math.round((c.opened_count / c.sent_count) * 100) + '%' : '-'}</td>
                  <td class="date-cell">${formatDate(c.created_at)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>`
      }
    </div>
    <div id="campaignDetail"></div>
  `;
}

function getCampaignStatusColor(status) {
  return { draft: '#95a5a6', active: '#3498db', paused: '#f1c40f', completed: '#2ecc71' }[status] || '#95a5a6';
}

let campaignPreviewProspects = [];

async function showNewCampaignModal() {
  const templates = await API.get('/templates');
  const initialTemplates = templates.filter(t => t.template_type === 'initial');
  const allTemplates = templates;

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal" style="max-width:750px">
      <div class="modal-header"><h3>New Outreach Campaign</h3><button class="close-btn" onclick="this.closest('.modal-overlay').remove()">&times;</button></div>
      <div class="modal-body">

        <div class="campaign-step">
          <div class="step-header"><span class="step-num">1</span> Name your campaign</div>
          <div class="field"><input id="campName" placeholder="e.g., Spring 2026 - Corporate Offices in Glenview" style="width:100%;font-size:1rem"></div>
        </div>

        <div class="campaign-step">
          <div class="step-header"><span class="step-num">2</span> Choose your email template</div>
          <p class="step-hint">Pick which email to send. Initial outreach templates are recommended for first contact.</p>
          <div class="field">
            <select id="campTemplate" onchange="previewCampaignTemplate()" style="font-size:0.95rem">
              <optgroup label="Initial Outreach">
                ${initialTemplates.map(t => `<option value="${t.id}">${esc(t.name)}${t.category ? ' (' + t.category + ')' : ''}</option>`).join('')}
              </optgroup>
              <optgroup label="Follow-ups & Other">
                ${allTemplates.filter(t => t.template_type !== 'initial').map(t => `<option value="${t.id}">${esc(t.name)}</option>`).join('')}
              </optgroup>
            </select>
          </div>
          <div id="campTemplatePreview" class="email-preview" style="margin-top:0.75rem;max-height:200px;overflow-y:auto"></div>
        </div>

        <div class="campaign-step">
          <div class="step-header"><span class="step-num">3</span> Who should receive this?</div>
          <p class="step-hint">Filter which prospects to include. Only prospects with an email address who haven't unsubscribed will be included. Leave filters blank to include everyone eligible.</p>
          <div class="form-grid">
            <div class="field"><label>Category</label>
              <select id="campCat" onchange="previewCampaignRecipients()">
                <option value="">All Categories</option>
                ${CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
              </select>
            </div>
            <div class="field"><label>City</label>
              <input id="campCity" list="campCityList" placeholder="All cities" oninput="previewCampaignRecipients()">
              <datalist id="campCityList">${SUGGESTED_CITIES.map(c => `<option value="${c}">`).join('')}</datalist>
            </div>
            <div class="field"><label>Pipeline Status</label>
              <select id="campStatus" onchange="previewCampaignRecipients()">
                <option value="">All Statuses</option>
                ${Object.entries(STATUS_LABELS).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}
              </select>
            </div>
            <div class="field"><label>Only prospects never emailed?</label>
              <select id="campNeverEmailed" onchange="previewCampaignRecipients()">
                <option value="">No filter</option>
                <option value="yes" selected>Yes, only never-emailed</option>
                <option value="no">No, include previously emailed</option>
              </select>
            </div>
          </div>
        </div>

        <div class="campaign-step">
          <div class="step-header"><span class="step-num">4</span> Preview recipients</div>
          <div id="campRecipientPreview" class="recipient-preview">
            <p class="empty-msg">Loading preview...</p>
          </div>
        </div>

      </div>
      <div class="modal-footer" style="justify-content:space-between">
        <span id="campRecipientCount" style="font-size:0.85rem;color:#666"></span>
        <div style="display:flex;gap:0.5rem">
          <button class="btn" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
          <button class="btn btn-primary" id="campSendBtn" onclick="createAndSendCampaign()" disabled>Create & Send Campaign</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Load initial preview
  previewCampaignTemplate();
  previewCampaignRecipients();
}

async function previewCampaignTemplate() {
  const templateId = document.getElementById('campTemplate')?.value;
  if (!templateId) return;
  try {
    const preview = await API.post(`/templates/${templateId}/preview`, {});
    const el = document.getElementById('campTemplatePreview');
    if (el) {
      el.innerHTML = `<div class="preview-subject"><strong>Subject:</strong> ${esc(preview.subject)}</div><div class="preview-body">${preview.body_html}</div>`;
    }
  } catch (err) { console.error(err); }
}

async function previewCampaignRecipients() {
  const params = new URLSearchParams();
  const cat = document.getElementById('campCat')?.value;
  const city = document.getElementById('campCity')?.value;
  const status = document.getElementById('campStatus')?.value;
  const neverEmailed = document.getElementById('campNeverEmailed')?.value;

  if (cat) params.set('category', cat);
  if (city) params.set('city', city);
  if (status) params.set('status', status);
  params.set('unsubscribed', 'false');

  try {
    const data = await API.get(`/prospects?${params}`);
    let prospects = data.prospects.filter(p => p.email); // must have email

    if (neverEmailed === 'yes') {
      prospects = prospects.filter(p => !p.email_count || p.email_count === 0);
    }

    campaignPreviewProspects = prospects;
    const el = document.getElementById('campRecipientPreview');
    const countEl = document.getElementById('campRecipientCount');
    const sendBtn = document.getElementById('campSendBtn');

    if (prospects.length === 0) {
      el.innerHTML = '<p class="empty-msg">No matching prospects found. Try adjusting your filters.</p>';
      countEl.textContent = '0 recipients';
      sendBtn.disabled = true;
    } else {
      el.innerHTML = `
        <div class="recipient-table-wrap">
          <table>
            <thead><tr><th>Business</th><th>Contact</th><th>Email</th><th>City</th><th>Category</th><th>Status</th></tr></thead>
            <tbody>
              ${prospects.slice(0, 50).map(p => `
                <tr>
                  <td>${esc(p.business_name)}</td>
                  <td>${esc(p.contact_name)}</td>
                  <td>${esc(p.email)}</td>
                  <td>${esc(p.city)}</td>
                  <td>${esc(p.category)}</td>
                  <td><span class="status-badge-sm" style="background:${STATUS_COLORS[p.pipeline_status]}">${STATUS_LABELS[p.pipeline_status]}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          ${prospects.length > 50 ? `<p style="padding:0.5rem;font-size:0.8rem;color:#666">Showing first 50 of ${prospects.length} recipients</p>` : ''}
        </div>
      `;
      countEl.textContent = `${prospects.length} recipient${prospects.length !== 1 ? 's' : ''} will receive this email`;
      sendBtn.disabled = false;
      sendBtn.textContent = `Create & Send to ${prospects.length} Prospects`;
    }
  } catch (err) {
    console.error(err);
  }
}

async function createAndSendCampaign() {
  const name = document.getElementById('campName').value.trim();
  const templateId = document.getElementById('campTemplate').value;

  if (!name) return showToast('Give your campaign a name', 'error');
  if (campaignPreviewProspects.length === 0) return showToast('No recipients to send to', 'error');

  if (!confirm(`Send this campaign to ${campaignPreviewProspects.length} prospects? Emails will be sent with a 1-second delay between each.`)) return;

  try {
    const campaign = await API.post('/campaigns', {
      name,
      template_id: templateId,
      filter_category: document.getElementById('campCat').value || null,
      filter_city: document.getElementById('campCity').value || null,
      filter_status: document.getElementById('campStatus').value || null
    });

    const result = await API.post(`/campaigns/${campaign.id}/send`, {
      prospect_ids: campaignPreviewProspects.map(p => p.id)
    });

    showToast(result.message);
    document.querySelector('.modal-overlay')?.remove();
    loadCampaigns();
  } catch (err) {
    showToast('Failed to create campaign', 'error');
  }
}

async function openCampaignDetail(id) {
  try {
    const data = await API.get(`/campaigns/${id}`);
    const el = document.getElementById('campaignDetail');
    const c = data.campaign;
    const totalEmails = data.emails.length;
    const sent = data.emails.filter(e => e.sent_at).length;
    const opened = data.emails.filter(e => e.opened_at).length;
    const clicked = data.emails.filter(e => e.clicked_at).length;

    el.innerHTML = `
      <div class="card" style="margin-top:1rem">
        <div class="card-header">
          <h3>${esc(c.name)}</h3>
          <span class="status-badge-sm" style="background:${getCampaignStatusColor(c.status)}">${c.status}</span>
        </div>
        <div style="padding:1rem">
          <div class="dashboard-grid" style="margin-bottom:1rem">
            <div class="stat-card"><div class="num">${totalEmails}</div><div class="label">Total Emails</div></div>
            <div class="stat-card"><div class="num" style="color:#3498db">${sent}</div><div class="label">Sent</div></div>
            <div class="stat-card"><div class="num" style="color:#27ae60">${opened}</div><div class="label">Opened</div></div>
            <div class="stat-card"><div class="num" style="color:#16a085">${clicked}</div><div class="label">Clicked</div></div>
            <div class="stat-card"><div class="num">${sent ? Math.round(opened/sent*100) : 0}%</div><div class="label">Open Rate</div></div>
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr>
              <th>Business</th>
              <th>Contact</th>
              <th>Email</th>
              <th>Status</th>
              <th>Sent</th>
              <th>Opened</th>
              <th>Clicked</th>
            </tr></thead>
            <tbody>
              ${data.emails.map(e => `
                <tr>
                  <td>${esc(e.business_name)}</td>
                  <td>${esc(e.contact_name)}</td>
                  <td>${esc(e.prospect_email)}</td>
                  <td><span class="status-badge-sm" style="background:${getEmailStatusColor(e.status)}">${e.status}</span></td>
                  <td class="date-cell">${e.sent_at ? formatDateTime(e.sent_at) : '-'}</td>
                  <td class="date-cell">${e.opened_at ? formatDateTime(e.opened_at) : '-'}</td>
                  <td class="date-cell">${e.clicked_at ? formatDateTime(e.clicked_at) : '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } catch (err) {
    console.error(err);
  }
}
