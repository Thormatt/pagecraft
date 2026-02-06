export const annualReportHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Annual Report</title>
<style>
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  :root {
    --primary: #2563eb;
    --primary-dark: #1e40af;
    --dark: #111827;
    --gray-50: #f9fafb;
    --gray-100: #f3f4f6;
    --gray-200: #e5e7eb;
    --gray-500: #6b7280;
    --gray-700: #374151;
    --gray-900: #111827;
  }
  body { font-family: system-ui, -apple-system, sans-serif; color: var(--gray-900); background: white; line-height: 1.6; }
  .container { max-width: 1100px; margin: 0 auto; padding: 0 40px; }

  /* Hero */
  .hero { background: var(--dark); color: white; padding: 100px 0 80px; }
  .hero .overline { font-size: 12px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: var(--primary); margin-bottom: 20px; }
  .hero h1 { font-size: 56px; font-weight: 800; line-height: 1.1; letter-spacing: -1px; max-width: 600px; }
  .hero p { font-size: 18px; color: rgba(255,255,255,0.5); margin-top: 20px; max-width: 480px; }
  .hero .hero-meta { display: flex; gap: 40px; margin-top: 48px; padding-top: 32px; border-top: 1px solid rgba(255,255,255,0.1); }
  .hero .hero-meta div { font-size: 14px; color: rgba(255,255,255,0.4); }
  .hero .hero-meta strong { display: block; font-size: 15px; color: white; font-weight: 600; margin-bottom: 2px; }

  /* Metrics Strip */
  .metrics { background: var(--primary); color: white; padding: 48px 0; }
  .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; text-align: center; }
  .metric-item .metric-value { font-size: 44px; font-weight: 800; letter-spacing: -1px; }
  .metric-item .metric-label { font-size: 14px; opacity: 0.8; margin-top: 4px; }

  /* Section */
  section { padding: 80px 0; }
  section.alt { background: var(--gray-50); }
  .section-label { font-size: 12px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: var(--primary); margin-bottom: 12px; }
  .section-title { font-size: 36px; font-weight: 700; letter-spacing: -0.5px; margin-bottom: 16px; }
  .section-desc { font-size: 17px; color: var(--gray-500); max-width: 600px; line-height: 1.6; }

  /* Two Column */
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; margin-top: 48px; align-items: center; }
  .two-col.reverse { direction: rtl; }
  .two-col.reverse > * { direction: ltr; }
  .content-block h3 { font-size: 22px; font-weight: 600; margin-bottom: 12px; }
  .content-block p { font-size: 16px; color: var(--gray-500); line-height: 1.7; }
  .content-block ul { list-style: none; margin-top: 16px; }
  .content-block ul li { padding: 8px 0; font-size: 15px; color: var(--gray-700); display: flex; align-items: center; gap: 10px; }
  .content-block ul li::before { content: ""; width: 6px; height: 6px; background: var(--primary); border-radius: 50%; flex-shrink: 0; }
  .image-placeholder { aspect-ratio: 4/3; background: var(--gray-100); border-radius: 16px; display: flex; align-items: center; justify-content: center; }
  .image-placeholder svg { width: 48px; height: 48px; color: var(--gray-200); }

  /* Highlights */
  .highlights-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 48px; }
  .highlight-card { padding: 32px; background: white; border-radius: 12px; border: 1px solid var(--gray-200); }
  .highlight-card .highlight-icon { width: 48px; height: 48px; background: rgba(37,99,235,0.08); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; color: var(--primary); }
  .highlight-card h3 { font-size: 18px; font-weight: 600; margin-bottom: 8px; }
  .highlight-card p { font-size: 14px; color: var(--gray-500); line-height: 1.6; }

  /* Team */
  .team-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin-top: 48px; }
  .team-member { text-align: center; }
  .team-avatar { width: 80px; height: 80px; border-radius: 50%; background: var(--gray-100); margin: 0 auto 12px; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 700; color: var(--primary); }
  .team-member h4 { font-size: 15px; font-weight: 600; }
  .team-member p { font-size: 13px; color: var(--gray-500); }

  /* Footer */
  footer { background: var(--dark); color: white; padding: 48px 0; }
  .footer-content { display: flex; justify-content: space-between; align-items: center; }
  .footer-content p { font-size: 14px; color: rgba(255,255,255,0.4); }
  .footer-links { display: flex; gap: 24px; }
  .footer-links a { font-size: 14px; color: rgba(255,255,255,0.5); text-decoration: none; }
  .footer-links a:hover { color: white; }
</style>
</head>
<body>
  <div class="hero">
    <div class="container">
      <div class="overline">Annual Report 2025</div>
      <h1>Building the Future, Together</h1>
      <p>A year of growth, innovation, and impact. Our journey toward transforming the industry.</p>
      <div class="hero-meta">
        <div><strong>Founded</strong>2019</div>
        <div><strong>Employees</strong>2,400+</div>
        <div><strong>Markets</strong>34 Countries</div>
        <div><strong>Revenue</strong>$840M</div>
      </div>
    </div>
  </div>

  <div class="metrics">
    <div class="container">
      <div class="metrics-grid">
        <div class="metric-item"><div class="metric-value">$840M</div><div class="metric-label">Annual Revenue</div></div>
        <div class="metric-item"><div class="metric-value">47%</div><div class="metric-label">YoY Growth</div></div>
        <div class="metric-item"><div class="metric-value">12M+</div><div class="metric-label">Users Worldwide</div></div>
        <div class="metric-item"><div class="metric-value">98.7%</div><div class="metric-label">Customer Retention</div></div>
      </div>
    </div>
  </div>

  <section>
    <div class="container">
      <div class="section-label">Our Mission</div>
      <div class="section-title">Making complex things simple</div>
      <div class="section-desc">We believe that powerful technology should be accessible to everyone. This year, we doubled down on our mission with major platform investments.</div>
      <div class="two-col">
        <div class="image-placeholder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg></div>
        <div class="content-block">
          <h3>Platform Evolution</h3>
          <p>Our platform processed over 2 billion transactions this year, with 99.99% uptime across all regions.</p>
          <ul>
            <li>Launched in 12 new markets</li>
            <li>Reduced latency by 62%</li>
            <li>Shipped 340+ product updates</li>
            <li>Open-sourced core framework</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <section class="alt">
    <div class="container">
      <div class="section-label">Highlights</div>
      <div class="section-title">What defined our year</div>
      <div class="section-desc">Three strategic initiatives drove outsized impact across our business and community.</div>
      <div class="highlights-grid">
        <div class="highlight-card">
          <div class="highlight-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg></div>
          <h3>AI Integration</h3>
          <p>Embedded AI across the platform, reducing manual work by 40% and enabling predictive insights for all customers.</p>
        </div>
        <div class="highlight-card">
          <div class="highlight-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></div>
          <h3>Global Expansion</h3>
          <p>Entered Southeast Asia and Latin America with localized products, growing international revenue 120%.</p>
        </div>
        <div class="highlight-card">
          <div class="highlight-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
          <h3>Community Impact</h3>
          <p>Donated $12M to education initiatives and provided free accounts to 50,000 nonprofits worldwide.</p>
        </div>
      </div>
    </div>
  </section>

  <section>
    <div class="container">
      <div class="section-label">Leadership</div>
      <div class="section-title">Our executive team</div>
      <div class="section-desc">The people driving our vision forward with experience from the world's leading organizations.</div>
      <div class="team-grid">
        <div class="team-member"><div class="team-avatar">JC</div><h4>Jamie Chen</h4><p>CEO & Co-Founder</p></div>
        <div class="team-member"><div class="team-avatar">SR</div><h4>Sarah Rivera</h4><p>Chief Technology Officer</p></div>
        <div class="team-member"><div class="team-avatar">MK</div><h4>Michael Kim</h4><p>Chief Financial Officer</p></div>
        <div class="team-member"><div class="team-avatar">AP</div><h4>Ana Petrova</h4><p>Chief Product Officer</p></div>
      </div>
    </div>
  </section>

  <footer>
    <div class="container">
      <div class="footer-content">
        <p>2025 Annual Report. All rights reserved.</p>
        <div class="footer-links">
          <a href="#">Investor Relations</a>
          <a href="#">Press</a>
          <a href="#">Careers</a>
          <a href="#">Contact</a>
        </div>
      </div>
    </div>
  </footer>
</body>
</html>`;
