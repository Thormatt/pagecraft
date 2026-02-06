export const interactiveMicrositeHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Interactive Microsite</title>
<style>
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  :root {
    --violet: #8b5cf6;
    --violet-dark: #6d28d9;
    --violet-light: #ede9fe;
    --dark: #0f172a;
    --dark-surface: #1e293b;
    --slate-50: #f8fafc;
    --slate-100: #f1f5f9;
    --slate-200: #e2e8f0;
    --slate-400: #94a3b8;
    --slate-500: #64748b;
    --slate-700: #334155;
    --slate-900: #0f172a;
  }
  body { font-family: system-ui, -apple-system, sans-serif; color: var(--slate-900); background: white; }
  html { scroll-behavior: smooth; }

  /* Sticky Nav */
  .nav { position: sticky; top: 0; z-index: 50; background: rgba(255,255,255,0.92); backdrop-filter: blur(12px); border-bottom: 1px solid var(--slate-100); padding: 0 40px; }
  .nav-inner { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; height: 56px; }
  .nav-brand { font-size: 15px; font-weight: 700; color: var(--violet-dark); }
  .nav-links { display: flex; gap: 32px; }
  .nav-links a { font-size: 13px; color: var(--slate-500); text-decoration: none; font-weight: 500; transition: color 0.15s; }
  .nav-links a:hover { color: var(--violet); }

  .container { max-width: 1100px; margin: 0 auto; padding: 0 40px; }

  /* Hero */
  .hero { background: var(--dark); color: white; padding: 120px 0 100px; position: relative; overflow: hidden; }
  .hero::before { content: ""; position: absolute; top: -50%; right: -20%; width: 600px; height: 600px; background: radial-gradient(circle, rgba(139,92,246,0.15), transparent 70%); pointer-events: none; }
  .hero .badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 16px; background: rgba(139,92,246,0.15); border: 1px solid rgba(139,92,246,0.25); border-radius: 100px; font-size: 12px; font-weight: 600; color: var(--violet); margin-bottom: 24px; }
  .hero h1 { font-size: 56px; font-weight: 800; line-height: 1.1; letter-spacing: -1.5px; max-width: 650px; }
  .hero h1 span { background: linear-gradient(135deg, var(--violet), #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .hero p { font-size: 19px; color: var(--slate-400); margin-top: 20px; max-width: 500px; line-height: 1.6; }
  .hero-actions { display: flex; gap: 12px; margin-top: 36px; }
  .btn-primary { padding: 12px 28px; background: var(--violet); color: white; border: none; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; transition: background 0.15s; }
  .btn-primary:hover { background: var(--violet-dark); }
  .btn-secondary { padding: 12px 28px; background: transparent; color: var(--slate-400); border: 1px solid var(--dark-surface); border-radius: 10px; font-size: 15px; font-weight: 500; cursor: pointer; transition: all 0.15s; }
  .btn-secondary:hover { border-color: var(--slate-400); color: white; }

  /* Stats */
  .stats { padding: 64px 0; border-bottom: 1px solid var(--slate-100); }
  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; text-align: center; }
  .stat-item .stat-value { font-size: 36px; font-weight: 800; color: var(--violet-dark); }
  .stat-item .stat-label { font-size: 14px; color: var(--slate-500); margin-top: 4px; }

  /* Features Section */
  section { padding: 80px 0; }
  section.alt { background: var(--slate-50); }
  .section-header { text-align: center; max-width: 600px; margin: 0 auto 48px; }
  .section-label { font-size: 12px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: var(--violet); margin-bottom: 12px; }
  .section-title { font-size: 36px; font-weight: 700; letter-spacing: -0.5px; }
  .section-desc { font-size: 16px; color: var(--slate-500); margin-top: 12px; line-height: 1.6; }

  /* Accordion */
  .accordion { max-width: 700px; margin: 0 auto; }
  .accordion-item { border: 1px solid var(--slate-200); border-radius: 12px; margin-bottom: 12px; overflow: hidden; background: white; }
  .accordion-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; cursor: pointer; font-size: 16px; font-weight: 600; transition: background 0.15s; }
  .accordion-header:hover { background: var(--slate-50); }
  .accordion-icon { width: 24px; height: 24px; border-radius: 6px; background: var(--violet-light); color: var(--violet); display: flex; align-items: center; justify-content: center; transition: transform 0.2s; flex-shrink: 0; }
  .accordion-item.open .accordion-icon { transform: rotate(180deg); }
  .accordion-body { padding: 0 24px 20px; font-size: 15px; color: var(--slate-500); line-height: 1.7; display: none; }
  .accordion-item.open .accordion-body { display: block; }

  /* Case Study */
  .case-study { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
  .case-image { aspect-ratio: 4/3; background: linear-gradient(135deg, var(--violet-light), var(--slate-100)); border-radius: 16px; display: flex; align-items: center; justify-content: center; }
  .case-image svg { width: 64px; height: 64px; color: var(--violet); opacity: 0.4; }
  .case-content .case-quote { font-size: 20px; font-style: italic; line-height: 1.6; color: var(--slate-700); margin-bottom: 20px; border-left: 3px solid var(--violet); padding-left: 20px; }
  .case-content .case-author { font-size: 14px; color: var(--slate-500); }
  .case-content .case-author strong { color: var(--slate-900); }
  .case-metrics { display: flex; gap: 32px; margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--slate-200); }
  .case-metric .cm-value { font-size: 24px; font-weight: 800; color: var(--violet-dark); }
  .case-metric .cm-label { font-size: 12px; color: var(--slate-500); }

  /* CTA */
  .cta-section { background: var(--dark); color: white; padding: 80px 0; text-align: center; }
  .cta-section h2 { font-size: 40px; font-weight: 700; letter-spacing: -0.5px; }
  .cta-section p { font-size: 17px; color: var(--slate-400); margin-top: 12px; }
  .cta-section .btn-primary { margin-top: 32px; padding: 14px 36px; font-size: 16px; }

  /* Footer */
  footer { padding: 32px 0; border-top: 1px solid var(--slate-100); }
  .footer-inner { display: flex; justify-content: space-between; align-items: center; }
  .footer-inner p { font-size: 13px; color: var(--slate-400); }
  .footer-links { display: flex; gap: 20px; }
  .footer-links a { font-size: 13px; color: var(--slate-400); text-decoration: none; }
  .footer-links a:hover { color: var(--violet); }
</style>
</head>
<body>
  <div class="nav">
    <div class="nav-inner">
      <div class="nav-brand">Acme Platform</div>
      <div class="nav-links">
        <a href="#features">Features</a>
        <a href="#case-study">Case Study</a>
        <a href="#contact">Contact</a>
      </div>
    </div>
  </div>

  <div class="hero">
    <div class="container">
      <div class="badge">New in 2026</div>
      <h1>Your workflow, <span>reimagined</span></h1>
      <p>The all-in-one platform that replaces your scattered tools with one powerful, intuitive workspace.</p>
      <div class="hero-actions">
        <button class="btn-primary">Start Free Trial</button>
        <button class="btn-secondary">Watch Demo</button>
      </div>
    </div>
  </div>

  <div class="stats">
    <div class="container">
      <div class="stats-grid">
        <div class="stat-item"><div class="stat-value">50K+</div><div class="stat-label">Teams using Acme</div></div>
        <div class="stat-item"><div class="stat-value">99.9%</div><div class="stat-label">Uptime guarantee</div></div>
        <div class="stat-item"><div class="stat-value">4.9/5</div><div class="stat-label">Average rating</div></div>
        <div class="stat-item"><div class="stat-value">2min</div><div class="stat-label">Setup time</div></div>
      </div>
    </div>
  </div>

  <section class="alt" id="features">
    <div class="container">
      <div class="section-header">
        <div class="section-label">Features</div>
        <div class="section-title">Everything you need</div>
        <div class="section-desc">From project management to analytics, every tool your team needs in one place.</div>
      </div>
      <div class="accordion">
        <div class="accordion-item open">
          <div class="accordion-header">Smart Project Tracking <div class="accordion-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></div></div>
          <div class="accordion-body">AI-powered task management that learns your team's patterns. Automatic priority scoring, smart deadlines, and workload balancing keep everyone productive without micromanagement.</div>
        </div>
        <div class="accordion-item">
          <div class="accordion-header">Real-time Collaboration <div class="accordion-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></div></div>
          <div class="accordion-body">Work together in real-time with multiplayer editing, threaded comments, and instant notifications. No more context switching between chat and docs.</div>
        </div>
        <div class="accordion-item">
          <div class="accordion-header">Advanced Analytics <div class="accordion-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></div></div>
          <div class="accordion-body">Custom dashboards and automated reports give you real-time visibility into team performance, project health, and resource utilization.</div>
        </div>
        <div class="accordion-item">
          <div class="accordion-header">Enterprise Security <div class="accordion-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></div></div>
          <div class="accordion-body">SOC 2 Type II certified with end-to-end encryption, SSO, and granular permissions. Your data is protected with the highest security standards.</div>
        </div>
      </div>
    </div>
  </section>

  <section id="case-study">
    <div class="container">
      <div class="section-header">
        <div class="section-label">Case Study</div>
        <div class="section-title">How TechStart scaled 10x</div>
      </div>
      <div class="case-study">
        <div class="case-image"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg></div>
        <div class="case-content">
          <div class="case-quote">&ldquo;Switching to Acme was the single best decision we made last year. Our team ships twice as fast with half the meetings.&rdquo;</div>
          <div class="case-author"><strong>Maria Santos</strong> &mdash; CTO, TechStart</div>
          <div class="case-metrics">
            <div class="case-metric"><div class="cm-value">2x</div><div class="cm-label">Faster delivery</div></div>
            <div class="case-metric"><div class="cm-value">-50%</div><div class="cm-label">Fewer meetings</div></div>
            <div class="case-metric"><div class="cm-value">96%</div><div class="cm-label">Team adoption</div></div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <div class="cta-section" id="contact">
    <div class="container">
      <h2>Ready to transform your workflow?</h2>
      <p>Start your free 14-day trial. No credit card required.</p>
      <button class="btn-primary">Get Started Free</button>
    </div>
  </div>

  <footer>
    <div class="container">
      <div class="footer-inner">
        <p>2026 Acme Platform. All rights reserved.</p>
        <div class="footer-links">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Support</a>
        </div>
      </div>
    </div>
  </footer>

<script>
document.querySelectorAll('.accordion-header').forEach(function(header) {
  header.addEventListener('click', function() {
    var item = this.parentElement;
    var wasOpen = item.classList.contains('open');
    document.querySelectorAll('.accordion-item').forEach(function(i) { i.classList.remove('open'); });
    if (!wasOpen) item.classList.add('open');
  });
});
</script>
</body>
</html>`;
