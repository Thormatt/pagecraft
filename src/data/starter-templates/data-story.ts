export const dataStoryHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Data Story</title>
<style>
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  :root {
    --emerald: #10b981;
    --emerald-light: #d1fae5;
    --emerald-dark: #065f46;
    --slate-50: #f8fafc;
    --slate-100: #f1f5f9;
    --slate-300: #cbd5e1;
    --slate-500: #64748b;
    --slate-800: #1e293b;
    --slate-900: #0f172a;
  }
  body { font-family: system-ui, -apple-system, sans-serif; background: white; color: var(--slate-900); overflow: hidden; height: 100vh; }
  .deck { position: relative; width: 100%; height: 100vh; }
  .slide { position: absolute; inset: 0; display: none; flex-direction: column; padding: 60px 80px; }
  .slide.active { display: flex; }

  /* Slide 1: Title */
  .slide-title { background: var(--slate-900); color: white; justify-content: center; }
  .slide-title .badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3); border-radius: 100px; font-size: 12px; font-weight: 600; color: var(--emerald); margin-bottom: 24px; width: fit-content; }
  .slide-title .badge .dot { width: 6px; height: 6px; background: var(--emerald); border-radius: 50%; }
  .slide-title h1 { font-size: 48px; font-weight: 800; line-height: 1.15; max-width: 600px; }
  .slide-title p { font-size: 18px; color: var(--slate-500); margin-top: 16px; max-width: 500px; line-height: 1.5; }

  /* Stat slides */
  .stat-slide { background: white; }
  .stat-slide .top-section { flex: 1; display: flex; flex-direction: column; justify-content: center; }
  .stat-slide .context { font-size: 13px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: var(--emerald); margin-bottom: 20px; }
  .stat-slide .big-stat { font-size: 120px; font-weight: 900; line-height: 1; letter-spacing: -3px; color: var(--slate-900); }
  .stat-slide .big-stat span { color: var(--emerald); }
  .stat-slide .stat-desc { font-size: 22px; font-weight: 500; color: var(--slate-500); margin-top: 12px; max-width: 500px; line-height: 1.4; }
  .stat-slide .chart-section { height: 180px; display: flex; align-items: flex-end; gap: 4px; padding: 24px 0; border-top: 1px solid var(--slate-100); }
  .mini-bar { flex: 1; border-radius: 4px 4px 0 0; background: var(--slate-100); transition: background 0.2s; min-height: 4px; }
  .mini-bar.highlight { background: var(--emerald); }
  .stat-slide .chart-labels { display: flex; justify-content: space-between; padding-top: 8px; font-size: 12px; color: var(--slate-300); }
  .stat-slide .insight { display: flex; align-items: flex-start; gap: 12px; padding: 16px 20px; background: var(--emerald-light); border-radius: 10px; margin-top: 16px; }
  .stat-slide .insight svg { flex-shrink: 0; color: var(--emerald-dark); margin-top: 2px; }
  .stat-slide .insight p { font-size: 14px; color: var(--emerald-dark); line-height: 1.5; }

  /* Slide 6: Summary */
  .slide-summary { background: var(--slate-50); }
  .slide-summary h2 { font-size: 36px; font-weight: 700; margin-bottom: 40px; }
  .summary-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; flex: 1; align-content: start; }
  .summary-card { padding: 28px; background: white; border-radius: 12px; border: 1px solid var(--slate-100); }
  .summary-card .card-stat { font-size: 40px; font-weight: 800; color: var(--emerald); }
  .summary-card h3 { font-size: 16px; font-weight: 600; margin-top: 8px; }
  .summary-card p { font-size: 14px; color: var(--slate-500); margin-top: 4px; line-height: 1.5; }
  .slide-summary .cta { margin-top: 32px; padding: 16px 32px; background: var(--emerald); color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; width: fit-content; }

  /* Navigation */
  .nav { position: fixed; bottom: 0; left: 0; right: 0; display: flex; align-items: center; justify-content: space-between; padding: 16px 80px; background: rgba(255,255,255,0.95); backdrop-filter: blur(8px); border-top: 1px solid var(--slate-100); z-index: 100; }
  .slide-counter { font-size: 13px; color: var(--slate-300); font-weight: 500; font-variant-numeric: tabular-nums; }
  .nav-buttons { display: flex; gap: 8px; }
  .nav-btn { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--slate-100); background: white; border-radius: 8px; cursor: pointer; color: var(--slate-500); transition: all 0.15s; }
  .nav-btn:hover:not(:disabled) { border-color: var(--emerald); color: var(--emerald); }
  .nav-btn:disabled { opacity: 0.3; cursor: default; }
</style>
</head>
<body>
<div class="deck">
  <div class="slide slide-title active">
    <div class="badge"><span class="dot"></span> Research Report</div>
    <h1>The State of Developer Productivity</h1>
    <p>How engineering teams are shipping faster, measuring impact, and scaling their workflows in 2026.</p>
  </div>

  <div class="slide stat-slide">
    <div class="top-section">
      <div class="context">Developer Experience</div>
      <div class="big-stat">73<span>%</span></div>
      <div class="stat-desc">of developers say AI tools have significantly improved their daily workflow</div>
    </div>
    <div class="chart-section">
      <div class="mini-bar" style="height:20%"></div><div class="mini-bar" style="height:25%"></div><div class="mini-bar" style="height:30%"></div><div class="mini-bar" style="height:28%"></div><div class="mini-bar" style="height:35%"></div><div class="mini-bar" style="height:42%"></div><div class="mini-bar" style="height:40%"></div><div class="mini-bar" style="height:48%"></div><div class="mini-bar" style="height:55%"></div><div class="mini-bar" style="height:58%"></div><div class="mini-bar" style="height:62%"></div><div class="mini-bar" style="height:65%"></div><div class="mini-bar highlight" style="height:73%"></div>
    </div>
    <div class="chart-labels"><span>2020</span><span>2023</span><span>2026</span></div>
  </div>

  <div class="slide stat-slide">
    <div class="top-section">
      <div class="context">Deployment Frequency</div>
      <div class="big-stat">4.2<span>x</span></div>
      <div class="stat-desc">faster release cycles compared to teams without automated pipelines</div>
    </div>
    <div class="chart-section">
      <div class="mini-bar" style="height:100%"></div><div class="mini-bar highlight" style="height:100%"></div><div class="mini-bar" style="height:24%"></div><div class="mini-bar highlight" style="height:24%"></div>
    </div>
    <div class="insight">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
      <p>Teams with CI/CD pipelines deploy on average 17 times per week, compared to just 4 for manual processes.</p>
    </div>
  </div>

  <div class="slide stat-slide">
    <div class="top-section">
      <div class="context">Code Quality</div>
      <div class="big-stat">-48<span>%</span></div>
      <div class="stat-desc">reduction in production incidents after adopting automated testing suites</div>
    </div>
    <div class="chart-section">
      <div class="mini-bar highlight" style="height:95%"></div><div class="mini-bar highlight" style="height:88%"></div><div class="mini-bar highlight" style="height:82%"></div><div class="mini-bar highlight" style="height:75%"></div><div class="mini-bar highlight" style="height:72%"></div><div class="mini-bar highlight" style="height:65%"></div><div class="mini-bar" style="height:60%"></div><div class="mini-bar" style="height:58%"></div><div class="mini-bar" style="height:54%"></div><div class="mini-bar" style="height:52%"></div><div class="mini-bar" style="height:50%"></div><div class="mini-bar" style="height:48%"></div>
    </div>
    <div class="chart-labels"><span>Before</span><span>6 months</span><span>12 months</span></div>
  </div>

  <div class="slide stat-slide">
    <div class="top-section">
      <div class="context">Team Satisfaction</div>
      <div class="big-stat">92<span>%</span></div>
      <div class="stat-desc">of high-performing teams report improved developer experience as a top priority</div>
    </div>
    <div class="chart-section">
      <div class="mini-bar" style="height:45%"></div><div class="mini-bar" style="height:48%"></div><div class="mini-bar" style="height:52%"></div><div class="mini-bar" style="height:50%"></div><div class="mini-bar" style="height:58%"></div><div class="mini-bar highlight" style="height:65%"></div><div class="mini-bar highlight" style="height:72%"></div><div class="mini-bar highlight" style="height:78%"></div><div class="mini-bar highlight" style="height:85%"></div><div class="mini-bar highlight" style="height:88%"></div><div class="mini-bar highlight" style="height:90%"></div><div class="mini-bar highlight" style="height:92%"></div>
    </div>
    <div class="insight">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
      <p>Teams that invest in DevEx see 2.4x better retention rates and 31% higher output measured by business impact.</p>
    </div>
  </div>

  <div class="slide slide-summary">
    <h2>Key Takeaways</h2>
    <div class="summary-stats">
      <div class="summary-card"><div class="card-stat">73%</div><h3>AI Adoption</h3><p>Developers embracing AI tools for daily productivity gains</p></div>
      <div class="summary-card"><div class="card-stat">4.2x</div><h3>Faster Releases</h3><p>Automated pipelines accelerating deployment frequency</p></div>
      <div class="summary-card"><div class="card-stat">-48%</div><h3>Fewer Incidents</h3><p>Automated testing dramatically reducing production issues</p></div>
      <div class="summary-card"><div class="card-stat">92%</div><h3>DevEx Priority</h3><p>High-performing teams investing in developer experience</p></div>
    </div>
    <button class="cta">Download Full Report</button>
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
