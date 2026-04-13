let allTemplates = [];
let currentEditId = null;
let editorMode = 'preview'; // 'preview' or 'html'

const SAMPLE_DATA = {
  business_name: 'Acme Corp',
  contact_name: 'Jane',
  city: 'Glencoe',
  nearest_location: 'Glencoe',
  catering_url: 'https://www.toasttab.com/catering/locations/9e8dfec4-1c78-4969-8a56-a932e6035c08',
  booking_url: 'https://calendar.google.com/your-booking-link',
  menu_url: 'https://yourmenu.pdf'
};

function renderWithSampleData(text) {
  return (text || '').replace(/\{\{(\w+)\}\}/g, (m, k) => SAMPLE_DATA[k] || m);
}

async function loadTemplates() {
  try {
    allTemplates = await API.get('/templates');
    renderTemplatesView();
  } catch (err) {
    console.error('Failed to load templates:', err);
  }
}

function renderTemplatesView() {
  const el = document.getElementById('tab-templates');
  el.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3>Email Templates</h3>
        <button class="btn btn-primary btn-sm" onclick="showTemplateEditor()">+ New Template</button>
      </div>
      <div class="template-list">
        ${allTemplates.length === 0 ? '<div class="empty-msg" style="padding:2rem">No templates yet</div>' :
          allTemplates.map(t => `
            <div class="template-card" onclick="showTemplateEditor('${t.id}')">
              <div class="template-card-header">
                <h4>${esc(t.name)}</h4>
                <span class="badge">${t.template_type}</span>
              </div>
              <div class="template-subject">${esc(t.subject)}</div>
              ${t.category ? `<span class="badge badge-cat">${esc(t.category)}</span>` : ''}
            </div>
          `).join('')}
      </div>
    </div>
  `;
}

async function showTemplateEditor(id) {
  let template = { name: '', subject: '', body_html: '', body_text: '', template_type: 'initial', category: '' };
  if (id) {
    template = await API.get(`/templates/${id}`);
  }
  currentEditId = id || null;
  editorMode = id ? 'preview' : 'html';

  // Replace the entire tab content with the editor
  const el = document.getElementById('tab-templates');
  el.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div style="display:flex;align-items:center;gap:0.5rem">
          <button class="btn btn-sm" onclick="loadTemplates()">&larr; Back</button>
          <h3>${id ? 'Edit' : 'New'} Template</h3>
        </div>
        <div style="display:flex;gap:0.5rem">
          <button class="btn btn-primary btn-sm" onclick="saveTemplate('${id || ''}')">${id ? 'Save Changes' : 'Create Template'}</button>
          ${id ? `<button class="btn btn-danger btn-sm" onclick="deleteTemplate('${id}')">Delete</button>` : ''}
        </div>
      </div>
      <div style="padding:1rem">
        <div class="form-grid">
          <div class="field"><label>Template Name</label><input id="tplName" value="${esc(template.name)}"></div>
          <div class="field"><label>Type</label>
            <select id="tplType">
              <option value="initial" ${template.template_type === 'initial' ? 'selected' : ''}>Initial</option>
              <option value="follow_up_1" ${template.template_type === 'follow_up_1' ? 'selected' : ''}>Follow-up 1 (1 week)</option>
              <option value="follow_up_2" ${template.template_type === 'follow_up_2' ? 'selected' : ''}>Follow-up 2 (3 weeks)</option>
              <option value="reengagement" ${template.template_type === 'reengagement' ? 'selected' : ''}>Re-engagement</option>
            </select>
          </div>
          <div class="field"><label>Category (optional)</label>
            <select id="tplCat"><option value="">General (all)</option>${CATEGORIES.map(c => `<option value="${c}" ${template.category === c ? 'selected' : ''}>${c}</option>`).join('')}</select>
          </div>
        </div>
        <div class="field" style="margin-top:0.5rem"><label>Subject Line</label><input id="tplSubject" value="${esc(template.subject)}" style="width:100%" oninput="updateLivePreview()"></div>

        <!-- Mode toggle -->
        <div class="editor-mode-bar">
          <button class="mode-btn ${editorMode === 'preview' ? 'active' : ''}" onclick="switchEditorMode('preview')">Preview</button>
          <button class="mode-btn ${editorMode === 'html' ? 'active' : ''}" onclick="switchEditorMode('html')">Edit HTML</button>
        </div>

        <!-- Preview mode -->
        <div id="tplPreviewMode" style="display:${editorMode === 'preview' ? 'block' : 'none'}">
          <div class="email-preview-full">
            <div class="email-preview-chrome">
              <div class="email-chrome-dots"><span></span><span></span><span></span></div>
              <div class="email-chrome-from">From: <strong>Adam at Hometown Coffee & Juice</strong></div>
            </div>
            <div class="email-preview-subject" id="liveSubject">Subject: ${esc(renderWithSampleData(template.subject))}</div>
            <div class="email-preview-body" id="liveBody">${renderWithSampleData(template.body_html)}</div>
          </div>
          <p class="preview-note">Showing preview with sample data (Acme Corp, Jane, Glencoe). Click "Edit HTML" to modify.</p>
        </div>

        <!-- HTML edit mode -->
        <div id="tplHtmlMode" style="display:${editorMode === 'html' ? 'block' : 'none'}">
          <div style="margin-bottom:0.5rem">
            <label>Placeholders (click to insert):</label>
            <div class="placeholder-buttons">
              <button class="btn btn-sm" onclick="insertPlaceholder('business_name')">{{business_name}}</button>
              <button class="btn btn-sm" onclick="insertPlaceholder('contact_name')">{{contact_name}}</button>
              <button class="btn btn-sm" onclick="insertPlaceholder('city')">{{city}}</button>
              <button class="btn btn-sm" onclick="insertPlaceholder('nearest_location')">{{nearest_location}}</button>
              <button class="btn btn-sm" onclick="insertPlaceholder('catering_url')">{{catering_url}}</button>
              <button class="btn btn-sm" onclick="insertPlaceholder('booking_url')">{{booking_url}}</button>
              <button class="btn btn-sm" onclick="insertPlaceholder('menu_url')">{{menu_url}}</button>
            </div>
          </div>
          <textarea id="tplBody" rows="20" style="width:100%;font-family:monospace;font-size:0.85rem" oninput="updateLivePreview()">${esc(template.body_html)}</textarea>
        </div>

        <input type="hidden" id="tplBodyHidden" value="">
      </div>
    </div>
  `;

  document.getElementById('tplBodyHidden').value = template.body_html;
  window.scrollTo(0, 0);
}

function switchEditorMode(mode) {
  const previewDiv = document.getElementById('tplPreviewMode');
  const htmlDiv = document.getElementById('tplHtmlMode');
  const textarea = document.getElementById('tplBody');
  const hidden = document.getElementById('tplBodyHidden');

  if (mode === 'preview') {
    if (textarea) hidden.value = textarea.value;
    updateLivePreview();
    previewDiv.style.display = 'block';
    htmlDiv.style.display = 'none';
  } else {
    if (textarea) textarea.value = hidden.value;
    previewDiv.style.display = 'none';
    htmlDiv.style.display = 'block';
  }

  editorMode = mode;
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.mode-btn:${mode === 'preview' ? 'first-child' : 'last-child'}`).classList.add('active');
}

function updateLivePreview() {
  const textarea = document.getElementById('tplBody');
  const hidden = document.getElementById('tplBodyHidden');
  const subjectInput = document.getElementById('tplSubject');

  const html = textarea ? textarea.value : hidden.value;
  if (textarea) hidden.value = html;

  const bodyEl = document.getElementById('liveBody');
  const subjEl = document.getElementById('liveSubject');
  if (bodyEl) bodyEl.innerHTML = renderWithSampleData(html);
  if (subjEl) subjEl.innerHTML = 'Subject: ' + esc(renderWithSampleData(subjectInput?.value || ''));
}

function insertPlaceholder(name) {
  const ta = document.getElementById('tplBody');
  if (!ta) return;
  const start = ta.selectionStart;
  const end = ta.selectionEnd;
  const text = ta.value;
  ta.value = text.slice(0, start) + `{{${name}}}` + text.slice(end);
  ta.focus();
  ta.selectionStart = ta.selectionEnd = start + name.length + 4;
  document.getElementById('tplBodyHidden').value = ta.value;
}

async function saveTemplate(id) {
  const textarea = document.getElementById('tplBody');
  const hidden = document.getElementById('tplBodyHidden');
  const bodyHtml = textarea ? textarea.value : hidden.value;

  const data = {
    name: document.getElementById('tplName').value.trim(),
    subject: document.getElementById('tplSubject').value.trim(),
    body_html: bodyHtml,
    template_type: document.getElementById('tplType').value,
    category: document.getElementById('tplCat').value || null
  };

  if (!data.name || !data.subject || !data.body_html) return showToast('Name, subject, and body are required', 'error');

  try {
    if (id) {
      await API.put(`/templates/${id}`, data);
      showToast('Template updated!');
    } else {
      await API.post('/templates', data);
      showToast('Template created!');
    }
    loadTemplates();
  } catch (err) {
    showToast('Failed to save template', 'error');
  }
}

async function deleteTemplate(id) {
  if (!confirm('Delete this template?')) return;
  try {
    await API.del(`/templates/${id}`);
    showToast('Template deleted');
    loadTemplates();
  } catch (err) {
    showToast('Failed to delete', 'error');
  }
}
