export const darkExecutiveHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Dark Executive</title>
<style>
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  :root {
    --dark: #0a0f1a;
    --dark-surface: #111827;
    --amber: #f59e0b;
    --amber-dim: rgba(245,158,11,0.15);
    --white: #ffffff;
    --gray-100: #f1f5f9;
    --gray-300: #cbd5e1;
    --gray-500: #64748b;
    --gray-800: #1e293b;
  }
  body { font-family: system-ui, -apple-system, sans-serif; background: var(--dark); color: var(--white); overflow: hidden; height: 100vh; }
  .deck { position: relative; width: 100%; height: 100vh; }
  .slide { position: absolute; inset: 0; display: none; flex-direction: column; padding: 60px 80px; }
  .slide.active { display: flex; }

  /* Dark slides */
  .dark-slide { background: var(--dark); color: var(--white); }
  .light-slide { background: var(--white); color: var(--dark); }

  /* Slide 1: Dark Title */
  .slide-1 { justify-content: flex-end; }
  .slide-1 .accent-line { width: 64px; height: 4px; background: var(--amber); margin-bottom: 32px; border-radius: 2px; }
  .slide-1 h1 { font-size: 56px; font-weight: 800; line-height: 1.1; letter-spacing: -1px; max-width: 650px; }
  .slide-1 h1 span { color: var(--amber); }
  .slide-1 .meta { margin-top: 24px; font-size: 15px; color: var(--gray-500); display: flex; gap: 24px; }
  .slide-1 .tag { padding: 4px 16px; border: 1px solid var(--gray-800); border-radius: 100px; font-size: 12px; color: var(--gray-500); }

  /* Slide 2: Light Agenda */
  .slide-2 .label { font-size: 12px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: var(--amber); margin-bottom: 40px; }
  .slide-2 h2 { font-size: 40px; font-weight: 700; margin-bottom: 48px; color: var(--dark); }
  .timeline { display: flex; flex-direction: column; gap: 0; flex: 1; }
  .timeline-item { display: flex; gap: 24px; padding: 20px 0; border-bottom: 1px solid #e2e8f0; }
  .timeline-item .time { width: 80px; font-size: 13px; font-weight: 600; color: var(--amber); padding-top: 2px; flex-shrink: 0; }
  .timeline-item .content h3 { font-size: 18px; font-weight: 600; color: var(--dark); }
  .timeline-item .content p { font-size: 14px; color: var(--gray-500); margin-top: 4px; }

  /* Slide 3: Dark - Big Stat */
  .slide-3 { justify-content: center; align-items: center; text-align: center; }
  .slide-3 .stat { font-size: 140px; font-weight: 900; line-height: 1; color: var(--amber); letter-spacing: -4px; }
  .slide-3 .stat-label { font-size: 24px; font-weight: 500; color: var(--gray-300); margin-top: 16px; max-width: 500px; }
  .slide-3 .stat-sub { font-size: 14px; color: var(--gray-500); margin-top: 12px; }

  /* Slide 4: Light Details */
  .slide-4 .label { font-size: 12px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: var(--amber); margin-bottom: 16px; }
  .slide-4 h2 { font-size: 36px; font-weight: 700; color: var(--dark); margin-bottom: 40px; }
  .metrics-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 40px; }
  .metric-card { padding: 28px; background: var(--gray-100); border-radius: 12px; }
  .metric-card .metric-value { font-size: 36px; font-weight: 800; color: var(--dark); }
  .metric-card .metric-name { font-size: 14px; color: var(--gray-500); margin-top: 4px; }
  .metric-card .metric-change { font-size: 13px; color: #10b981; font-weight: 600; margin-top: 8px; }
  .detail-text { font-size: 16px; line-height: 1.7; color: var(--gray-500); max-width: 700px; }

  /* Slide 5: Dark Quote */
  .slide-5 { justify-content: center; }
  .slide-5 .quote-mark { font-size: 80px; color: var(--amber); line-height: 1; font-family: Georgia, serif; opacity: 0.5; }
  .slide-5 blockquote { font-size: 32px; font-weight: 500; line-height: 1.4; max-width: 700px; margin-top: -16px; color: var(--gray-300); }
  .slide-5 blockquote strong { color: var(--white); font-weight: 700; }
  .slide-5 .attribution { margin-top: 32px; font-size: 16px; color: var(--gray-500); }
  .slide-5 .attribution strong { color: var(--amber); font-weight: 600; }

  /* Slide 6: Light Summary */
  .slide-6 { justify-content: center; }
  .slide-6 h2 { font-size: 40px; font-weight: 700; color: var(--dark); margin-bottom: 40px; }
  .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .summary-item { padding: 28px; border: 2px solid #e2e8f0; border-radius: 12px; transition: border-color 0.2s; }
  .summary-item:hover { border-color: var(--amber); }
  .summary-item .summary-num { font-size: 14px; font-weight: 700; color: var(--amber); margin-bottom: 8px; }
  .summary-item h3 { font-size: 17px; font-weight: 600; color: var(--dark); margin-bottom: 6px; }
  .summary-item p { font-size: 14px; color: var(--gray-500); line-height: 1.5; }

  /* Navigation */
  .nav { position: fixed; bottom: 0; left: 0; right: 0; display: flex; align-items: center; justify-content: space-between; padding: 16px 80px; background: rgba(10,15,26,0.95); backdrop-filter: blur(8px); border-top: 1px solid var(--gray-800); z-index: 100; }
  .slide-counter { font-size: 13px; color: var(--gray-500); font-weight: 500; font-variant-numeric: tabular-nums; }
  .nav-buttons { display: flex; gap: 8px; }
  .nav-btn { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--gray-800); background: var(--dark-surface); border-radius: 8px; cursor: pointer; color: var(--gray-300); transition: all 0.15s; }
  .nav-btn:hover:not(:disabled) { border-color: var(--amber); color: var(--amber); }
  .nav-btn:disabled { opacity: 0.25; cursor: default; }
</style>
</head>
<body>
<div class="deck">
  <div class="slide dark-slide slide-1 active">
    <div class="accent-line"></div>
    <h1>The Future of <span>Enterprise</span> Innovation</h1>
    <div class="meta">
      <span>Executive Briefing</span>
      <span>Q1 2026</span>
      <span class="tag">Confidential</span>
    </div>
  </div>

  <div class="slide light-slide slide-2">
    <div class="label">Overview</div>
    <h2>What we'll cover</h2>
    <div class="timeline">
      <div class="timeline-item"><div class="time">Part 01</div><div class="content"><h3>Market Disruption</h3><p>Key shifts redefining competitive dynamics</p></div></div>
      <div class="timeline-item"><div class="time">Part 02</div><div class="content"><h3>Performance Metrics</h3><p>Year-over-year growth and operational benchmarks</p></div></div>
      <div class="timeline-item"><div class="time">Part 03</div><div class="content"><h3>Strategic Vision</h3><p>Where we see the greatest opportunity</p></div></div>
      <div class="timeline-item"><div class="time">Part 04</div><div class="content"><h3>Action Items</h3><p>Concrete next steps and ownership</p></div></div>
    </div>
  </div>

  <div class="slide dark-slide slide-3">
    <div class="stat">$12B</div>
    <div class="stat-label">Total addressable market projected for 2027</div>
    <div class="stat-sub">+340% growth from 2022 baseline</div>
  </div>

  <div class="slide light-slide slide-4">
    <div class="label">Performance</div>
    <h2>Key metrics trending upward</h2>
    <div class="metrics-row">
      <div class="metric-card"><div class="metric-value">94%</div><div class="metric-name">Customer satisfaction</div><div class="metric-change">+12% YoY</div></div>
      <div class="metric-card"><div class="metric-value">$3.8M</div><div class="metric-name">Avg. contract value</div><div class="metric-change">+28% YoY</div></div>
      <div class="metric-card"><div class="metric-value">147</div><div class="metric-name">Enterprise accounts</div><div class="metric-change">+41 new</div></div>
    </div>
    <p class="detail-text">Operational efficiency improvements have driven margin expansion while maintaining the highest customer satisfaction scores in our company's history.</p>
  </div>

  <div class="slide dark-slide slide-5">
    <div class="quote-mark">&ldquo;</div>
    <blockquote>The organizations that will thrive are those that treat <strong>innovation not as a project, but as an operating system</strong> woven into everything they do.</blockquote>
    <div class="attribution"><strong>Sarah Chen</strong> &mdash; Chief Strategy Officer</div>
  </div>

  <div class="slide light-slide slide-6">
    <h2>Key Takeaways</h2>
    <div class="summary-grid">
      <div class="summary-item"><div class="summary-num">01</div><h3>Market is accelerating</h3><p>The $12B TAM represents a once-in-a-decade opportunity to capture dominant market share.</p></div>
      <div class="summary-item"><div class="summary-num">02</div><h3>Metrics prove readiness</h3><p>94% CSAT and growing ACV demonstrate our product-market fit and expansion potential.</p></div>
      <div class="summary-item"><div class="summary-num">03</div><h3>Act now on enterprise</h3><p>147 enterprise accounts is just 8% of potential. Dedicated sales motion needed in Q2.</p></div>
      <div class="summary-item"><div class="summary-num">04</div><h3>Innovation as culture</h3><p>Embed experimentation into quarterly cycles to sustain our competitive advantage.</p></div>
    </div>
  </div>
</div>

<div class="nav">
  <div class="slide-counter">1 / 6</div>
  <div class="nav-buttons">
    <button class="nav-btn prev-btn" disabled><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg></button>
    <button class="nav-btn next-btn"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg></button>
  </div>
</div>

<script>
(function(){
  var slides=document.querySelectorAll('.slide'),current=0,total=slides.length;
  var counter=document.querySelector('.slide-counter');
  var prev=document.querySelector('.prev-btn'),next=document.querySelector('.next-btn');
  function show(i){slides.forEach(function(s){s.classList.remove('active')});slides[i].classList.add('active');counter.textContent=(i+1)+' / '+total;prev.disabled=i===0;next.disabled=i===total-1;}
  prev.addEventListener('click',function(){if(current>0)show(--current)});
  next.addEventListener('click',function(){if(current<total-1)show(++current)});
  document.addEventListener('keydown',function(e){if(e.key==='ArrowLeft'&&current>0)show(--current);if(e.key==='ArrowRight'&&current<total-1)show(++current);});
  show(0);
})();
</script>
</body>
</html>`;
