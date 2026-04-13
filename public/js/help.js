function loadHelp() {
  const el = document.getElementById('tab-help');
  el.innerHTML = `
    <div class="card">
      <div class="card-header"><h3>How to Use Hometown Pipeline</h3></div>
      <div class="help-content">

        <div class="help-section">
          <h3>Overview</h3>
          <p>Hometown Pipeline is your catering outreach tool. It helps you find local businesses, send them personalized emails about your catering service, automatically follow up with people who don't respond, and track everything in one place. The goal: turn cold prospects into recurring catering clients.</p>
        </div>

        <div class="help-section">
          <h3>Dashboard</h3>
          <p>Your at-a-glance view of everything happening in the pipeline.</p>
          <ul>
            <li><strong>Pipeline stages</strong> show how many prospects are at each stage: Not Touched (haven't been contacted), Initial Outreach (first email sent), Follow Up (follow-ups sent), In Contact (they opened/clicked/responded), Secured (they're a client!), Lost (not interested).</li>
            <li><strong>Outreach stats</strong> show total emails sent, open rate, click rate, and how many emails went out this week.</li>
            <li><strong>Recent Activity</strong> is a live feed of everything happening — emails sent, opened, clicked, status changes, new prospects added.</li>
          </ul>
        </div>

        <div class="help-section">
          <h3>Prospects</h3>
          <p>This is your database of every business you're targeting for catering. Each prospect has contact info, a category, their city, and a pipeline status.</p>
          <ul>
            <li><strong>Adding prospects:</strong> Click the "+" button to expand the add form. Business name is required; everything else is optional but the more info you have (especially email and contact name), the better your outreach will be.</li>
            <li><strong>City field:</strong> Type any city — it'll suggest nearby North Shore communities but you can enter anything.</li>
            <li><strong>Nearest location:</strong> The system auto-assigns the closest Hometown Coffee & Juice location based on the city. This gets used in email templates as {{nearest_location}} so the email feels local.</li>
            <li><strong>Pipeline status:</strong> Click on a prospect row to open the detail panel, then change their status with the dropdown. Statuses also change automatically when emails are sent/opened.</li>
            <li><strong>Sending an email:</strong> Click a prospect row to open the detail panel, then click "Send Email." Pick a template, preview how it'll look with their info filled in, and send.</li>
            <li><strong>Bulk select:</strong> Use the checkboxes to select multiple prospects, then click "Email X Selected" to send the same template to all of them at once.</li>
            <li><strong>CSV Import:</strong> Click "Import CSV" to upload a spreadsheet of prospects. The CSV needs at least a column with "business" or "name" in the header. It'll auto-detect columns for category, contact, phone, email, city, and notes.</li>
            <li><strong>CSV Export:</strong> Click "Export CSV" to download all your prospect data as a spreadsheet.</li>
            <li><strong>Filtering:</strong> Use the search bar and filter dropdowns to narrow down prospects by name, status, category, or city.</li>
          </ul>
        </div>

        <div class="help-section">
          <h3>Outreach (Campaigns)</h3>
          <p>Campaigns are for <strong>bulk outreach</strong> — sending the same email to a bunch of prospects at once, like a mail merge.</p>
          <ul>
            <li><strong>Creating a campaign:</strong> Click "+ New Campaign" and follow the 4 steps:
              <ol>
                <li><strong>Name it</strong> — something descriptive like "Spring 2026 - Medical Offices in Glenview"</li>
                <li><strong>Pick a template</strong> — choose which email to send. Category-specific templates (Corporate, Medical, School, etc.) are recommended because they're tailored to that audience.</li>
                <li><strong>Set filters</strong> — choose who should receive the email. Filter by category, city, pipeline status, or whether they've been emailed before. Leave blank to include everyone eligible.</li>
                <li><strong>Preview recipients</strong> — see exactly who will get the email before you send. Check the list, confirm the count looks right.</li>
              </ol>
            </li>
            <li><strong>What happens when you send:</strong> Emails are queued and sent one per second (to avoid spam filters). Each prospect's pipeline status automatically moves to "Initial Outreach." You can track each email's status in the campaign detail view.</li>
            <li><strong>"Only never-emailed" filter:</strong> This is checked by default so you don't accidentally email someone twice. Uncheck it if you want to re-email prospects.</li>
            <li><strong>Campaign stats:</strong> Click any campaign in the list to see detailed stats — who opened, who clicked, who bounced.</li>
            <li><strong>Rate limiting:</strong> The system sends max 80 emails per day (configurable in Settings) with 1-second delays. This keeps you under Resend's free tier limit and avoids spam flags.</li>
          </ul>
        </div>

        <div class="help-section">
          <h3>Templates</h3>
          <p>Email templates are the actual emails that get sent. They use <strong>placeholders</strong> that get automatically replaced with each prospect's info.</p>
          <ul>
            <li><strong>Placeholders available:</strong>
              <ul>
                <li><code>{{contact_name}}</code> — the prospect's contact name (or "there" if blank)</li>
                <li><code>{{business_name}}</code> — their business name</li>
                <li><code>{{city}}</code> — their city</li>
                <li><code>{{nearest_location}}</code> — the closest HCJ location (Glencoe, Winnetka, Glenview, or Lake Forest)</li>
                <li><code>{{catering_url}}</code> — your Toast catering order link</li>
                <li><code>{{booking_url}}</code> — your Google Calendar link for scheduling calls</li>
              </ul>
            </li>
            <li><strong>Template types:</strong> "Initial" templates are for first contact. "Follow-up 1" and "Follow-up 2" are used by the automated follow-up system. You can also create "Re-engagement" templates for reaching out to old prospects.</li>
            <li><strong>Category-specific templates:</strong> Templates can be tagged to a category (Corporate, Medical, School, etc.) so the messaging is tailored. The General template works for any category.</li>
            <li><strong>Editing:</strong> Click any template card to open the editor. The body is HTML — you can use the placeholder buttons to insert placeholders at your cursor position. Click "Preview" to see how it'll look with sample data filled in.</li>
            <li><strong>Creating new templates:</strong> Click "+ New Template" to create your own from scratch. You can also duplicate an existing template by creating a new one and copying the HTML.</li>
          </ul>
        </div>

        <div class="help-section">
          <h3>Settings</h3>
          <ul>
            <li><strong>Resend API Key:</strong> You need this to actually send emails. Sign up at resend.com, get your API key, and paste it here.</li>
            <li><strong>From Email:</strong> The email address your outreach comes from. You'll need to verify your domain in Resend first (e.g., catering@hometowncoffeejuice.com). Until then, you can use Resend's test address.</li>
            <li><strong>From Name:</strong> What shows as the sender name. Default is "Adam at Hometown Coffee & Juice."</li>
            <li><strong>Daily Send Limit:</strong> Max emails per day. Default 80 (Resend free tier allows 100, we leave headroom).</li>
            <li><strong>Catering URL:</strong> Your Toast ordering link — this becomes {{catering_url}} in templates.</li>
            <li><strong>Booking URL:</strong> Your Google Calendar scheduling link — this becomes {{booking_url}} in templates. Set this up so prospects can book a call with you directly.</li>
            <li><strong>Business Address:</strong> Required by CAN-SPAM law — appears in the footer of every email.</li>
          </ul>
        </div>

        <div class="help-section">
          <h3>Automated Follow-ups</h3>
          <p>The system automatically sends follow-up emails to prospects who don't open your initial email.</p>
          <ul>
            <li><strong>Default sequence:</strong> After the initial email, if a prospect doesn't open it: Follow-up 1 sends after 1 week, Follow-up 2 (final) sends after 3 weeks. That's it, just two check-ins so it doesn't feel pushy.</li>
            <li><strong>What stops follow-ups:</strong> If a prospect opens or clicks any email, follow-ups stop and their status moves to "In Contact." If they unsubscribe, all future emails stop permanently.</li>
            <li><strong>Max 2 follow-ups:</strong> The system never sends more than 2 follow-up emails per prospect. After that, they stay in the pipeline but don't get more automated emails.</li>
            <li><strong>Runs hourly:</strong> The follow-up check runs every hour while the server is running.</li>
            <li><strong>Enable/disable:</strong> You can turn individual follow-up rules on or off in Settings.</li>
          </ul>
        </div>

        <div class="help-section">
          <h3>Getting Started Checklist</h3>
          <ol>
            <li>Go to <strong>Settings</strong> and enter your Resend API key, from email, booking URL, and business address</li>
            <li>Go to <strong>Prospects</strong> and add your target businesses (manually or via CSV import)</li>
            <li>Go to <strong>Templates</strong> and review/customize the starter templates</li>
            <li>Go to <strong>Outreach</strong> and create your first campaign — start with a small batch to test</li>
            <li>Monitor the <strong>Dashboard</strong> for opens and clicks</li>
            <li>Follow up personally with anyone who shows interest (marked "In Contact")</li>
          </ol>
        </div>

        <div class="help-section">
          <h3>Tips for Best Results</h3>
          <ul>
            <li><strong>Start small:</strong> Send to 10-20 prospects first to make sure everything looks right before doing a big blast.</li>
            <li><strong>Use category-specific templates:</strong> A medical office cares about different things than a corporate office. The tailored templates convert better.</li>
            <li><strong>Fill in contact names:</strong> "Hi Jane" converts way better than "Hi there." Research prospects a little before adding them.</li>
            <li><strong>Respond fast:</strong> When someone opens or clicks, reach out personally right away. Check the Dashboard daily for new opens.</li>
            <li><strong>Offer the call:</strong> The booking link is your secret weapon. People who schedule a call are 10x more likely to become regular clients.</li>
            <li><strong>Think recurring:</strong> Your pitch should always emphasize recurring orders — a weekly Monday lunch is worth way more than a one-time order.</li>
          </ul>
        </div>

      </div>
    </div>
  `;
}
