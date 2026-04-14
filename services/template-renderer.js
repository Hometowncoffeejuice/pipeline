// Shared template renderer with strict fallbacks. Every helper here is
// designed to fail safely — a template with missing data will never produce
// a literal "{{placeholder}}", a double space, or a trailing orphan preposition
// in the email a prospect receives.

// ---------------- LOCATION ASSIGNMENT ----------------
// Maps a prospect's city to the closest Hometown Coffee & Juice location.
// Glencoe is the HQ/flagship and acts as the safe default for any city not
// explicitly mapped, so nearest_location is never empty.
function autoAssignLocation(city) {
  const c = (city || '').toLowerCase().trim();
  if (!c) return 'Glencoe';

  // Winnetka shop covers Winnetka + south North Shore suburbs
  if (/\b(winnetka|wilmette|kenilworth|evanston|northfield)\b/.test(c)) return 'Winnetka';

  // Glenview shop covers Glenview + western/southern inner ring
  if (/\b(glenview|northbrook|golf|morton grove|niles|park ridge|skokie|lincolnwood|des plaines)\b/.test(c)) return 'Glenview';

  // Lake Forest shop covers Lake Forest + northern North Shore
  if (/\b(lake forest|highland park|highwood|deerfield|lake bluff|riverwoods|bannockburn|lincolnshire|fort sheridan)\b/.test(c)) return 'Lake Forest';

  if (/\bglencoe\b/.test(c)) return 'Glencoe';

  // Anywhere else falls back to Glencoe (the flagship)
  return 'Glencoe';
}

// ---------------- SAFE DATA OBJECT ----------------
// Builds the data object passed to renderTemplate, with natural-sounding
// fallbacks for every field. A rendered email should always read like a
// human wrote it, even when the prospect record is missing data.
function buildTemplateData(prospect, settings) {
  const city = (prospect.city && prospect.city.trim()) || '';
  const location = (prospect.nearest_location && prospect.nearest_location.trim()) || autoAssignLocation(city);

  return {
    business_name: (prospect.business_name && prospect.business_name.trim()) || 'your team',
    contact_name: (prospect.contact_name && prospect.contact_name.trim()) || 'there',
    // If city is missing, reuse the HCJ location so phrases like "in {{city}}"
    // still read naturally ("in Glencoe" rather than "in the area")
    city: city || location,
    nearest_location: location,
    catering_url: settings.catering_url || '#',
    booking_url: settings.booking_url || '#',
    menu_url: settings.menu_url || '#'
  };
}

// ---------------- RENDERER ----------------
// Replaces {{placeholder}} with data values. If a placeholder is unknown it
// is replaced with an empty string, NEVER left as a literal. Post-processes
// the result to clean up whitespace artifacts from any empty substitutions.
function renderTemplate(text, data) {
  if (!text) return '';

  let out = text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const val = data[key];
    return (val !== undefined && val !== null) ? String(val) : '';
  });

  // Clean up artifacts from empty substitutions. Order matters: collapse
  // whitespace first, then fix common dangling fragments.
  out = out
    .replace(/[ \t]{2,}/g, ' ')                      // collapse runs of spaces/tabs
    .replace(/\s+([.,!?;:])/g, '$1')                 // no space before punctuation
    .replace(/\b(in|at|near|for|from)\s+([.,!?;:])/gi, '$2') // "in ." → "."
    .replace(/\byour\s+([.,!?;:])/gi, '$1')          // "your ." → "."
    .replace(/\(\s*\)/g, '')                         // empty parens
    .replace(/\n[ \t]+\n/g, '\n\n')                  // whitespace-only lines
    .replace(/\n{3,}/g, '\n\n');                     // excess blank lines

  return out;
}

// ---------------- PRE-SEND VALIDATION ----------------
// Returns null if prospect can be safely sent to, or a human-readable
// reason string if not. Callers should reject with a 400 and show the
// reason to the user.
function validateProspectForSend(prospect) {
  if (!prospect) return 'Prospect not found';
  if (!prospect.email || !prospect.email.trim()) return 'Prospect has no email address';
  if (prospect.unsubscribed) return 'Prospect has unsubscribed';
  if (!prospect.business_name || !prospect.business_name.trim()) return 'Prospect is missing a business name';
  return null;
}

// ---------------- FINAL SAFETY NET ----------------
// If, despite every safeguard, rendered content still contains an unresolved
// placeholder, this check catches it before Resend sends the email.
function hasUnresolvedPlaceholder(text) {
  return /\{\{\w+\}\}/.test(text || '');
}

module.exports = {
  autoAssignLocation,
  buildTemplateData,
  renderTemplate,
  validateProspectForSend,
  hasUnresolvedPlaceholder
};
