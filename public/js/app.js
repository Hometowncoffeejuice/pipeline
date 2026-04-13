// Tab navigation and app initialization
const TABS = ['dashboard', 'prospects', 'outreach', 'templates', 'settings', 'help'];
let currentTab = 'dashboard';

function switchTab(tab) {
  currentTab = tab;
  TABS.forEach(t => {
    const el = document.getElementById(`tab-${t}`);
    const btn = document.getElementById(`btn-${t}`);
    if (el) el.style.display = t === tab ? 'block' : 'none';
    if (btn) btn.classList.toggle('active', t === tab);
  });
  // Load tab data
  switch (tab) {
    case 'dashboard': loadDashboard(); break;
    case 'prospects': loadProspects(); break;
    case 'outreach': loadCampaigns(); break;
    case 'templates': loadTemplates(); break;
    case 'settings': loadSettings(); break;
    case 'help': loadHelp(); break;
  }
}

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s || '';
  return d.innerHTML;
}

function formatDate(d) {
  if (!d) return '-';
  const date = new Date(d + 'Z');
  return date.toLocaleDateString();
}

function formatDateTime(d) {
  if (!d) return '-';
  const date = new Date(d + 'Z');
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const STATUS_LABELS = {
  not_touched: 'Not Touched',
  initial_outreach: 'Initial Outreach',
  follow_up: 'Follow Up',
  in_contact: 'In Contact',
  secured: 'Secured',
  lost: 'Lost'
};

const STATUS_COLORS = {
  not_touched: '#e74c3c',
  initial_outreach: '#e67e22',
  follow_up: '#f1c40f',
  in_contact: '#3498db',
  secured: '#2ecc71',
  lost: '#95a5a6'
};

const CATEGORIES = ['Corporate', 'Medical', 'School', 'Worship', 'Financial/RE', 'Other'];
// Suggested cities (our locations + common nearby communities)
const SUGGESTED_CITIES = ['Glencoe', 'Winnetka', 'Glenview', 'Lake Forest', 'Wilmette', 'Kenilworth', 'Northbrook', 'Highland Park', 'Deerfield', 'Highwood', 'Northfield', 'Evanston', 'Skokie', 'Libertyville', 'Vernon Hills', 'Bannockburn', 'Lake Bluff'];

// Toast notification
function showToast(msg, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 3000);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  switchTab('dashboard');
});
