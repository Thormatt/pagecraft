export const consultingDeckHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Consulting Deck</title>
<style>
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  :root {
    --navy: #1e3a5f;
    --blue: #2563eb;
    --light-blue: #dbeafe;
    --gray-50: #f8fafc;
    --gray-100: #f1f5f9;
    --gray-400: #94a3b8;
    --gray-600: #475569;
    --gray-900: #0f172a;
  }
  body { font-family: system-ui, -apple-system, sans-serif; background: var(--gray-50); color: var(--gray-900); overflow: hidden; height: 100vh; }
  .deck { position: relative; width: 100%; height: 100vh; }
  .slide { position: absolute; inset: 0; display: none; flex-direction: column; padding: 60px 80px; }
  .slide.active { display: flex; }

  /* Slide 1: Title */
  .slide-title { justify-content: center; background: var(--navy); color: white; }
  .slide-title .logo-bar { position: absolute; top: 40px; left: 80px; display: flex; align-items: center; gap: 12px; }
  .slide-title .logo-dot { width: 32px; height: 32px; background: var(--blue); border-radius: 6px; }
  .slide-title .logo-text { font-size: 14px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; opacity: 0.7; }
  .slide-title h1 { font-size: 52px; font-weight: 700; line-height: 1.15; max-width: 700px; }
  .slide-title .subtitle { font-size: 20px; color: rgba(255,255,255,0.6); margin-top: 20px; }
  .slide-title .date { position: absolute; bottom: 40px; left: 80px; font-size: 14px; color: rgba(255,255,255,0.4); }

  /* Slide 2: Agenda */
  .slide-agenda { background: white; }
  .slide-agenda h2 { font-size: 14px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: var(--blue); margin-bottom: 48px; }
  .agenda-list { list-style: none; flex: 1; display: flex; flex-direction: column; gap: 0; }
  .agenda-list li { display: flex; align-items: center; gap: 24px; padding: 24px 0; border-bottom: 1px solid var(--gray-100); font-size: 22px; font-weight: 500; color: var(--gray-900); }
  .agenda-list .num { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: var(--light-blue); color: var(--blue); font-weight: 700; font-size: 16px; border-radius: 8px; flex-shrink: 0; }

  /* Slide 3: Market Overview (chart) */
  .slide-chart { background: white; }
  .section-label { font-size: 14px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: var(--blue); margin-bottom: 12px; }
  .slide-chart h2 { font-size: 36px; font-weight: 700; margin-bottom: 48px; color: var(--gray-900); }
  .chart-container { flex: 1; display: flex; align-items: flex-end; gap: 32px; padding-bottom: 40px; }
  .chart-bar { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 12px; }
  .bar-wrapper { width: 100%; display: flex; align-items: flex-end; justify-content: center; height: 280px; }
  .bar { width: 64px; border-radius: 8px 8px 0 0; transition: height 0.6s ease; }
  .bar.primary { background: var(--navy); }
  .bar.accent { background: var(--blue); }
  .bar.muted { background: var(--gray-100); }
  .chart-bar .label { font-size: 14px; color: var(--gray-600); font-weight: 500; }
  .chart-bar .value { font-size: 18px; font-weight: 700; color: var(--gray-900); }

  /* Slide 4: Key Findings */
  .slide-findings { background: white; }
  .slide-findings h2 { font-size: 36px; font-weight: 700; margin-bottom: 48px; }
  .findings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; flex: 1; }
  .finding-card { padding: 32px; background: var(--gray-50); border-radius: 12px; border-left: 4px solid var(--blue); }
  .finding-card .finding-num { font-size: 48px; font-weight: 800; color: var(--blue); line-height: 1; margin-bottom: 12px; }
  .finding-card h3 { font-size: 18px; font-weight: 600; margin-bottom: 8px; }
  .finding-card p { font-size: 15px; color: var(--gray-600); line-height: 1.5; }

  /* Slide 5: Recommendations */
  .slide-recs { background: white; }
  .slide-recs h2 { font-size: 36px; font-weight: 700; margin-bottom: 48px; }
  .rec-list { list-style: none; flex: 1; display: flex; flex-direction: column; gap: 20px; }
  .rec-list li { display: flex; gap: 20px; align-items: flex-start; padding: 24px; background: var(--gray-50); border-radius: 12px; }
  .rec-icon { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; background: var(--blue); color: white; border-radius: 10px; font-weight: 700; font-size: 18px; flex-shrink: 0; }
  .rec-list h3 { font-size: 17px; font-weight: 600; margin-bottom: 4px; }
  .rec-list p { font-size: 14px; color: var(--gray-600); line-height: 1.5; }

  /* Slide 6: Thank You */
  .slide-end { background: var(--navy); color: white; justify-content: center; align-items: center; text-align: center; }
  .slide-end h2 { font-size: 52px; font-weight: 700; margin-bottom: 16px; }
  .slide-end p { font-size: 20px; color: rgba(255,255,255,0.5); }
  .slide-end .contact { margin-top: 48px; padding: 20px 40px; border: 1px solid rgba(255,255,255,0.2); border-radius: 12px; font-size: 16px; color: rgba(255,255,255,0.7); }

  /* Navigation */
  .nav { position: fixed; bottom: 0; left: 0; right: 0; display: flex; align-items: center; justify-content: space-between; padding: 16px 80px; background: rgba(255,255,255,0.9); backdrop-filter: blur(8px); border-top: 1px solid var(--gray-100); z-index: 100; }
  .slide-counter { font-size: 13px; color: var(--gray-400); font-weight: 500; font-variant-numeric: tabular-nums; }
  .nav-buttons { display: flex; gap: 8px; }
  .nav-btn { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--gray-100); background: white; border-radius: 8px; cursor: pointer; color: var(--gray-600); transition: all 0.15s; }
  .nav-btn:hover:not(:disabled) { background: var(--gray-50); border-color: var(--gray-400); }
  .nav-btn:disabled { opacity: 0.3; cursor: default; }
</style>
</head>
<body>
<div class="deck">
  <div class="slide slide-title active">
    <div class="logo-bar"><div class="logo-dot"></div><div class="logo-text">Your Company</div></div>
    <h1>Market Growth Strategy & Outlook 2026</h1>
    <p class="subtitle">Strategic analysis and recommendations for the board</p>
    <div class="date">February 2026 | Confidential</div>
  </div>

  <div class="slide slide-agenda">
    <h2>Agenda</h2>
    <ol class="agenda-list">
      <li><span class="num">01</span> Market Overview & Landscape</li>
      <li><span class="num">02</span> Key Findings & Analysis</li>
      <li><span class="num">03</span> Strategic Recommendations</li>
      <li><span class="num">04</span> Implementation Roadmap</li>
      <li><span class="num">05</span> Next Steps & Discussion</li>
    </ol>
  </div>

  <div class="slide slide-chart">
    <div class="section-label">Market Overview</div>
    <h2>Revenue growth across key segments</h2>
    <div class="chart-container">
      <div class="chart-bar"><div class="value">$4.2B</div><div class="bar-wrapper"><div class="bar primary" style="height:65%"></div></div><div class="label">2022</div></div>
      <div class="chart-bar"><div class="value">$5.1B</div><div class="bar-wrapper"><div class="bar primary" style="height:75%"></div></div><div class="label">2023</div></div>
      <div class="chart-bar"><div class="value">$6.8B</div><div class="bar-wrapper"><div class="bar accent" style="height:88%"></div></div><div class="label">2024</div></div>
      <div class="chart-bar"><div class="value">$8.3B</div><div class="bar-wrapper"><div class="bar accent" style="height:100%"></div></div><div class="label">2025</div></div>
      <div class="chart-bar"><div class="value">$9.7B</div><div class="bar-wrapper"><div class="bar muted" style="height:90%;border:2px dashed var(--blue)"></div></div><div class="label">2026E</div></div>
    </div>
  </div>

  <div class="slide slide-findings">
    <div class="section-label">Key Findings</div>
    <h2>Four themes shaping the landscape</h2>
    <div class="findings-grid">
      <div class="finding-card"><div class="finding-num">76%</div><h3>Digital Adoption</h3><p>Enterprise customers have accelerated digital transformation timelines by an average of 2.3 years since 2023.</p></div>
      <div class="finding-card"><div class="finding-num">3.2x</div><h3>Market Expansion</h3><p>Adjacent market opportunity has grown 3.2x, driven primarily by regulatory changes in APAC regions.</p></div>
      <div class="finding-card"><div class="finding-num">$2.4B</div><h3>Untapped Revenue</h3><p>Conservative estimates suggest significant white space in mid-market segment remains addressable.</p></div>
      <div class="finding-card"><div class="finding-num">41%</div><h3>Customer Retention</h3><p>Firms investing in integrated solutions see 41% higher retention rates versus point-solution providers.</p></div>
    </div>
  </div>

  <div class="slide slide-recs">
    <div class="section-label">Recommendations</div>
    <h2>Three strategic priorities</h2>
    <ul class="rec-list">
      <li><div class="rec-icon">1</div><div><h3>Accelerate platform integration</h3><p>Consolidate product offerings into a unified platform experience to capture the 41% retention advantage and reduce customer acquisition cost by an estimated 28%.</p></div></li>
      <li><div class="rec-icon">2</div><div><h3>Expand into mid-market segment</h3><p>Launch tailored pricing and packaging for the $2.4B mid-market opportunity with a dedicated sales motion and partner channel.</p></div></li>
      <li><div class="rec-icon">3</div><div><h3>Invest in APAC go-to-market</h3><p>Establish regional operations to capitalize on 3.2x market growth, targeting Q3 2026 for initial market entry with localized offerings.</p></div></li>
    </ul>
  </div>

  <div class="slide slide-end">
    <h2>Thank You</h2>
    <p>Questions & Discussion</p>
    <div class="contact">contact@yourcompany.com</div>
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
