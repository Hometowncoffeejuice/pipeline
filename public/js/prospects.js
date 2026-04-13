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

  panel.innerHTML = `
    <div class="panel-header">
      <h3>${esc(p.business_name)}</h3>
      <button class="close-btn" onclick="closeProspectDetail()">&times;</button>
    </div>
    <div class="panel-body">
      <div class="detail-section">
        <div class="detail-row"><label>Status</label>
          <select onchange="updateProspectStatus('${p.id}', this.value)">
            ${Object.entries(STATUS_LABELS).map(([k, v]) => `<option value="${k}" ${p.pipeline_status === k ? 'selected' : ''}>${v}</option>`).join('')}
          </select>
        </div>
        <div class="detail-row"><label>Category</label><span>${esc(p.category)}</span></div>
        <div class="detail-row"><label>Contact</label><span>${esc(p.contact_name)}</span></div>
        <div class="detail-row"><label>Phone</label><span>${esc(p.phone)}</span></div>
        <div class="detail-row"><label>Email</label><span>${esc(p.email)}</span></div>
        <div class="detail-row"><label>City</label><span>${esc(p.city)}</span></div>
        <div class="detail-row"><label>Location</label><span>${esc(p.nearest_location)}</span></div>
        <div class="detail-row"><label>Address</label><span>${esc(p.address)}</span></div>
        <div class="detail-row"><label>Website</label><span>${p.website ? `<a href="${esc(p.website)}" target="_blank">${esc(p.website)}</a>` : '-'}</span></div>
      </div>

      <div class="detail-section">
        <h4>Notes</h4>
        <textarea id="prospectNotes" rows="3" onchange="updateProspectNotes('${p.id}', this.value)">${esc(p.notes)}</textarea>
      </div>

      <div class="detail-section">
        <h4>Actions</h4>
        <div class="action-buttons">
          ${p.email && !p.unsubscribed ? `<button class="btn btn-primary btn-sm" onclick="showSendEmailModal('${p.id}')">Send Email</button>` : ''}
          ${p.unsubscribed ? '<span class="badge badge-warn">Unsubscribed</span>' : ''}
        </div>
      </div>

      <div class="detail-section">
        <h4>Email History (${data.emails.length})</h4>
        ${data.emails.length === 0 ? '<p class="empty-msg">No emails sent yet</p>' :
          data.emails.map(e => `
            <div class="email-history-item">
              <div class="email-subject">${esc(e.subject)}</div>
              <div class="email-meta">
                <span class="status-badge-sm" style="background:${getEmailStatusColor(e.status)}">${e.status}</span>
                ${e.sent_at ? `Sent ${formatDateTime(e.sent_at)}` : 'Queued'}
                ${e.opened_at ? ` | Opened ${formatDateTime(e.opened_at)}` : ''}
              </div>
            </div>
          `).join('')}
      </div>

      <div class="detail-section">
        <h4>Activity</h4>
        ${data.activity.length === 0 ? '<p class="empty-msg">No activity yet</p>' :
          data.activity.map(a => `
            <div class="activity-item-sm">
              <span>${getActivityLabel(a.action)}</span>
              <span class="activity-time">${formatDateTime(a.created_at)}</span>
            </div>
          `).join('')}
      </div>
    </div>
  `;
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
      contact_name: prospect?.contact_name,
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

// CSV Import
function importCSVFile(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async function(e) {
    const lines = e.target.result.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) return showToast('CSV appears empty', 'error');

    const header = parseCSVRow(lines[0]).map(h => h.toLowerCase().trim());
    const nameI = header.findIndex(h => h.includes('business') || h.includes('name') || h.includes('company'));
    if (nameI === -1) return showToast('Could not find a Business Name column', 'error');

    const catI = header.findIndex(h => h.includes('categ') || h.includes('type'));
    const contactI = header.findIndex(h => h.includes('contact') || h.includes('person'));
    const phoneI = header.findIndex(h => h.includes('phone'));
    const emailI = header.findIndex(h => h.includes('email') || h.includes('mail'));
    const cityI = header.findIndex(h => h.includes('city') || h.includes('town'));
    const addrI = header.findIndex(h => h.includes('addr'));
    const notesI = header.findIndex(h => h.includes('note'));

    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVRow(lines[i]);
      const name = cols[nameI]?.trim();
      if (!name) continue;
      data.push({
        business_name: name,
        category: catI >= 0 ? cols[catI]?.trim() || 'Corporate' : 'Corporate',
        contact_name: contactI >= 0 ? cols[contactI]?.trim() || '' : '',
        phone: phoneI >= 0 ? cols[phoneI]?.trim() || '' : '',
        email: emailI >= 0 ? cols[emailI]?.trim() || '' : '',
        city: cityI >= 0 ? cols[cityI]?.trim() || '' : '',
        address: addrI >= 0 ? cols[addrI]?.trim() || '' : '',
        notes: notesI >= 0 ? cols[notesI]?.trim() || '' : ''
      });
    }

    try {
      const result = await API.post('/prospects/import/csv', { data });
      showToast(`Imported ${result.imported} prospects!`);
      loadProspects();
    } catch (err) {
      showToast('Import failed', 'error');
    }
  };
  reader.readAsText(file);
  input.value = '';
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
