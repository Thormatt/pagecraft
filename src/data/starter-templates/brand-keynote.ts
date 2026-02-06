export const brandKeynoteHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Brand Keynote</title>
<style>
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: system-ui, -apple-system, sans-serif; background: #000; color: white; overflow: hidden; height: 100vh; }
  .deck { position: relative; width: 100%; height: 100vh; }
  .slide { position: absolute; inset: 0; display: none; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 60px 80px; }
  .slide.active { display: flex; }

  /* Slide 1: Hero */
  .slide-1 { background: linear-gradient(135deg, #0f0f23 0%, #1a1040 40%, #2d1b69 70%, #4c1d95 100%); }
  .slide-1 .overline { font-size: 13px; font-weight: 600; letter-spacing: 4px; text-transform: uppercase; color: rgba(255,255,255,0.4); margin-bottom: 24px; }
  .slide-1 h1 { font-size: 72px; font-weight: 800; line-height: 1.05; letter-spacing: -2px; max-width: 700px; background: linear-gradient(to right, #ffffff, rgba(255,255,255,0.7)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .slide-1 .tagline { font-size: 22px; color: rgba(255,255,255,0.5); margin-top: 24px; font-weight: 400; }

  /* Slide 2: Feature 1 */
  .slide-2 { background: linear-gradient(160deg, #0c1222 0%, #0f172a 50%, #162032 100%); }
  .slide-2 .feature-icon { width: 80px; height: 80px; border-radius: 20px; background: linear-gradient(135deg, #7c3aed, #a855f7); display: flex; align-items: center; justify-content: center; margin-bottom: 32px; }
  .slide-2 h2 { font-size: 52px; font-weight: 700; letter-spacing: -1px; }
  .slide-2 p { font-size: 20px; color: rgba(255,255,255,0.5); margin-top: 16px; max-width: 500px; line-height: 1.5; }
  .feature-pills { display: flex; gap: 12px; margin-top: 32px; }
  .feature-pills span { padding: 8px 20px; border: 1px solid rgba(255,255,255,0.15); border-radius: 100px; font-size: 14px; color: rgba(255,255,255,0.6); }

  /* Slide 3: Feature 2 */
  .slide-3 { background: linear-gradient(160deg, #0a1628 0%, #1e293b 100%); }
  .slide-3 .stat-row { display: flex; gap: 60px; margin-bottom: 40px; }
  .slide-3 .stat-item { text-align: center; }
  .slide-3 .stat-item .val { font-size: 56px; font-weight: 800; background: linear-gradient(135deg, #06b6d4, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .slide-3 .stat-item .label { font-size: 14px; color: rgba(255,255,255,0.4); margin-top: 4px; }
  .slide-3 h2 { font-size: 44px; font-weight: 700; letter-spacing: -1px; max-width: 600px; }
  .slide-3 p { font-size: 18px; color: rgba(255,255,255,0.4); margin-top: 16px; max-width: 480px; line-height: 1.5; }

  /* Slide 4: Feature 3 with cards */
  .slide-4 { background: linear-gradient(160deg, #18181b 0%, #0c0a09 100%); padding: 60px; }
  .slide-4 h2 { font-size: 44px; font-weight: 700; letter-spacing: -1px; margin-bottom: 48px; }
  .card-row { display: flex; gap: 20px; }
  .keynote-card { flex: 1; padding: 32px; border-radius: 16px; text-align: left; }
  .keynote-card:nth-child(1) { background: linear-gradient(160deg, #7c3aed, #5b21b6); }
  .keynote-card:nth-child(2) { background: linear-gradient(160deg, #ec4899, #be185d); }
  .keynote-card:nth-child(3) { background: linear-gradient(160deg, #06b6d4, #0369a1); }
  .keynote-card .card-icon { width: 44px; height: 44px; background: rgba(255,255,255,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; font-size: 20px; }
  .keynote-card h3 { font-size: 20px; font-weight: 600; margin-bottom: 8px; }
  .keynote-card p { font-size: 14px; color: rgba(255,255,255,0.7); line-height: 1.5; }

  /* Slide 5: Quote */
  .slide-5 { background: linear-gradient(135deg, #0f0f23 0%, #1e1b4b 60%, #312e81 100%); }
  .slide-5 blockquote { font-size: 36px; font-weight: 500; line-height: 1.4; max-width: 650px; font-style: italic; color: rgba(255,255,255,0.85); }
  .slide-5 .author { margin-top: 32px; font-size: 16px; color: rgba(255,255,255,0.4); }
  .slide-5 .author strong { color: rgba(255,255,255,0.7); font-weight: 600; }

  /* Slide 6: CTA */
  .slide-6 { background: linear-gradient(135deg, #0f0f23 0%, #1a1040 40%, #2d1b69 70%, #4c1d95 100%); }
  .slide-6 h2 { font-size: 60px; font-weight: 800; letter-spacing: -1px; margin-bottom: 16px; background: linear-gradient(to right, #ffffff, rgba(255,255,255,0.8)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .slide-6 p { font-size: 20px; color: rgba(255,255,255,0.4); margin-bottom: 40px; }
  .cta-btn { padding: 16px 48px; background: white; color: #1a1040; border: none; border-radius: 12px; font-size: 17px; font-weight: 600; cursor: pointer; transition: transform 0.2s; }
  .cta-btn:hover { transform: scale(1.05); }
  .slide-6 .links { display: flex; gap: 32px; margin-top: 32px; }
  .slide-6 .links a { color: rgba(255,255,255,0.4); text-decoration: none; font-size: 14px; transition: color 0.15s; }
  .slide-6 .links a:hover { color: rgba(255,255,255,0.7); }

  /* Navigation */
  .nav { position: fixed; bottom: 0; left: 0; right: 0; display: flex; align-items: center; justify-content: space-between; padding: 16px 80px; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px); z-index: 100; }
  .slide-counter { font-size: 13px; color: rgba(255,255,255,0.3); font-weight: 500; font-variant-numeric: tabular-nums; }
  .nav-buttons { display: flex; gap: 8px; }
  .nav-btn { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); border-radius: 8px; cursor: pointer; color: rgba(255,255,255,0.5); transition: all 0.15s; }
  .nav-btn:hover:not(:disabled) { border-color: rgba(255,255,255,0.3); color: white; }
  .nav-btn:disabled { opacity: 0.2; cursor: default; }
</style>
</head>
<body>
<div class="deck">
  <div class="slide slide-1 active">
    <div class="overline">Introducing</div>
    <h1>The Next Generation Platform</h1>
    <div class="tagline">Reimagined from the ground up.</div>
  </div>

  <div class="slide slide-2">
    <div class="feature-icon"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg></div>
    <h2>Blazing Fast</h2>
    <p>Engineered for speed at every layer. From first paint to full interactivity in under 100ms.</p>
    <div class="feature-pills"><span>Edge Runtime</span><span>Smart Caching</span><span>Zero Latency</span></div>
  </div>

  <div class="slide slide-3">
    <div class="stat-row">
      <div class="stat-item"><div class="val">99.9%</div><div class="label">Uptime SLA</div></div>
      <div class="stat-item"><div class="val">42ms</div><div class="label">Avg Response</div></div>
      <div class="stat-item"><div class="val">180+</div><div class="label">Edge Locations</div></div>
    </div>
    <h2>Built for Enterprise Scale</h2>
    <p>Trusted by the world's most demanding teams to deliver at any scale, anywhere.</p>
  </div>

  <div class="slide slide-4">
    <h2>Everything You Need</h2>
    <div class="card-row">
      <div class="keynote-card"><div class="card-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div><h3>Security</h3><p>Enterprise-grade encryption, SSO, and compliance built in from day one.</p></div>
      <div class="keynote-card"><div class="card-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 3v18"/><path d="M5 12h14"/><circle cx="12" cy="12" r="10"/></svg></div><h3>Global</h3><p>Automatic edge deployment across 180+ locations worldwide.</p></div>
      <div class="keynote-card"><div class="card-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg></div><h3>Analytics</h3><p>Real-time insights, custom dashboards, and AI-powered recommendations.</p></div>
    </div>
  </div>

  <div class="slide slide-5">
    <blockquote>&ldquo;This is the product we've been waiting for. It changed how our entire team works.&rdquo;</blockquote>
    <div class="author"><strong>Alex Rivera</strong> &mdash; VP Engineering, TechCorp</div>
  </div>

  <div class="slide slide-6">
    <h2>Ready to Start?</h2>
    <p>Join thousands of teams already building the future.</p>
    <button class="cta-btn">Get Started Free</button>
    <div class="links"><a href="#">Documentation</a><a href="#">Pricing</a><a href="#">Contact Sales</a></div>
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
