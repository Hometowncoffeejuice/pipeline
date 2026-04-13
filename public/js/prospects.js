let prospectsData = [];
let selectedProspects = new Set();
let prospectDetailOpen = null;

async function loadProspects() {
  try {
    const search = document.getElementById('prospectSearch')?.value || '';
    const status = document.getElementById('prospectStatusFilter')?.value || 'all';
    const category = document.getElementById('prospectCatFilter')?.value || 'all';
    const city = document.getElementById('prospectCityFilter')?.value || '';

    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status !== 'all') params.set('status', status);
    if (category !== 'all') params.set('category', category);
    if (city && city !== 'all') params.set('city', city);

    const data = await API.get(`/prospects?${params}`);
    prospectsData = data.prospects;
    renderProspectsView(data);
  } catch (err) {
    console.error('Failed to load prospects:', err);
  }
}

function renderProspectsView(data) {
  const el = document.getElementById('tab-prospects');
  el.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3>Add New Prospect</h3>
        <button class="btn btn-sm" onclick="toggleAddForm()">+</button>
      </div>
      <div id="addProspectForm" class="add-form" style="display:none">
        <div class="form-grid">
          <div class="field"><label>Business Name *</label><input id="newBizName" placeholder="Business name"></div>
          <div class="field"><label>Category</label>
            <select id="newBizCat">${CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}</select>
          </div>
          <div class="field"><label>Contact Name</label><input id="newBizContact" placeholder="Contact name"></div>
          <div class="field"><label>Phone</label><input id="newBizPhone" placeholder="Phone"></div>
          <div class="field"><label>Email</label><input id="newBizEmail" placeholder="Email"></div>
          <div class="field"><label>City</label>
            <input id="newBizCity" list="cityList" placeholder="Type a city...">
            <datalist id="cityList">${SUGGESTED_CITIES.map(c => `<option value="${c}">`).join('')}</datalist>
          </div>
          <div class="field"><label>Address</label><input id="newBizAddr" placeholder="Address"></div>
          <div class="field"><label>Website</label><input id="newBizWeb" placeholder="Website"></div>
        </div>
        <div class="field" style="margin-top:0.5rem"><label>Notes</label><textarea id="newBizNotes" rows="2" placeholder="Notes..."></textarea></div>
        <div style="margin-top:0.5rem;display:flex;gap:0.5rem">
          <button class="btn btn-primary" onclick="addNewProspect()">Add Prospect</button>
          <button class="btn" onclick="toggleAddForm()">Cancel</button>
        </div>
      </div>
    </div>

    <div class="card" style="margin-top:1rem">
      <div class="controls">
        <input type="text" id="prospectSearch" placeholder="Search..." value="${document.getElementById('prospectSearch')?.value || ''}" oninput="debounceSearch()">
        <select id="prospectStatusFilter" onchange="loadProspects()">
          <option value="all">All Statuses</option>
          ${Object.entries(STATUS_LABELS).map(([k, v]) => `<option value="${k}" ${document.getElementById('prospectStatusFilter')?.value === k ? 'selected' : ''}>${v}</option>`).join('')}
        </select>
        <select id="prospectCatFilter" onchange="loadProspects()">
          <option value="all">All Categories</option>
          ${CATEGORIES.map(c => `<option value="${c}" ${document.getElementById('prospectCatFilter')?.value === c ? 'selected' : ''}>${c}</option>`).join('')}
        </select>
        <input type="text" id="prospectCityFilter" list="cityFilterList" placeholder="Filter by city..." value="${document.getElementById('prospectCityFilter')?.value || ''}" oninput="debounceSearch()">
        <datalist id="cityFilterList"><option value="all">All Cities</option>${SUGGESTED_CITIES.map(c => `<option value="${c}">`).join('')}</datalist>
        <div class="controls-right">
          <button class="btn btn-sm btn-export" onclick="exportProspects()">Export CSV</button>
          <button class="btn btn-sm btn-export" onclick="document.getElementById('csvUpload').click()">Import CSV</button>
          <input type="file" id="csvUpload" accept=".csv" style="display:none" onchange="importCSVFile(this)">
          ${selectedProspects.size > 0 ? `<button class="btn btn-sm btn-primary" onclick="bulkSendSelected()">Email ${selectedProspects.size} Selected</button>` : ''}
        </div>
      </div>

      <div class="table-wrap">
        <table>
          <thead><tr>
            <th><input type="checkbox" onchange="toggleSelectAll(this.checked)"></th>
            <th>Status</th>
            <th>Business Name</th>
            <th>Category</th>
            <th>City</th>
            <th>Contact</th>
            <th>Email</th>
            <th>Emails Sent</th>
            <th>Updated</th>
            <th></th>
          </tr></thead>
          <tbody>
            ${data.prospects.length === 0 ? '<tr><td colspan="10" class="empty-msg">No prospects found. Add one above!</td></tr>' :
              data.prospects.map(p => `
                <tr class="${selectedProspects.has(p.id) ? 'selected-row' : ''}" onclick="openProspectDetail('${p.id}')">
                  <td onclick="event.stopPropagation()"><input type="checkbox" ${selectedProspects.has(p.id) ? 'checked' : ''} onchange="toggleSelectProspect('${p.id}', this.checked)"></td>
                  <td><span class="status-badge" style="background:${STATUS_COLORS[p.pipeline_status]}">${STATUS_LABELS[p.pipeline_status] || p.pipeline_status}</span></td>
                  <td class="biz-name">${esc(p.business_name)}</td>
                  <td>${esc(p.category)}</td>
                  <td>${esc(p.city)}</td>
                  <td>${esc(p.contact_name)}</td>
                  <td>${esc(p.email)}</td>
                  <td>${p.email_count || 0}</td>
                  <td class="date-cell">${formatDate(p.updated_at)}</td>
                  <td onclick="event.stopPropagation()"><button class="delete-btn" onclick="deleteProspect('${p.id}')">&times;</button></td>
                </tr>
              `).join('')}
          </tbody>
        </table>
      </div>
      <div class="table-footer">${data.total} prospect${data.total !== 1 ? 's' : ''}</div>
    </div>

    <div id="prospectDetail" class="side-panel" style="display:none"></div>
  `;
}

function toggleAddForm() {
  const form = document.getElementById('addProspectForm');
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

async function addNewProspect() {
  const name = document.getElementById('newBizName').value.trim();
  if (!name) return showToast('Business name is required', 'error');

  try {
    await API.post('/prospects', {
      business_name: name,
      category: document.getElementById('newBizCat').value,
      contact_name: document.getElementById('newBizContact').value.trim(),
      phone: document.getElementById('newBizPhone').value.trim(),
      email: document.getElementById('newBizEmail').value.trim(),
      city: document.getElementById('newBizCity').value,
      address: document.getElementById('newBizAddr').value.trim(),
      website: document.getElementById('newBizWeb').value.trim(),
      notes: document.getElementById('newBizNotes').value.trim()
    });
    showToast('Prospect added!');
    loadProspects();
  } catch (err) {
    showToast('Failed to add prospect', 'error');
  }
}

async function deleteProspect(id) {
  if (!confirm('Delete this prospect?')) return;
  try {
    await API.del(`/prospects/${id}`);
    showToast('Prospect deleted');
    selectedProspects.delete(id);
    loadProspects();
  } catch (err) {
    showToast('Failed to delete', 'error');
  }
}

async function openProspectDetail(id) {
  try {
    const data = await API.get(`/prospects/${id}`);
    prospectDetailOpen = id;
    renderProspectDetail(data);
  } catch (err) {
    console.error(err);
  }
}

function closeProspectDetail() {
  prospectDetailOpen = null;
  const panel = document.getElementById('prospectDetail');
  if (panel) panel.style.display = 'none';
}

function renderProspectDetail(data) {
  const p = data.prospect;
  const panel = document.getElementById('prospectDetail');
  panel.style.display = 'block';

  const hasEmail = p.email && !p.unsubscribed;
  const neverEmailed = data.emails.length === 0;
  const outreachStarted = data.emails.length > 0;

  panel.innerHTML = `
    <div class="panel-header">
      <div>
        <h3>${esc(p.business_name)}</h3>
        <div class="panel-subtitle">${esc(p.category)} ${p.city ? '&middot; ' + esc(p.city) : ''}</div>
      </div>
      <button class="btn-close" onclick="closeProspectDetail()">&times;</button>
    </div>
    <div class="panel-body">

      <!-- Outreach CTA -->
      ${hasEmail ? `
        <div class="outreach-cta">
          ${neverEmailed
            ? `<button class="btn-start-outreach" onclick="startOutreach('${p.id}')">Start Outreach</button>`
            : `<button class="btn-start-outreach btn-gold" onclick="startOutreach('${p.id}')">Send Another Email</button>`
          }
        </div>
      ` : p.unsubscribed
        ? `<div style="margin-bottom:1rem;padding:0.6rem 1rem;background:#fff3e0;border-radius:var(--radius-btn);font-size:0.85rem;color:#e65100;font-weight:500">Unsubscribed from emails</div>`
        : `<div style="margin-bottom:1rem;padding:0.6rem 1rem;background:var(--cream);border-radius:var(--radius-btn);font-size:0.85rem;color:var(--navy-light)">No email address — add one to start outreach</div>`
      }

      <!-- Compose area (hidden by default, shown when Start Outreach clicked) -->
      <div id="composeArea" style="display:none"></div>

      <!-- Contact info card -->
      <div class="detail-card">
        <div class="detail-card-header">Contact Info
          <span style="margin-left:auto"><button class="btn btn-sm" style="font-size:0.75rem;padding:2px 10px" onclick="toggleEditProspect('${p.id}')">Edit</button></span>
        </div>
        <div id="prospectInfoView">
          <div class="detail-row"><label>Status</label>
            <select onchange="updateProspectStatus('${p.id}', this.value)">
              ${Object.entries(STATUS_LABELS).map(([k, v]) => `<option value="${k}" ${p.pipeline_status === k ? 'selected' : ''}>${v}</option>`).join('')}
            </select>
          </div>
          ${p.contact_name ? `<div class="detail-row"><label>Contact</label><span>${esc(p.contact_name)}</span></div>` : ''}
          ${p.phone ? `<div class="detail-row"><label>Phone</label><span>${esc(p.phone)}</span></div>` : ''}
          <div class="detail-row"><label>Email</label><span>${p.email ? esc(p.email) : '<span style="color:var(--navy-light)">Not set</span>'}</span></div>
          ${p.address ? `<div class="detail-row"><label>Address</label><span>${esc(p.address)}</span></div>` : ''}
          <div class="detail-row"><label>Location</label><span>${esc(p.nearest_location) || 'Auto-assigned'}</span></div>
          ${p.website ? `<div class="detail-row"><label>Website</label><span><a href="${esc(p.website.startsWith('http') ? p.website : 'https://' + p.website)}" target="_blank">${esc(p.website)}</a></span></div>` : ''}
        </div>
        <div id="prospectInfoEdit" style="display:none">
          <div class="form-grid" style="gap:0.5rem">
            <div class="field"><label style="font-size:0.78rem">Contact Name</label><input id="editContact" value="${esc(p.contact_name)}" style="font-size:0.85rem;padding:0.35rem 0.5rem"></div>
            <div class="field"><label style="font-size:0.78rem">Email</label><input id="editEmail" value="${esc(p.email)}" style="font-size:0.85rem;padding:0.35rem 0.5rem"></div>
            <div class="field"><label style="font-size:0.78rem">Phone</label><input id="editPhone" value="${esc(p.phone)}" style="font-size:0.85rem;padding:0.35rem 0.5rem"></div>
            <div class="field"><label style="font-size:0.78rem">Category</label>
              <select id="editCategory" style="font-size:0.85rem;padding:0.35rem 0.5rem">${CATEGORIES.map(c => `<option value="${c}" ${p.category === c ? 'selected' : ''}>${c}</option>`).join('')}</select>
            </div>
            <div class="field"><label style="font-size:0.78rem">City</label><input id="editCity" value="${esc(p.city)}" list="editCityList" style="font-size:0.85rem;padding:0.35rem 0.5rem"><datalist id="editCityList">${SUGGESTED_CITIES.map(c => `<option value="${c}">`).join('')}</datalist></div>
            <div class="field"><label style="font-size:0.78rem">Address</label><input id="editAddress" value="${esc(p.address)}" style="font-size:0.85rem;padding:0.35rem 0.5rem"></div>
            <div class="field"><label style="font-size:0.78rem">Website</label><input id="editWebsite" value="${esc(p.website)}" style="font-size:0.85rem;padding:0.35rem 0.5rem"></div>
          </div>
          <div style="display:flex;gap:0.5rem;margin-top:0.75rem">
            <button class="btn btn-primary btn-sm" onclick="saveProspectEdits('${p.id}')">Save</button>
            <button class="btn btn-sm" onclick="toggleEditProspect()">Cancel</button>
          </div>
        </div>
      </div>

      <!-- Notes card -->
      <div class="detail-card">
        <div class="detail-card-header">Notes</div>
        <textarea id="prospectNotes" rows="3" onchange="updateProspectNotes('${p.id}', this.value)">${esc(p.notes)}</textarea>
      </div>

      <!-- Email History card -->
      <div class="detail-card">
        <div class="detail-card-header">Email History (${data.emails.length})</div>
        ${data.emails.length === 0 ? '<p style="font-size:0.85rem;color:var(--navy-light);margin:0">No emails sent yet</p>' :
          data.emails.map(e => `
            <div class="email-history-item">
              <div class="email-subject">${esc(e.subject)}</div>
              <div class="email-meta">
                <span class="status-badge-sm" style="background:${getEmailStatusColor(e.status)}">${e.status}</span>
                ${e.sent_at ? `Sent ${formatDateTime(e.sent_at)}` : 'Queued'}
                ${e.opened_at ? ` &middot; Opened ${formatDateTime(e.opened_at)}` : ''}
              </div>
            </div>
          `).join('')}
      </div>

      <!-- Activity card -->
      ${data.activity.length > 0 ? `
        <div class="detail-card">
          <div class="detail-card-header">Activity</div>
          ${data.activity.map(a => `
            <div class="activity-item-sm">
              <span>${getActivityLabel(a.action)}</span>
              <span class="activity-time">${formatDateTime(a.created_at)}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}

    </div>
  `;
}

function toggleEditProspect(id) {
  const view = document.getElementById('prospectInfoView');
  const edit = document.getElementById('prospectInfoEdit');
  if (edit.style.display === 'none') {
    view.style.display = 'none';
    edit.style.display = 'block';
  } else {
    view.style.display = 'block';
    edit.style.display = 'none';
  }
}

async function saveProspectEdits(id) {
  try {
    await API.put(`/prospects/${id}`, {
      contact_name: document.getElementById('editContact').value.trim(),
      email: document.getElementById('editEmail').value.trim(),
      phone: document.getElementById('editPhone').value.trim(),
      category: document.getElementById('editCategory').value,
      city: document.getElementById('editCity').value.trim(),
      address: document.getElementById('editAddress').value.trim(),
      website: document.getElementById('editWebsite').value.trim()
    });
    showToast('Prospect updated');
    openProspectDetail(id);
    loadProspects();
  } catch (err) {
    showToast('Failed to save', 'error');
  }
}

async function startOutreach(prospectId) {
  const templates = await API.get('/templates');
  const initialTemplates = templates.filter(t => t.template_type === 'initial');
  if (initialTemplates.length === 0) return showToast('No initial outreach templates found', 'error');

  // Find best matching template based on prospect category
  const prospect = prospectsData.find(p => p.id === prospectId);
  const catMatch = initialTemplates.find(t => t.category && prospect?.category && t.category.toLowerCase() === prospect.category.toLowerCase());
  const defaultTemplate = catMatch || initialTemplates.find(t => !t.category) || initialTemplates[0];

  const area = document.getElementById('composeArea');
  area.style.display = 'block';
  area.innerHTML = `
    <div class="compose-area">
      <div class="compose-header">
        <h4>Compose Outreach Email</h4>
        <button class="btn-close" style="font-size:1.1rem" onclick="document.getElementById('composeArea').style.display='none'">&times;</button>
      </div>
      <div class="compose-body">
        <div style="margin-bottom:0.75rem">
          <label style="font-size:0.78rem;color:var(--navy-light);font-weight:600">Template</label>
          <select id="composeTemplateSelect" class="compose-template-select" style="width:100%;margin-top:4px" onchange="updateComposePreview('${prospectId}')">
            ${initialTemplates.map(t => `<option value="${t.id}" ${t.id === defaultTemplate.id ? 'selected' : ''}>${esc(t.name)}</option>`).join('')}
          </select>
        </div>
        <div class="compose-subject" id="composeSubject">Loading...</div>
        <div class="compose-preview" id="composeBody">Loading...</div>
      </div>
      <div class="compose-footer">
        <span style="font-size:0.78rem;color:var(--navy-light)">Follow-ups auto-send at 1 week &amp; 3 weeks</span>
        <button class="btn-send" onclick="sendFromCompose('${prospectId}')">Send Email</button>
      </div>
    </div>
  `;

  updateComposePreview(prospectId);
  area.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

async function updateComposePreview(prospectId) {
  const templateId = document.getElementById('composeTemplateSelect').value;
  const prospect = prospectsData.find(p => p.id === prospectId);
  try {
    const preview = await API.post(`/templates/${templateId}/preview`, {
      business_name: prospect?.business_name,
      contact_name: prospect?.contact_name || 'there',
      city: prospect?.city,
      nearest_location: prospect?.nearest_location
    });
    document.getElementById('composeSubject').innerHTML = `<strong>Subject:</strong> ${esc(preview.subject)}`;
    document.getElementById('composeBody').innerHTML = preview.body_html;
  } catch (err) {
    document.getElementById('composeBody').innerHTML = '<p style="color:#e74c3c">Failed to load preview</p>';
  }
}

async function sendFromCompose(prospectId) {
  const templateId = document.getElementById('composeTemplateSelect').value;
  try {
    await API.post('/outreach/send', { prospect_id: prospectId, template_id: templateId });
    showToast('Email sent! Follow-ups scheduled for 1 week and 3 weeks.');
    document.getElementById('composeArea').style.display = 'none';
    openProspectDetail(prospectId);
    loadProspects();
  } catch (err) {
    showToast('Failed to send email', 'error');
  }
}

function getEmailStatusColor(status) {
  const colors = {
    queued: '#95a5a6', sent: '#3498db', delivered: '#2ecc71',
    opened: '#27ae60', clicked: '#16a085', bounced: '#e74c3c', failed: '#e74c3c'
  };
  return colors[status] || '#95a5a6';
}

async function updateProspectStatus(id, status) {
  try {
    await API.put(`/prospects/${id}`, { pipeline_status: status });
    showToast('Status updated');
    loadProspects();
  } catch (err) {
    showToast('Failed to update', 'error');
  }
}

async function updateProspectNotes(id, notes) {
  try {
    await API.put(`/prospects/${id}`, { notes });
  } catch (err) {
    showToast('Failed to save notes', 'error');
  }
}

function toggleSelectProspect(id, checked) {
  if (checked) selectedProspects.add(id);
  else selectedProspects.delete(id);
  loadProspects();
}

function toggleSelectAll(checked) {
  if (checked) prospectsData.forEach(p => selectedProspects.add(p.id));
  else selectedProspects.clear();
  loadProspects();
}

// Send email modal
async function showSendEmailModal(prospectId) {
  const templates = await API.get('/templates?type=initial');
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header"><h3>Send Email</h3><button class="close-btn" onclick="this.closest('.modal-overlay').remove()">&times;</button></div>
      <div class="modal-body">
        <div class="field"><label>Template</label>
          <select id="sendTemplateSelect">
            ${templates.map(t => `<option value="${t.id}">${esc(t.name)}</option>`).join('')}
          </select>
        </div>
        <div id="emailPreview" class="email-preview" style="margin-top:1rem"></div>
      </div>
      <div class="modal-footer">
        <button class="btn" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
        <button class="btn btn-primary" onclick="sendEmailToProspect('${prospectId}')">Send Email</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Load preview
  const select = document.getElementById('sendTemplateSelect');
  select.addEventListener('change', () => previewEmail(select.value, prospectId));
  previewEmail(select.value, prospectId);
}

async function previewEmail(templateId, prospectId) {
  try {
    const prospect = prospectsData.find(p => p.id === prospectId);
    const preview = await API.post(`/templates/${templateId}/preview`, {
      business_name: prospect?.business_name,
      contact_name: prospect?.contact_name || 'there',
      city: prospect?.city,
      nearest_location: prospect?.nearest_location
    });
    const el = document.getElementById('emailPreview');
    if (el) {
      el.innerHTML = `<div class="preview-subject"><strong>Subject:</strong> ${esc(preview.subject)}</div><div class="preview-body">${preview.body_html}</div>`;
    }
  } catch (err) {
    console.error(err);
  }
}

async function sendEmailToProspect(prospectId) {
  const templateId = document.getElementById('sendTemplateSelect').value;
  try {
    await API.post('/outreach/send', { prospect_id: prospectId, template_id: templateId });
    showToast('Email queued for sending!');
    document.querySelector('.modal-overlay')?.remove();
    if (prospectDetailOpen) openProspectDetail(prospectDetailOpen);
    loadProspects();
  } catch (err) {
    showToast('Failed to send email', 'error');
  }
}

// Bulk send
async function bulkSendSelected() {
  const templates = await API.get('/templates?type=initial');
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header"><h3>Send to ${selectedProspects.size} Prospects</h3><button class="close-btn" onclick="this.closest('.modal-overlay').remove()">&times;</button></div>
      <div class="modal-body">
        <div class="field"><label>Template</label>
          <select id="bulkTemplateSelect">
            ${templates.map(t => `<option value="${t.id}">${esc(t.name)}</option>`).join('')}
          </select>
        </div>
        <p style="margin-top:1rem;color:#666">This will queue ${selectedProspects.size} emails for sending. Emails are sent with a 1-second delay between each.</p>
      </div>
      <div class="modal-footer">
        <button class="btn" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
        <button class="btn btn-primary" onclick="executeBulkSend()">Send All</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

async function executeBulkSend() {
  const templateId = document.getElementById('bulkTemplateSelect').value;
  try {
    // Create a quick campaign
    const campaign = await API.post('/campaigns', {
      name: `Bulk Send - ${new Date().toLocaleDateString()}`,
      template_id: templateId
    });
    // Send to selected prospects
    await API.post(`/campaigns/${campaign.id}/send`, {
      prospect_ids: Array.from(selectedProspects)
    });
    showToast(`${selectedProspects.size} emails queued!`);
    selectedProspects.clear();
    document.querySelector('.modal-overlay')?.remove();
    loadProspects();
  } catch (err) {
    showToast('Failed to send', 'error');
  }
}

// CSV Import — smart column matching + preview

// Column matching rules: each field has keywords to match against CSV headers
// More specific patterns come first to avoid false positives
const CSV_COLUMN_MATCHERS = {
  business_name:  ['business name', 'business_name', 'company name', 'company_name', 'organization', 'org name', 'business', 'company', 'org', 'account', 'firm'],
  contact_name:   ['contact name', 'contact_name', 'contact person', 'first name', 'first_name', 'full name', 'full_name', 'contact', 'person', 'representative', 'rep'],
  contact_title:  ['contact title', 'contact_title', 'title', 'job title', 'job_title', 'position', 'role'],
  email:          ['email address', 'email_address', 'e-mail', 'email'],
  phone:          ['phone number', 'phone_number', 'telephone', 'phone', 'tel', 'mobile', 'cell'],
  address:        ['street address', 'street_address', 'address line', 'address'],
  city:           ['city', 'town', 'municipality'],
  state:          ['state', 'province'],
  zip:            ['zip', 'zip code', 'zipcode', 'postal', 'postal code'],
  category:       ['category', 'type', 'industry', 'sector', 'segment'],
  website:        ['website', 'web', 'url', 'site', 'homepage'],
  notes:          ['notes', 'comments', 'description', 'memo', 'details'],
  employees:      ['employees', 'est. employees', 'employee count', 'headcount', 'staff', 'size']
};

// Try to normalize category values from CSVs to our categories
function normalizeCategory(val) {
  if (!val) return '';
  const v = val.toLowerCase().trim();

  // Check more specific categories first to avoid false matches

  // Medical — healthcare, dental, veterinary, wellness
  const medicalWords = ['medical', 'dental', 'dentist', 'health', 'doctor', 'clinic', 'hospital',
    'pharma', 'physician', 'surgeon', 'pediatr', 'orthoped', 'dermatol', 'optom', 'ophthalm',
    'chiropr', 'physical therapy', 'pt ', 'veterinar', 'vet ', 'urgent care', 'med spa',
    'mental health', 'therap', 'psycholog', 'psychiatr', 'counseling', 'wellness',
    'nursing', 'assisted living', 'senior care', 'home health', 'hospice', 'rehab',
    'oral surgery', 'orthodont', 'endodont', 'periodont', 'oncolog', 'cardiol', 'neurolog'];
  if (medicalWords.some(w => v.includes(w))) return 'Medical';

  // School — education at any level
  const schoolWords = ['school', 'education', 'university', 'college', 'academy', 'learning',
    'preschool', 'pre-school', 'daycare', 'day care', 'childcare', 'montessori',
    'high school', 'middle school', 'elementary', 'district', 'tutor', 'after school',
    'after-school', 'summer camp', 'camp', 'pta', 'parent teacher'];
  if (schoolWords.some(w => v.includes(w))) return 'School';

  // Worship — religious organizations and congregations
  const worshipWords = ['worship', 'church', 'synagogue', 'temple', 'mosque', 'congregation',
    'religious', 'faith', 'ministry', 'parish', 'diocese', 'chapel', 'cathedral',
    'baptist', 'methodist', 'lutheran', 'presbyterian', 'catholic', 'christian',
    'jewish', 'islamic', 'hindu', 'buddhist', 'interfaith', 'bible', 'gospel'];
  if (worshipWords.some(w => v.includes(w))) return 'Worship';

  // Financial/RE — banking, insurance, real estate, brokerages
  // Check BEFORE Corporate so "Insurance Agency" hits insurance, not agency
  const financeWords = ['financial', 'real estate', 'bank', 'insurance', 'realty', 'mortgage',
    'credit union', 'lending', 'loan', 'brokerage', 'title company',
    'escrow', 'apprais', 'property management', 'commercial real', 'residential real',
    'financial advis', 'financial plan', 'fiduciary', 'asset management', 'portfolio',
    'underwrit'];
  if (financeWords.some(w => v.includes(w))) return 'Financial/RE';

  // Corporate — offices, professional services, tech, consulting, etc.
  // This is the broadest category — checked last as a catch-all for business types
  const corporateWords = ['corporate', 'office', 'business', 'company', 'tech', 'technology', 'software',
    'consulting', 'law firm', 'legal', 'attorney', 'lawyer', 'accounting', 'cpa', 'marketing',
    'agency', 'staffing', 'recruiting', 'hr ', 'human resource', 'cowork', 'co-work',
    'wealth management', 'wealth', 'investment', 'venture', 'private equity', 'hedge fund',
    'architecture', 'engineering', 'design firm', 'advertising', 'media', 'pr firm',
    'startup', 'saas', 'manufacturer', 'logistics', 'warehouse', 'distribution',
    'non-profit', 'nonprofit', 'foundation', 'association', 'chamber of commerce',
    'auto dealer', 'dealership', 'car dealer', 'automotive',
    'family office', 'ria', 'advisor', 'broker'];
  if (corporateWords.some(w => v.includes(w))) return 'Corporate';

  return val.trim();
}

// Clean phone numbers to a consistent format
function cleanPhone(val) {
  if (!val) return '';
  const digits = val.replace(/\D/g, '');
  if (digits.length === 10) return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
  if (digits.length === 11 && digits[0] === '1') return `(${digits.slice(1,4)}) ${digits.slice(4,7)}-${digits.slice(7)}`;
  return val.trim();
}

// Basic email validation
function isValidEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
}

function matchColumn(headerText, field) {
  const h = headerText.toLowerCase().replace(/[_\-]/g, ' ').trim();
  const patterns = CSV_COLUMN_MATCHERS[field];
  for (const p of patterns) {
    // Exact match always wins
    if (h === p) return true;
    // For short patterns (<=4 chars), require word boundary match to avoid false positives
    // e.g. "state" shouldn't match "Est. Employees"
    if (p.length <= 4) {
      const re = new RegExp('\\b' + p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b');
      if (re.test(h)) return true;
    } else {
      if (h.includes(p)) return true;
    }
  }
  return false;
}

function detectColumns(headers) {
  const mapping = {};
  const used = new Set();

  // Pass 1: exact/specific matches first
  for (const field of Object.keys(CSV_COLUMN_MATCHERS)) {
    for (let i = 0; i < headers.length; i++) {
      if (used.has(i)) continue;
      if (matchColumn(headers[i], field)) {
        // Avoid "name" matching both business_name and contact_name
        // If this is contact_name and header is just "name" or "company", skip — business gets priority
        const h = headers[i].toLowerCase().replace(/[_\-]/g, ' ').trim();
        if (field === 'contact_name' && (h === 'name' || h === 'company')) continue;
        mapping[field] = i;
        used.add(i);
        break;
      }
    }
  }

  // Pass 2: if we still don't have business_name, try just "name" (but only if contact_name didn't grab it)
  if (mapping.business_name === undefined) {
    for (let i = 0; i < headers.length; i++) {
      if (used.has(i)) continue;
      const h = headers[i].toLowerCase().trim();
      if (h === 'name') { mapping.business_name = i; used.add(i); break; }
    }
  }

  return mapping;
}

function parseCSVRows(text) {
  const lines = text.split(/\r?\n/);
  const rows = [];
  let cur = '';
  let inQuotes = false;
  for (const line of lines) {
    if (inQuotes) {
      cur += '\n' + line;
    } else {
      cur = line;
    }
    const quoteCount = (cur.match(/"/g) || []).length;
    inQuotes = quoteCount % 2 !== 0;
    if (!inQuotes) {
      if (cur.trim()) rows.push(parseCSVRow(cur));
      cur = '';
    }
  }
  if (cur.trim()) rows.push(parseCSVRow(cur));
  return rows;
}

let csvImportData = null;

function importCSVFile(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const rows = parseCSVRows(e.target.result);
    if (rows.length < 2) return showToast('CSV appears empty', 'error');

    const headers = rows[0].map(h => h.trim());
    const mapping = detectColumns(headers);

    if (mapping.business_name === undefined) {
      return showToast('Could not find a Business Name column. Make sure your CSV has a column like "Business Name", "Company", or "Organization".', 'error');
    }

    // Parse data rows
    const data = [];
    const skipped = [];
    for (let i = 1; i < rows.length; i++) {
      const cols = rows[i];
      const get = (field) => mapping[field] !== undefined ? (cols[mapping[field]] || '').trim() : '';

      const bizName = get('business_name');
      if (!bizName) { skipped.push({ row: i + 1, reason: 'No business name' }); continue; }

      const email = get('email');
      if (email && !isValidEmail(email)) {
        skipped.push({ row: i + 1, reason: `Invalid email: ${email}`, name: bizName });
      }

      const category = normalizeCategory(get('category'));

      // Build contact name — append title if available
      let contactName = get('contact_name');
      const contactTitle = get('contact_title');
      if (contactTitle && contactName) contactName += ` (${contactTitle})`;

      // Build full address — combine address, state, zip
      let address = get('address');
      const state = get('state');
      const zip = get('zip');
      if (state || zip) {
        const suffix = [state, zip].filter(Boolean).join(' ');
        address = address ? `${address}, ${suffix}` : suffix;
      }

      // Build notes — include employee count and any extra info
      let notes = get('notes');
      const employees = get('employees');
      if (employees) {
        const empNote = `Est. employees: ${employees}`;
        notes = notes ? `${empNote}. ${notes}` : empNote;
      }

      data.push({
        business_name: bizName,
        category: category || 'Corporate',
        contact_name: contactName,
        phone: cleanPhone(get('phone')),
        email: email,
        city: get('city'),
        address: address,
        website: get('website'),
        notes: notes
      });
    }

    // Show preview modal
    csvImportData = data;
    showImportPreview(data, skipped, mapping, headers);
  };
  reader.readAsText(file);
  input.value = '';
}

function showImportPreview(data, skipped, mapping, headers) {
  const mappedFields = Object.entries(mapping).map(([field, idx]) =>
    `<tr><td style="font-weight:600">${field.replace(/_/g, ' ')}</td><td>&larr;</td><td>"${esc(headers[idx])}" (col ${idx + 1})</td></tr>`
  ).join('');

  const unmappedHeaders = headers.filter((h, i) => !Object.values(mapping).includes(i) && h.trim());
  const unmappedInfo = unmappedHeaders.length > 0
    ? `<p style="font-size:0.85rem;color:#888;margin-top:0.5rem">Columns not imported: ${unmappedHeaders.map(h => `"${esc(h)}"`).join(', ')}</p>`
    : '';

  const skippedInfo = skipped.length > 0
    ? `<div style="margin-top:1rem;padding:0.75rem;background:#fff3e0;border-radius:8px">
        <strong>${skipped.length} row(s) with issues:</strong>
        <ul style="margin:0.5rem 0 0;font-size:0.85rem">${skipped.slice(0, 10).map(s => `<li>Row ${s.row}: ${esc(s.reason)}${s.name ? ` (${esc(s.name)})` : ''}</li>`).join('')}
        ${skipped.length > 10 ? `<li>...and ${skipped.length - 10} more</li>` : ''}</ul>
      </div>`
    : '';

  // Sample preview of first 5 rows
  const previewRows = data.slice(0, 5).map(d =>
    `<tr>
      <td>${esc(d.business_name)}</td>
      <td>${esc(d.category)}</td>
      <td>${esc(d.contact_name)}</td>
      <td>${esc(d.email)}</td>
      <td>${esc(d.city)}</td>
    </tr>`
  ).join('');

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'csvPreviewModal';
  modal.innerHTML = `
    <div class="modal" style="max-width:720px">
      <div class="modal-header">
        <h3>Import Preview</h3>
        <button class="btn-close" onclick="closeCSVPreview()">&times;</button>
      </div>
      <div class="modal-body" style="max-height:70vh;overflow-y:auto">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
          <span style="font-size:1.1rem;font-weight:600">${data.length} prospect${data.length !== 1 ? 's' : ''} found</span>
          <label style="font-size:0.9rem;display:flex;align-items:center;gap:0.5rem">
            <input type="checkbox" id="csvSkipDupes" checked> Skip duplicates
          </label>
        </div>

        <details style="margin-bottom:1rem">
          <summary style="cursor:pointer;font-weight:500;color:var(--blue)">Column mapping</summary>
          <table style="width:100%;margin-top:0.5rem;font-size:0.9rem"><tbody>${mappedFields}</tbody></table>
          ${unmappedInfo}
        </details>

        <table style="width:100%;font-size:0.85rem">
          <thead><tr><th>Business</th><th>Category</th><th>Contact</th><th>Email</th><th>City</th></tr></thead>
          <tbody>${previewRows}</tbody>
        </table>
        ${data.length > 5 ? `<p style="font-size:0.85rem;color:#888;margin-top:0.25rem">...and ${data.length - 5} more</p>` : ''}
        ${skippedInfo}
      </div>
      <div class="modal-footer" style="display:flex;gap:0.5rem;justify-content:flex-end;padding:1rem">
        <button class="btn btn-sm" onclick="closeCSVPreview()">Cancel</button>
        <button class="btn btn-sm btn-primary" onclick="confirmCSVImport()">Import ${data.length} Prospects</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function closeCSVPreview() {
  const modal = document.getElementById('csvPreviewModal');
  if (modal) modal.remove();
  csvImportData = null;
}

async function confirmCSVImport() {
  if (!csvImportData || csvImportData.length === 0) return;
  const skipDupes = document.getElementById('csvSkipDupes')?.checked ?? true;

  try {
    const result = await API.post('/prospects/import/csv', { data: csvImportData, skip_duplicates: skipDupes });
    const msg = result.skipped > 0
      ? `Imported ${result.imported} prospects (${result.skipped} duplicates skipped)`
      : `Imported ${result.imported} prospects!`;
    showToast(msg);
    closeCSVPreview();
    loadProspects();
  } catch (err) {
    showToast('Import failed', 'error');
  }
}

function parseCSVRow(line) {
  const cells = []; let cur = '', inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') inQuotes = false;
      else cur += ch;
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ',') { cells.push(cur.trim()); cur = ''; }
      else cur += ch;
    }
  }
  cells.push(cur.trim());
  return cells;
}

function exportProspects() {
  window.open('/api/prospects/export/csv', '_blank');
}

let searchTimeout;
function debounceSearch() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(loadProspects, 300);
}
