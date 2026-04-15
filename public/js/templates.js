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

const TEMPLATE_TYPE_LABELS = {
  initial: 'Initial',
  follow_up_1: 'Follow-up 1',
  follow_up_2: 'Follow-up 2',
  reengagement: 'Re-engagement'
};

function renderTemplatesView() {
  const el = document.getElementById('tab-templates');
  el.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3>Email Templates</h3>
        <div style="display:flex;gap:0.5rem">
          <button class="btn btn-gold btn-sm" onclick="showCoachWizard()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z"/></svg>Coach Me a Template</button>
          <button class="btn btn-primary btn-sm" onclick="showTemplateEditor()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>New Template</button>
        </div>
      </div>
      <div class="template-list">
        ${allTemplates.length === 0 ? `
          <div class="empty-state" style="grid-column:1/-1">
            <div class="empty-state-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg></div>
            <h4>No templates yet</h4>
            <p>Create your first email template to start sending personalized outreach.</p>
          </div>` :
          allTemplates.map(t => `
            <div class="template-card" onclick="showTemplateEditor('${t.id}')">
              <div class="template-card-header">
                <h4>${esc(t.name)}</h4>
                <span class="badge badge-type">${TEMPLATE_TYPE_LABELS[t.template_type] || t.template_type}</span>
              </div>
              <div class="template-subject">${esc(t.subject)}</div>
              ${t.category ? `<span class="badge badge-cat" style="margin-top:0.5rem">${esc(t.category)}</span>` : ''}
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

// ============================================================
// AI Template Coach — wizard modal + generation
// ============================================================

function showCoachWizard() {
  const existing = document.getElementById('coachModal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'coachModal';
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal coach-modal">
      <div class="coach-header">
        <div>
          <div class="coach-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" width="14" height="14"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z"/></svg> AI Coach</div>
          <h3>Let's draft a new template</h3>
          <p class="coach-sub">Answer a few questions and the coach will write it in your voice. You can edit everything after.</p>
        </div>
        <button class="modal-close" onclick="closeCoachWizard()">&times;</button>
      </div>

      <div class="coach-body">
        <div class="coach-field">
          <label>Who is this email for? <span class="req">*</span></label>
          <input id="coachAudience" placeholder="e.g. Law firms, hair salons, youth sports leagues, synagogues">
          <small>Name the audience concretely. The more specific, the better the email.</small>
        </div>

        <div class="coach-field">
          <label>What's the angle or occasion?</label>
          <input id="coachAngle" placeholder="e.g. Holiday catering, new office opening, end-of-year staff appreciation">
          <small>What's this email actually about? Leave blank for a generic introduction.</small>
        </div>

        <div class="coach-field">
          <label>Any specific hook or detail to open with?</label>
          <textarea id="coachHook" rows="2" placeholder="e.g. 'We just opened our 4th location in Lake Forest' or 'Catered 15 holiday parties last December'"></textarea>
          <small>One concrete fact or context Adam can lead with. Optional.</small>
        </div>

        <div class="coach-field-row">
          <div class="coach-field">
            <label>Template type</label>
            <select id="coachType">
              <option value="initial">Initial outreach</option>
              <option value="follow_up_1">Follow-up 1 (1 week)</option>
              <option value="follow_up_2">Follow-up 2 / final</option>
              <option value="reengagement">Re-engagement (old leads)</option>
            </select>
          </div>
          <div class="coach-field">
            <label>Primary CTA emphasis</label>
            <select id="coachCta">
              <option value="balanced">Balanced (all three)</option>
              <option value="book">Push toward a call</option>
              <option value="order">Push toward ordering</option>
              <option value="menu">Just share the menu</option>
              <option value="reply">Just ask them to reply</option>
            </select>
          </div>
        </div>

        <div class="coach-field">
          <label>Tone notes</label>
          <input id="coachTone" placeholder="e.g. 'Warmer than usual, it's for a long relationship'">
          <small>Leave blank to match Adam's default tone.</small>
        </div>

        <div class="coach-field">
          <label>Any specifics to include?</label>
          <textarea id="coachSpecifics" rows="2" placeholder="e.g. 'Mention the pumpkin cold brew', 'Note the free tasting tray offer', 'Reference staff appreciation week'"></textarea>
          <small>Foods, events, offers, anything Adam wants in the body. Optional.</small>
        </div>
      </div>

      <div class="coach-footer">
        <button class="btn" onclick="closeCoachWizard()">Cancel</button>
        <button class="btn btn-gold" id="coachGenBtn" onclick="runCoachGeneration()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" width="14" height="14"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z"/></svg>
          Generate Template
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  setTimeout(() => document.getElementById('coachAudience')?.focus(), 50);
}

function closeCoachWizard() {
  const m = document.getElementById('coachModal');
  if (m) m.remove();
}

async function runCoachGeneration() {
  const audience = document.getElementById('coachAudience').value.trim();
  if (!audience) {
    showToast('Tell the coach who this email is for', 'error');
    return;
  }

  const brief = {
    audience,
    angle: document.getElementById('coachAngle').value.trim(),
    hook: document.getElementById('coachHook').value.trim(),
    template_type: document.getElementById('coachType').value,
    cta_emphasis: document.getElementById('coachCta').value,
    tone: document.getElementById('coachTone').value.trim(),
    specifics: document.getElementById('coachSpecifics').value.trim()
  };

  const btn = document.getElementById('coachGenBtn');
  const origHtml = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span class="coach-spinner"></span> Drafting with Claude...';

  try {
    const result = await API.post('/template-coach/generate', brief);
    closeCoachWizard();
    showToast('Template drafted! Review and edit below.');
    openTemplateEditorWithDraft(result);
  } catch (err) {
    const msg = (err && err.message) || 'Coach failed';
    showToast(msg, 'error');
    btn.disabled = false;
    btn.innerHTML = origHtml;
  }
}

function openTemplateEditorWithDraft(draft) {
  // Reuse the existing editor UI by pre-populating it with the draft
  const template = {
    name: draft.suggested_name || 'AI Draft',
    subject: draft.subject || '',
    body_html: draft.body_html || '',
    body_text: '',
    template_type: draft.template_type || 'initial',
    category: draft.category || ''
  };
  currentEditId = null;
  editorMode = 'preview';

  const el = document.getElementById('tab-templates');
  el.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div style="display:flex;align-items:center;gap:0.5rem">
          <button class="btn btn-sm" onclick="loadTemplates()">&larr; Back</button>
          <h3>AI Draft <span class="coach-badge" style="vertical-align:middle;margin-left:0.5rem"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" width="12" height="12"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z"/></svg> Coach</span></h3>
        </div>
        <div style="display:flex;gap:0.5rem">
          <button class="btn btn-sm" onclick="showCoachWizard()">Regenerate</button>
          <button class="btn btn-primary btn-sm" onclick="saveTemplate('')">Save Template</button>
        </div>
      </div>
      <div style="padding:1rem">
        <div class="coach-draft-banner">
          <strong>Draft ready.</strong> Review everything below, edit freely, then save. The coach used your voice from existing templates as reference.
        </div>
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

        <div class="editor-mode-bar">
          <button class="mode-btn active" onclick="switchEditorMode('preview')">Preview</button>
          <button class="mode-btn" onclick="switchEditorMode('html')">Edit HTML</button>
        </div>

        <div id="tplPreviewMode" style="display:block">
          <div class="email-preview-full">
            <div class="email-preview-chrome">
              <div class="email-chrome-dots"><span></span><span></span><span></span></div>
              <div class="email-chrome-from">From: <strong>Adam at Hometown Coffee & Juice</strong></div>
            </div>
            <div class="email-preview-subject" id="liveSubject">Subject: ${esc(renderWithSampleData(template.subject))}</div>
            <div class="email-preview-body" id="liveBody">${renderWithSampleData(template.body_html)}</div>
          </div>
          <p class="preview-note">Showing preview with sample data. Click "Edit HTML" to tweak the draft.</p>
        </div>

        <div id="tplHtmlMode" style="display:none">
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
