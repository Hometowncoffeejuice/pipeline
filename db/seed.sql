-- Starter Email Templates

INSERT INTO email_templates (id, name, subject, body_html, body_text, template_type, category) VALUES
('tpl_initial_corporate', 'Corporate - Initial Outreach', 'Lunch for the team at {{business_name}}?',
'<p>Hi {{contact_name}},</p>
<p>It''s Adam Rubin from Hometown Coffee & Juice in {{nearest_location}}. We do catering for a lot of offices in the area and I wanted to reach out to see if your team could use something like that.</p>
<p>We can set up recurring weekly lunches, breakfast for meetings, or one-time orders, whatever works best for you. I''d love to jump on a quick call to figure out what makes sense for your team.</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0"><tr>
<td style="padding-right:10px"><a href="{{booking_url}}" style="display:inline-block;padding:14px 28px;background:#1b2a4a;color:white;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">Book a Call With Me</a></td>
<td style="padding-right:10px"><a href="{{catering_url}}" style="display:inline-block;padding:14px 28px;background:#27ae60;color:white;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">Order Catering</a></td>
<td><a href="{{menu_url}}" style="display:inline-block;padding:14px 28px;background:white;color:#1b2a4a;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;border:2px solid #1b2a4a;">View Our Menu</a></td>
</tr></table>
<p>Or just reply to this email, happy to chat however is easiest for you.</p>
<p>Best,<br>Adam Rubin<br>Hometown Coffee & Juice, {{nearest_location}}</p>',
'Hi {{contact_name}},

It''s Adam Rubin from Hometown Coffee & Juice in {{nearest_location}}. We do catering for a lot of offices in the area and I wanted to reach out to see if your team could use something like that.

We can set up recurring weekly lunches, breakfast for meetings, or one-time orders, whatever works best for you. I''d love to jump on a quick call to figure out what makes sense.

Book a call: {{booking_url}}
Order catering: {{catering_url}}
View our menu: {{menu_url}}

Or just reply to this email, happy to chat however is easiest.

Best,
Adam Rubin
Hometown Coffee & Juice, {{nearest_location}}',
'initial', 'Corporate');

INSERT INTO email_templates (id, name, subject, body_html, body_text, template_type, category) VALUES
('tpl_initial_medical', 'Medical - Initial Outreach', 'Catering for your {{city}} practice',
'<p>Hi {{contact_name}},</p>
<p>It''s Adam Rubin from Hometown Coffee & Juice in {{nearest_location}}. We work with a number of medical and dental offices in the area on catering and I wanted to reach out to your practice.</p>
<p>Whether it''s weekly staff lunches, pharma rep meetings, or patient appreciation events, we can put something together that''s easy and fits your schedule. I''d be happy to set up a quick call to go over the details, or arrange a complimentary tasting for your staff.</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0"><tr>
<td style="padding-right:10px"><a href="{{booking_url}}" style="display:inline-block;padding:14px 28px;background:#1b2a4a;color:white;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">Book a Call With Me</a></td>
<td style="padding-right:10px"><a href="{{catering_url}}" style="display:inline-block;padding:14px 28px;background:#27ae60;color:white;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">Order Catering</a></td>
<td><a href="{{menu_url}}" style="display:inline-block;padding:14px 28px;background:white;color:#1b2a4a;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;border:2px solid #1b2a4a;">View Our Menu</a></td>
</tr></table>
<p>Best,<br>Adam Rubin<br>Hometown Coffee & Juice, {{nearest_location}}</p>',
'Hi {{contact_name}},

It''s Adam Rubin from Hometown Coffee & Juice in {{nearest_location}}. We work with a number of medical and dental offices in the area on catering.

Whether it''s weekly staff lunches, pharma rep meetings, or patient appreciation events, we can put something together that fits your schedule. Happy to set up a quick call or arrange a complimentary tasting.

Book a call: {{booking_url}}
Order catering: {{catering_url}}
View our menu: {{menu_url}}

Best,
Adam Rubin
Hometown Coffee & Juice, {{nearest_location}}',
'initial', 'Medical');

INSERT INTO email_templates (id, name, subject, body_html, body_text, template_type, category) VALUES
('tpl_initial_school', 'School - Initial Outreach', 'Catering for {{business_name}} events',
'<p>Hi {{contact_name}},</p>
<p>It''s Adam Rubin from Hometown Coffee & Juice in {{nearest_location}}. We work with several schools in the area on catering and I wanted to introduce ourselves.</p>
<p>Teacher appreciation lunches, PTA events, staff meetings, end of year celebrations, we can handle all of it. I''d love to chat about what events you have coming up and put together something that works with your budget.</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0"><tr>
<td style="padding-right:10px"><a href="{{booking_url}}" style="display:inline-block;padding:14px 28px;background:#1b2a4a;color:white;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">Book a Call With Me</a></td>
<td style="padding-right:10px"><a href="{{catering_url}}" style="display:inline-block;padding:14px 28px;background:#27ae60;color:white;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">Order Catering</a></td>
<td><a href="{{menu_url}}" style="display:inline-block;padding:14px 28px;background:white;color:#1b2a4a;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;border:2px solid #1b2a4a;">View Our Menu</a></td>
</tr></table>
<p>Looking forward to connecting,<br>Adam Rubin<br>Hometown Coffee & Juice, {{nearest_location}}</p>',
'Hi {{contact_name}},

It''s Adam Rubin from Hometown Coffee & Juice in {{nearest_location}}. We work with several schools in the area on catering.

Teacher appreciation lunches, PTA events, staff meetings, end of year celebrations, we can handle all of it. I''d love to chat about what events you have coming up.

Book a call: {{booking_url}}
Order catering: {{catering_url}}
View our menu: {{menu_url}}

Looking forward to connecting,
Adam Rubin
Hometown Coffee & Juice, {{nearest_location}}',
'initial', 'School');

INSERT INTO email_templates (id, name, subject, body_html, body_text, template_type, category) VALUES
('tpl_initial_worship', 'Worship - Initial Outreach', 'Catering for {{business_name}} gatherings',
'<p>Hi {{contact_name}},</p>
<p>It''s Adam Rubin from Hometown Coffee & Juice in {{nearest_location}}. We cater for a number of congregations and community groups on the North Shore and I wanted to see if we could be helpful for your community as well.</p>
<p>After-service gatherings, committee meetings, community meals, holiday celebrations, we can put together something simple and affordable. I''d love to have a quick call to learn about what would work best for you.</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0"><tr>
<td style="padding-right:10px"><a href="{{booking_url}}" style="display:inline-block;padding:14px 28px;background:#1b2a4a;color:white;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">Book a Call With Me</a></td>
<td style="padding-right:10px"><a href="{{catering_url}}" style="display:inline-block;padding:14px 28px;background:#27ae60;color:white;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">Order Catering</a></td>
<td><a href="{{menu_url}}" style="display:inline-block;padding:14px 28px;background:white;color:#1b2a4a;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;border:2px solid #1b2a4a;">View Our Menu</a></td>
</tr></table>
<p>Best,<br>Adam Rubin<br>Hometown Coffee & Juice, {{nearest_location}}</p>',
'Hi {{contact_name}},

It''s Adam Rubin from Hometown Coffee & Juice in {{nearest_location}}. We cater for a number of congregations and community groups on the North Shore.

After-service gatherings, committee meetings, community meals, we can put together something simple and affordable. I''d love to have a quick call to learn about what works best.

Book a call: {{booking_url}}
Order catering: {{catering_url}}
View our menu: {{menu_url}}

Best,
Adam Rubin
Hometown Coffee & Juice, {{nearest_location}}',
'initial', 'Worship');

INSERT INTO email_templates (id, name, subject, body_html, body_text, template_type, category) VALUES
('tpl_initial_general', 'General - Initial Outreach', 'Catering from Hometown near {{city}}',
'<p>Hi {{contact_name}},</p>
<p>It''s Adam Rubin from Hometown Coffee & Juice in {{nearest_location}}. We do catering for businesses and groups in the area and I wanted to reach out.</p>
<p>Whether you need something recurring like a weekly lunch, or catering for events and meetings, we make it really easy. I''d love to do a quick call to figure out what would work best for you.</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0"><tr>
<td style="padding-right:10px"><a href="{{booking_url}}" style="display:inline-block;padding:14px 28px;background:#1b2a4a;color:white;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">Book a Call With Me</a></td>
<td style="padding-right:10px"><a href="{{catering_url}}" style="display:inline-block;padding:14px 28px;background:#27ae60;color:white;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">Order Catering</a></td>
<td><a href="{{menu_url}}" style="display:inline-block;padding:14px 28px;background:white;color:#1b2a4a;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;border:2px solid #1b2a4a;">View Our Menu</a></td>
</tr></table>
<p>Or just reply to this email, happy to chat however works best.</p>
<p>Best,<br>Adam Rubin<br>Hometown Coffee & Juice, {{nearest_location}}</p>',
'Hi {{contact_name}},

It''s Adam Rubin from Hometown Coffee & Juice in {{nearest_location}}. We do catering for businesses and groups in the area.

Whether you need something recurring like a weekly lunch, or catering for events and meetings, we make it really easy. I''d love to do a quick call to figure out what works.

Book a call: {{booking_url}}
Order catering: {{catering_url}}
View our menu: {{menu_url}}

Or just reply to this email, happy to chat however works best.

Best,
Adam Rubin
Hometown Coffee & Juice, {{nearest_location}}',
'initial', NULL);

-- Initial outreach templates WITH tasting offer

INSERT INTO email_templates (id, name, subject, body_html, body_text, template_type, category) VALUES
('tpl_initial_corporate_tasting', 'Corporate - Initial + Tasting', 'Lunch for the team at {{business_name}}?',
'<p>Hi {{contact_name}},</p>
<p>It''s Adam Rubin from Hometown Coffee & Juice in {{nearest_location}}. We do catering for a lot of offices in the area and I wanted to reach out to see if your team could use something like that.</p>
<p>We can set up recurring weekly lunches, breakfast for meetings, or one-time orders, whatever works best for you. I''d also be happy to drop by with some sample platters if you want to get a feel for what we do.</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0"><tr>
<td style="padding-right:10px"><a href="{{booking_url}}" style="display:inline-block;padding:14px 28px;background:#1b2a4a;color:white;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">Book a Call With Me</a></td>
<td style="padding-right:10px"><a href="{{catering_url}}" style="display:inline-block;padding:14px 28px;background:#27ae60;color:white;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">Order Catering</a></td>
<td><a href="{{menu_url}}" style="display:inline-block;padding:14px 28px;background:white;color:#1b2a4a;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;border:2px solid #1b2a4a;">View Our Menu</a></td>
</tr></table>
<p>Or just reply to this email, happy to chat however is easiest for you.</p>
<p>Best,<br>Adam Rubin<br>Hometown Coffee & Juice, {{nearest_location}}</p>',
'Hi {{contact_name}},

It''s Adam Rubin from Hometown Coffee & Juice in {{nearest_location}}. We do catering for a lot of offices in the area and I wanted to reach out to see if your team could use something like that.

We can set up recurring weekly lunches, breakfast for meetings, or one-time orders, whatever works best. I''d also be happy to drop by with some sample platters if you want to get a feel for what we do.

Book a call: {{booking_url}}
Order catering: {{catering_url}}
View our menu: {{menu_url}}

Or just reply to this email, happy to chat however is easiest.

Best,
Adam Rubin
Hometown Coffee & Juice, {{nearest_location}}',
'initial', 'Corporate');

INSERT INTO email_templates (id, name, subject, body_html, body_text, template_type, category) VALUES
('tpl_initial_medical_tasting', 'Medical - Initial + Tasting', 'Catering for your {{city}} practice',
'<p>Hi {{contact_name}},</p>
<p>It''s Adam Rubin from Hometown Coffee & Juice in {{nearest_location}}. We work with a number of medical and dental offices in the area on catering and I wanted to reach out to your practice.</p>
<p>Whether it''s weekly staff lunches, pharma rep meetings, or patient appreciation events, we can put something together that fits your schedule. If it''d be helpful, I''m happy to drop off some sample platters for the team to try.</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0"><tr>
<td style="padding-right:10px"><a href="{{booking_url}}" style="display:inline-block;padding:14px 28px;background:#1b2a4a;color:white;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">Book a Call With Me</a></td>
<td style="padding-right:10px"><a href="{{catering_url}}" style="display:inline-block;padding:14px 28px;background:#27ae60;color:white;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">Order Catering</a></td>
<td><a href="{{menu_url}}" style="display:inline-block;padding:14px 28px;background:white;color:#1b2a4a;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;border:2px solid #1b2a4a;">View Our Menu</a></td>
</tr></table>
<p>Best,<br>Adam Rubin<br>Hometown Coffee & Juice, {{nearest_location}}</p>',
'Hi {{contact_name}},

It''s Adam Rubin from Hometown Coffee & Juice in {{nearest_location}}. We work with a number of medical and dental offices in the area on catering.

Whether it''s weekly staff lunches, pharma rep meetings, or patient appreciation events, we can put something together that fits your schedule. If it''d be helpful, I''m happy to drop off some sample platters for the team to try.

Book a call: {{booking_url}}
Order catering: {{catering_url}}
View our menu: {{menu_url}}

Best,
Adam Rubin
Hometown Coffee & Juice, {{nearest_location}}',
'initial', 'Medical');

INSERT INTO email_templates (id, name, subject, body_html, body_text, template_type, category) VALUES
('tpl_initial_school_tasting', 'School - Initial + Tasting', 'Catering for {{business_name}} events',
'<p>Hi {{contact_name}},</p>
<p>It''s Adam Rubin from Hometown Coffee & Juice in {{nearest_location}}. We work with several schools in the area on catering and I wanted to introduce ourselves.</p>
<p>Teacher appreciation lunches, PTA events, staff meetings, end of year celebrations, we can handle all of it. If it''d be useful, I''m happy to bring some sample platters by the staff room so people can see what we''re all about.</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0"><tr>
<td style="padding-right:10px"><a href="{{booking_url}}" style="display:inline-block;padding:14px 28px;background:#1b2a4a;color:white;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">Book a Call With Me</a></td>
<td style="padding-right:10px"><a href="{{catering_url}}" style="display:inline-block;padding:14px 28px;background:#27ae60;color:white;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">Order Catering</a></td>
<td><a href="{{menu_url}}" style="display:inline-block;padding:14px 28px;background:white;color:#1b2a4a;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;border:2px solid #1b2a4a;">View Our Menu</a></td>
</tr></table>
<p>Looking forward to connecting,<br>Adam Rubin<br>Hometown Coffee & Juice, {{nearest_location}}</p>',
'Hi {{contact_name}},

It''s Adam Rubin from Hometown Coffee & Juice in {{nearest_location}}. We work with several schools in the area on catering.

Teacher appreciation lunches, PTA events, staff meetings, end of year celebrations, we can handle all of it. If it''d be useful, I''m happy to bring some sample platters by the staff room so people can see what we''re all about.

Book a call: {{booking_url}}
Order catering: {{catering_url}}
View our menu: {{menu_url}}

Looking forward to connecting,
Adam Rubin
Hometown Coffee & Juice, {{nearest_location}}',
'initial', 'School');

INSERT INTO email_templates (id, name, subject, body_html, body_text, template_type, category) VALUES
('tpl_initial_worship_tasting', 'Worship - Initial + Tasting', 'Catering for {{business_name}} gatherings',
'<p>Hi {{contact_name}},</p>
<p>It''s Adam Rubin from Hometown Coffee & Juice in {{nearest_location}}. We cater for a number of congregations and community groups on the North Shore and I wanted to see if we could be helpful for your community as well.</p>
<p>After-service gatherings, committee meetings, community meals, holiday celebrations, we can put together something simple and affordable. If it''d be helpful, I''m happy to bring some sample platters by for your next gathering so people can see what we do.</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0"><tr>
<td style="padding-right:10px"><a href="{{booking_url}}" style="display:inline-block;padding:14px 28px;background:#1b2a4a;color:white;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">Book a Call With Me</a></td>
<td style="padding-right:10px"><a href="{{catering_url}}" style="display:inline-block;padding:14px 28px;background:#27ae60;color:white;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">Order Catering</a></td>
<td><a href="{{menu_url}}" style="display:inline-block;padding:14px 28px;background:white;color:#1b2a4a;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;border:2px solid #1b2a4a;">View Our Menu</a></td>
</tr></table>
<p>Best,<br>Adam Rubin<br>Hometown Coffee & Juice, {{nearest_location}}</p>',
'Hi {{contact_name}},

It''s Adam Rubin from Hometown Coffee & Juice in {{nearest_location}}. We cater for a number of congregations and community groups on the North Shore.

After-service gatherings, committee meetings, community meals, holiday celebrations, we can put together something simple and affordable. If it''d be helpful, I''m happy to bring some sample platters by for your next gathering so people can see what we do.

Book a call: {{booking_url}}
Order catering: {{catering_url}}
View our menu: {{menu_url}}

Best,
Adam Rubin
Hometown Coffee & Juice, {{nearest_location}}',
'initial', 'Worship');

INSERT INTO email_templates (id, name, subject, body_html, body_text, template_type, category) VALUES
('tpl_initial_general_tasting', 'General - Initial + Tasting', 'Catering from Hometown near {{city}}',
'<p>Hi {{contact_name}},</p>
<p>It''s Adam Rubin from Hometown Coffee & Juice in {{nearest_location}}. We do catering for businesses and groups in the area and I wanted to reach out.</p>
<p>Whether you need something recurring like a weekly lunch, or catering for events and meetings, we make it really easy. If you''re curious, I''m happy to drop off some sample platters so you and your team can see what we''re all about.</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0"><tr>
<td style="padding-right:10px"><a href="{{booking_url}}" style="display:inline-block;padding:14px 28px;background:#1b2a4a;color:white;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">Book a Call With Me</a></td>
<td style="padding-right:10px"><a href="{{catering_url}}" style="display:inline-block;padding:14px 28px;background:#27ae60;color:white;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">Order Catering</a></td>
<td><a href="{{menu_url}}" style="display:inline-block;padding:14px 28px;background:white;color:#1b2a4a;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;border:2px solid #1b2a4a;">View Our Menu</a></td>
</tr></table>
<p>Or just reply to this email, happy to chat however works best.</p>
<p>Best,<br>Adam Rubin<br>Hometown Coffee & Juice, {{nearest_location}}</p>',
'Hi {{contact_name}},

It''s Adam Rubin from Hometown Coffee & Juice in {{nearest_location}}. We do catering for businesses and groups in the area.

Whether you need something recurring like a weekly lunch, or catering for events and meetings, we make it really easy. If you''re curious, I''m happy to drop off some sample platters so you and your team can see what we''re all about.

Book a call: {{booking_url}}
Order catering: {{catering_url}}
View our menu: {{menu_url}}

Or just reply to this email, happy to chat however works best.

Best,
Adam Rubin
Hometown Coffee & Juice, {{nearest_location}}',
'initial', NULL);

-- Follow-up templates
INSERT INTO email_templates (id, name, subject, body_html, body_text, template_type, category) VALUES
('tpl_followup1', 'Follow-up 1', 'Following up on catering',
'<p>Hi {{contact_name}},</p>
<p>Just wanted to circle back on my note about catering from Hometown. I know inboxes get busy.</p>
<p>If you''re interested at all, I''d love to set up a quick call. Or feel free to check out our menu and order whenever you''re ready.</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0"><tr>
<td style="padding-right:10px"><a href="{{booking_url}}" style="display:inline-block;padding:14px 28px;background:#1b2a4a;color:white;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">Book a Call</a></td>
<td style="padding-right:10px"><a href="{{catering_url}}" style="display:inline-block;padding:14px 28px;background:#27ae60;color:white;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">Order Catering</a></td>
<td><a href="{{menu_url}}" style="display:inline-block;padding:14px 28px;background:white;color:#1b2a4a;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;border:2px solid #1b2a4a;">View Menu</a></td>
</tr></table>
<p>Best,<br>Adam Rubin<br>Hometown Coffee & Juice</p>',
'Hi {{contact_name}},

Just wanted to circle back on my note about catering from Hometown. If you''re interested, I''d love to set up a quick call. Or feel free to check out our menu and order whenever you''re ready.

Book a call: {{booking_url}}
Order catering: {{catering_url}}
View menu: {{menu_url}}

Best,
Adam Rubin
Hometown Coffee & Juice',
'follow_up_1', NULL);

INSERT INTO email_templates (id, name, subject, body_html, body_text, template_type, category) VALUES
('tpl_followup2', 'Final Follow-up', 'Just checking in on catering',
'<p>Hi {{contact_name}},</p>
<p>Just wanted to check in one more time. Whenever you need catering, we''re right here in {{nearest_location}} and happy to help. Feel free to save these links for whenever the timing is right.</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0"><tr>
<td style="padding-right:10px"><a href="{{catering_url}}" style="display:inline-block;padding:14px 28px;background:#27ae60;color:white;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">Order Catering</a></td>
<td style="padding-right:10px"><a href="{{menu_url}}" style="display:inline-block;padding:14px 28px;background:white;color:#1b2a4a;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;border:2px solid #1b2a4a;">View Menu</a></td>
<td><a href="{{booking_url}}" style="display:inline-block;padding:14px 28px;background:white;color:#1b2a4a;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;border:2px solid #1b2a4a;">Chat With Me</a></td>
</tr></table>
<p>All the best,<br>Adam Rubin<br>Hometown Coffee & Juice, {{nearest_location}}</p>',
'Hi {{contact_name}},

Just wanted to check in one more time. Whenever you need catering, we''re right here in {{nearest_location}} and happy to help. Feel free to save these links for whenever the timing is right.

Order catering: {{catering_url}}
View menu: {{menu_url}}
Chat with me: {{booking_url}}

All the best,
Adam Rubin
Hometown Coffee & Juice, {{nearest_location}}',
'follow_up_2', NULL);

-- App settings (stored as key-value)
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

INSERT OR IGNORE INTO app_settings (key, value) VALUES
('from_email', ''),
('from_name', 'Adam Rubin at Hometown Coffee & Juice'),
('daily_send_limit', '80'),
('catering_url', 'https://www.toasttab.com/catering/locations/9e8dfec4-1c78-4969-8a56-a932e6035c08'),
('menu_url', 'https://static1.squarespace.com/static/5e83ff731e783a000bed08be/t/69d6b518e4daaf252f859ba4/1775678744575/Hometown+Catering+Menu+%28DIGITAL%29++2026+%281%29.pdf'),
('booking_url', ''),
('resend_api_key', ''),
('business_address', ''),
('location_glencoe', 'Glencoe'),
('location_winnetka', 'Winnetka'),
('location_glenview', 'Glenview'),
('location_lake_forest', 'Lake Forest');
