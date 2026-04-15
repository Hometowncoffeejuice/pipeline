const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');
const db = require('../db');

// Shared button block. Every generated email uses the exact same 3-CTA table
// (identical markup to the seeded templates). We inject this deterministically
// so we never rely on the model to emit pixel-perfect button HTML.
const BUTTON_TABLE = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:28px 0;max-width:440px">
  <tr>
    <td width="33.33%" style="padding:0 3px">
      <a href="{{booking_url}}" style="display:block;padding:10px 4px;background:#5a8fc4;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;font-size:13px;text-align:center;font-family:Arial,sans-serif;border:1px solid #5a8fc4;letter-spacing:0.2px">Book a Call</a>
    </td>
    <td width="33.33%" style="padding:0 3px">
      <a href="{{catering_url}}" style="display:block;padding:10px 4px;background:#ffffff;color:#5a8fc4;text-decoration:none;border-radius:6px;font-weight:600;font-size:13px;text-align:center;font-family:Arial,sans-serif;border:1px solid #5a8fc4;letter-spacing:0.2px">Order Catering</a>
    </td>
    <td width="33.33%" style="padding:0 3px">
      <a href="{{menu_url}}" style="display:block;padding:10px 4px;background:#ffffff;color:#5a8fc4;text-decoration:none;border-radius:6px;font-weight:600;font-size:13px;text-align:center;font-family:Arial,sans-serif;border:1px solid #5a8fc4;letter-spacing:0.2px">View Menu</a>
    </td>
  </tr>
</table>`;

const P_STYLE = 'font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#222;margin:0 0 14px 0';
const P_STYLE_LAST = 'font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#222;margin:0';

function wrapParagraphs(paragraphs) {
  return paragraphs
    .map((p, i) => `<p style="${i === paragraphs.length - 1 ? P_STYLE_LAST : P_STYLE}">${p}</p>`)
    .join('\n');
}

function getApiKey() {
  const row = db.prepare('SELECT value FROM app_settings WHERE key = ?').get('anthropic_api_key');
  return (row && row.value) || process.env.ANTHROPIC_API_KEY || null;
}

function loadTemplateExamples() {
  // Most recent / representative templates, used as few-shot style examples.
  // The seeded templates are the source of truth for voice. Pull a diverse set.
  const rows = db.prepare(`
    SELECT name, subject, body_html, template_type, category
    FROM email_templates
    ORDER BY created_at ASC
    LIMIT 20
  `).all();
  return rows;
}

function buildSystemPrompt(examples) {
  const voiceRules = `You are an email coach for Adam Rubin, owner of Hometown Coffee & Juice, a multi-location cafe on Chicago's North Shore (locations in Glencoe, Winnetka, Glenview, and Lake Forest). You generate cold outreach emails to local businesses, medical practices, schools, places of worship, and organizations for catering leads.

VOICE RULES, these are non-negotiable:
- Short. Three body paragraphs max. Each paragraph 1 to 3 sentences.
- Personal, first-person, from Adam Rubin. Sign "Best,"
- Open with "Hi {{contact_name}}," always.
- Second line always introduces Adam: "Adam Rubin here, Hometown Coffee & Juice in {{nearest_location}}."
- ABSOLUTELY NO EM DASHES OR EN DASHES. Never use the em dash character ( — ) or the en dash character ( – ) anywhere in the output, not in subject, not in paragraphs, not in suggested_name, not in the closing. Not even for parenthetical asides. This is the single most important rule. If you would reach for an em dash, use a comma or a period or start a new sentence instead. ASCII hyphens inside compound words ("follow-up", "end-of-year") are allowed only when they join a genuine compound word. When in doubt, use a comma.
- No sales jargon. No "elevate," "synergy," "solutions," "partner," "offerings," "bespoke."
- Concrete nouns. Name specific foods, meeting types, or contexts the reader would recognize (e.g., "board meetings," "teacher appreciation breakfasts," "standing weekly orders," "bagels and coffee," "sandwich trays").
- Casual, warm, confident. Never apologetic, never pushy.
- End the body with a soft CTA, like "put something together," "send over a menu," "jump on a quick call," or "hit reply."

PLACEHOLDERS, use these liberally so the email personalizes per prospect:
- {{contact_name}}, first name of recipient
- {{business_name}}, their business or organization
- {{city}}, their city
- {{nearest_location}}, whichever Hometown location is closest to them
- {{booking_url}}, {{catering_url}}, {{menu_url}}, handled by the CTA buttons (do NOT link these inline in paragraphs)

OUTPUT FORMAT, return ONLY a JSON object, no prose, no markdown fences, with these keys:
{
  "subject": "short subject line, can include {{business_name}} or {{city}}",
  "paragraphs": ["paragraph 1 plain text", "paragraph 2 plain text", "paragraph 3 plain text"],
  "closing": "Best,",
  "template_type": "initial" | "follow_up_1" | "follow_up_2" | "reengagement",
  "category": "Corporate" | "Medical" | "School" | "Worship" | null,
  "suggested_name": "A short name like 'Corporate - Tasting Offer' or 'Holiday Follow-up'"
}

RULES FOR paragraphs[]:
- 2-4 paragraphs of plain text (no HTML tags, no <p>). The system wraps them in styled <p> tags and inserts the CTA button block between the last body paragraph and the closing.
- Use the placeholder braces inside the text (e.g., "Hi {{contact_name}},").
- Do NOT include "Adam Rubin" at the bottom. "Best," is followed by his signature automatically.
- Do NOT include links or buttons. The system injects the three CTA buttons.

Study the examples below carefully for tone, pacing, and sentence rhythm. Match them.`;

  const exampleBlocks = examples.map(t => {
    return `<example>
<name>${t.name}</name>
<type>${t.template_type}${t.category ? ' / ' + t.category : ''}</type>
<subject>${t.subject}</subject>
<body>
${t.body_html}
</body>
</example>`;
  }).join('\n\n');

  return `${voiceRules}

EXAMPLES, these are the existing templates Adam has written. Match this voice exactly. Note: none of the examples use em dashes or en dashes, and yours must not either.

${exampleBlocks}`;
}

function buildUserPrompt(brief) {
  const q = brief || {};
  return `Generate a new email template based on this brief:

Audience / who it's for: ${q.audience || '(not specified)'}
Angle / what makes this email different: ${q.angle || '(not specified)'}
Hook / opening angle or specific context: ${q.hook || '(not specified)'}
Primary CTA emphasis: ${q.cta_emphasis || '(not specified)'}
Tone notes: ${q.tone || '(match the examples)'}
Specifics to include (food items, event types, etc.): ${q.specifics || '(use your judgment based on examples)'}
Template type: ${q.template_type || 'initial'}

Return ONLY the JSON object, no prose, no markdown fences. Reminder: ZERO em dashes and ZERO en dashes anywhere in the output. Use commas and periods instead.`;
}

// Belt-and-suspenders: strip em dashes (—, U+2014) and en dashes (–, U+2013)
// from any string the model produces. We replace surrounding space + dash +
// space patterns with a comma-space, so sentences stay readable. Standalone
// dashes between words become commas. ASCII hyphens are untouched.
function stripFancyDashes(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/\s*[—–]\s*/g, ', ')   // " — " or " – " becomes ", "
    .replace(/[—–]/g, ',');          // any remaining orphan
}

function sanitizeBrief(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'string') out[k] = stripFancyDashes(v);
    else if (Array.isArray(v)) out[k] = v.map(x => typeof x === 'string' ? stripFancyDashes(x) : x);
    else out[k] = v;
  }
  return out;
}

function extractJson(text) {
  // Model should return pure JSON, but strip code fences just in case.
  let t = text.trim();
  if (t.startsWith('```')) {
    t = t.replace(/^```(?:json)?\s*/, '').replace(/\s*```\s*$/, '');
  }
  // Find first { and last }
  const first = t.indexOf('{');
  const last = t.lastIndexOf('}');
  if (first === -1 || last === -1) throw new Error('No JSON object found in response');
  return JSON.parse(t.slice(first, last + 1));
}

function assembleBodyHtml(parsed) {
  const paragraphs = Array.isArray(parsed.paragraphs) ? parsed.paragraphs.filter(Boolean) : [];
  if (paragraphs.length === 0) throw new Error('Coach returned no paragraphs');
  const closing = parsed.closing || 'Best,';

  // Assemble: intro paragraphs + button table + closing paragraph
  const bodyParagraphs = paragraphs.map(p => `<p style="${P_STYLE}">${p}</p>`).join('\n');
  const closingP = `<p style="${P_STYLE_LAST}">${closing}</p>`;

  return `${bodyParagraphs}\n${BUTTON_TABLE}\n${closingP}`;
}

router.post('/generate', async (req, res) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    return res.status(400).json({
      error: 'Anthropic API key not configured. Add it under Settings to use the coach.'
    });
  }

  try {
    const client = new Anthropic({ apiKey });
    const examples = loadTemplateExamples();
    const systemPrompt = buildSystemPrompt(examples);
    const userPrompt = buildUserPrompt(req.body || {});

    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 4096,
      thinking: { type: 'adaptive' },
      system: [
        {
          type: 'text',
          text: systemPrompt,
          // Cache the stable prefix (voice rules + example templates).
          // Examples change rarely; the user brief goes in messages and is volatile.
          cache_control: { type: 'ephemeral' }
        }
      ],
      messages: [
        { role: 'user', content: userPrompt }
      ]
    });

    // Extract text content from response
    const textBlock = response.content.find(b => b.type === 'text');
    if (!textBlock) throw new Error('No text block in model response');

    const parsedRaw = extractJson(textBlock.text);
    const parsed = sanitizeBrief(parsedRaw);
    const body_html = stripFancyDashes(assembleBodyHtml(parsed));

    res.json({
      subject: parsed.subject || '',
      body_html,
      template_type: parsed.template_type || 'initial',
      category: parsed.category || null,
      suggested_name: parsed.suggested_name || 'New AI Template',
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
        cache_read: response.usage.cache_read_input_tokens || 0,
        cache_write: response.usage.cache_creation_input_tokens || 0
      }
    });
  } catch (err) {
    console.error('Template coach error:', err);

    if (err instanceof Anthropic.AuthenticationError) {
      return res.status(401).json({ error: 'Invalid Anthropic API key. Check Settings.' });
    }
    if (err instanceof Anthropic.RateLimitError) {
      return res.status(429).json({ error: 'Rate limited by Anthropic. Wait a moment and try again.' });
    }
    if (err instanceof Anthropic.APIConnectionError) {
      return res.status(503).json({ error: 'Could not reach Anthropic. Check your connection.' });
    }

    res.status(500).json({ error: err.message || 'Coach failed to generate a template' });
  }
});

module.exports = router;
