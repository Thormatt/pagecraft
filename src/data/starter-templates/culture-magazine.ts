export const cultureMagazineHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Culture Magazine</title>
<style>
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  :root {
    --rose: #f43f5e;
    --amber: #fbbf24;
    --violet: #8b5cf6;
    --teal: #14b8a6;
    --dark: #18181b;
    --gray-100: #f4f4f5;
    --gray-200: #e4e4e7;
    --gray-500: #71717a;
    --gray-700: #3f3f46;
    --gray-900: #18181b;
  }
  body { font-family: system-ui, -apple-system, sans-serif; color: var(--gray-900); background: white; }

  /* Splash / Hero */
  .splash { background: var(--rose); color: white; padding: 60px 40px 80px; position: relative; overflow: hidden; }
  .splash::after { content: "CULTURE"; position: absolute; bottom: -30px; right: -20px; font-size: 180px; font-weight: 900; opacity: 0.1; line-height: 1; letter-spacing: -8px; pointer-events: none; }
  .splash-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 80px; }
  .splash-logo { font-size: 16px; font-weight: 900; letter-spacing: 6px; text-transform: uppercase; }
  .splash-issue { font-size: 13px; font-weight: 500; opacity: 0.7; }
  .splash h1 { font-size: 72px; font-weight: 900; line-height: 0.95; letter-spacing: -3px; max-width: 600px; }
  .splash .lead { font-size: 20px; font-weight: 400; margin-top: 20px; max-width: 450px; opacity: 0.8; line-height: 1.5; }
  .splash .tag-row { display: flex; gap: 10px; margin-top: 32px; }
  .splash .tag { padding: 6px 16px; background: rgba(255,255,255,0.2); border-radius: 100px; font-size: 13px; font-weight: 600; }

  /* Trending Section */
  .trending { padding: 64px 40px; }
  .trending-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 32px; }
  .trending-header h2 { font-size: 14px; font-weight: 800; letter-spacing: 4px; text-transform: uppercase; color: var(--rose); }
  .trending-header span { font-size: 13px; color: var(--gray-500); }
  .trending-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
  .trend-card { border-radius: 16px; overflow: hidden; border: 1px solid var(--gray-200); transition: transform 0.2s; }
  .trend-card:hover { transform: translateY(-4px); }
  .trend-image { height: 160px; display: flex; align-items: center; justify-content: center; font-size: 48px; }
  .trend-card:nth-child(1) .trend-image { background: linear-gradient(135deg, var(--amber), #f97316); }
  .trend-card:nth-child(2) .trend-image { background: linear-gradient(135deg, var(--violet), #ec4899); }
  .trend-card:nth-child(3) .trend-image { background: linear-gradient(135deg, var(--teal), #06b6d4); }
  .trend-body { padding: 20px; }
  .trend-category { font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px; }
  .trend-card:nth-child(1) .trend-category { color: #f97316; }
  .trend-card:nth-child(2) .trend-category { color: var(--violet); }
  .trend-card:nth-child(3) .trend-category { color: var(--teal); }
  .trend-body h3 { font-size: 18px; font-weight: 700; line-height: 1.3; margin-bottom: 6px; }
  .trend-body p { font-size: 13px; color: var(--gray-500); line-height: 1.5; }

  /* Feature Article */
  .feature { padding: 0 40px 64px; }
  .feature-layout { display: grid; grid-template-columns: 1.2fr 1fr; gap: 48px; align-items: center; }
  .feature-visual { aspect-ratio: 4/3; background: var(--dark); border-radius: 20px; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
  .feature-visual::before { content: ""; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(244,63,94,0.3), rgba(139,92,246,0.3)); }
  .feature-visual .play-btn { width: 72px; height: 72px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; position: relative; z-index: 1; }
  .feature-visual .play-btn svg { margin-left: 4px; }
  .feature-content .feature-tag { display: inline-block; padding: 4px 12px; background: var(--rose); color: white; border-radius: 6px; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 16px; }
  .feature-content h2 { font-size: 36px; font-weight: 900; line-height: 1.1; letter-spacing: -1px; margin-bottom: 16px; }
  .feature-content p { font-size: 16px; color: var(--gray-500); line-height: 1.7; margin-bottom: 12px; }
  .feature-content .read-more { display: inline-flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 700; color: var(--rose); text-decoration: none; }

  /* Gallery Grid */
  .gallery { padding: 64px 40px; background: var(--gray-100); }
  .gallery h2 { font-size: 14px; font-weight: 800; letter-spacing: 4px; text-transform: uppercase; color: var(--gray-900); margin-bottom: 32px; }
  .gallery-grid { display: grid; grid-template-columns: repeat(4, 1fr); grid-template-rows: 200px 200px; gap: 16px; }
  .gallery-item { border-radius: 12px; display: flex; align-items: flex-end; padding: 16px; position: relative; overflow: hidden; }
  .gallery-item:nth-child(1) { grid-column: span 2; background: linear-gradient(135deg, var(--rose), #be123c); }
  .gallery-item:nth-child(2) { background: linear-gradient(135deg, var(--amber), #d97706); }
  .gallery-item:nth-child(3) { background: linear-gradient(135deg, var(--violet), #7c3aed); }
  .gallery-item:nth-child(4) { background: linear-gradient(135deg, var(--teal), #0d9488); }
  .gallery-item:nth-child(5) { grid-column: span 2; background: linear-gradient(135deg, var(--dark), #3f3f46); }
  .gallery-item:nth-child(6) { background: linear-gradient(135deg, #ec4899, var(--violet)); }
  .gallery-caption { color: white; font-size: 14px; font-weight: 600; }
  .gallery-caption span { display: block; font-size: 11px; font-weight: 400; opacity: 0.7; margin-top: 2px; }

  /* Quote Section */
  .quote-section { padding: 80px 40px; text-align: center; }
  .quote-section blockquote { font-size: 32px; font-weight: 800; line-height: 1.3; letter-spacing: -0.5px; max-width: 650px; margin: 0 auto; }
  .quote-section blockquote span { background: linear-gradient(135deg, var(--rose), var(--violet)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .quote-section .quote-author { font-size: 15px; color: var(--gray-500); margin-top: 20px; }

  /* About / Footer */
  .about { background: var(--dark); color: white; padding: 64px 40px; }
  .about-inner { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 1.5fr 1fr 1fr; gap: 48px; }
  .about h3 { font-size: 16px; font-weight: 900; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 16px; }
  .about p { font-size: 14px; color: rgba(255,255,255,0.5); line-height: 1.7; }
  .about .footer-links { list-style: none; }
  .about .footer-links li { margin-bottom: 8px; }
  .about .footer-links a { font-size: 14px; color: rgba(255,255,255,0.5); text-decoration: none; transition: color 0.15s; }
  .about .footer-links a:hover { color: white; }
  .about .socials { display: flex; gap: 12px; margin-top: 16px; }
  .about .social-icon { width: 36px; height: 36px; background: rgba(255,255,255,0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; }
  .about .social-icon svg { width: 16px; height: 16px; color: rgba(255,255,255,0.5); }
</style>
</head>
<body>
  <div class="splash">
    <div class="splash-nav">
      <div class="splash-logo">Culture</div>
      <div class="splash-issue">Issue 24 &mdash; Feb 2026</div>
    </div>
    <h1>What Defines Us Now</h1>
    <p class="lead">The movements, ideas, and creators shaping how we live, work, and connect in 2026.</p>
    <div class="tag-row">
      <span class="tag">Technology</span>
      <span class="tag">Design</span>
      <span class="tag">Music</span>
      <span class="tag">Identity</span>
    </div>
  </div>

  <div class="trending">
    <div class="trending-header">
      <h2>Trending Now</h2>
      <span>Most read this week</span>
    </div>
    <div class="trending-grid">
      <div class="trend-card">
        <div class="trend-image"></div>
        <div class="trend-body">
          <div class="trend-category">Design</div>
          <h3>The Return of Maximalism in Digital Spaces</h3>
          <p>How designers are pushing back against minimalist fatigue with bold, layered interfaces.</p>
        </div>
      </div>
      <div class="trend-card">
        <div class="trend-image"></div>
        <div class="trend-body">
          <div class="trend-category">Music</div>
          <h3>AI Collaboration Is the New Band</h3>
          <p>Artists are co-creating with AI, blurring the line between tool and creative partner.</p>
        </div>
      </div>
      <div class="trend-card">
        <div class="trend-image"></div>
        <div class="trend-body">
          <div class="trend-category">Wellness</div>
          <h3>The 4-Day Work Week One Year Later</h3>
          <p>Companies that made the switch share their results, challenges, and surprises.</p>
        </div>
      </div>
    </div>
  </div>

  <div class="feature">
    <div class="feature-layout">
      <div class="feature-visual">
        <div class="play-btn"><svg width="24" height="24" viewBox="0 0 24 24" fill="var(--dark)"><polygon points="5 3 19 12 5 21 5 3"/></svg></div>
      </div>
      <div class="feature-content">
        <div class="feature-tag">Feature</div>
        <h2>Generation Fluid: Identity Beyond Labels</h2>
        <p>A new generation is rejecting rigid categories across gender, career, and creativity. We explore how fluidity is reshaping everything from fashion to the workplace.</p>
        <p>This deep-dive features interviews with 40 creators, entrepreneurs, and activists from 12 countries.</p>
        <a href="#" class="read-more">Read the full story <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></a>
      </div>
    </div>
  </div>

  <div class="gallery">
    <h2>Photo Stories</h2>
    <div class="gallery-grid">
      <div class="gallery-item"><div class="gallery-caption">Tokyo After Dark<span>Street photography by Yuki Tanaka</span></div></div>
      <div class="gallery-item"><div class="gallery-caption">Analog Revival<span>Film photography</span></div></div>
      <div class="gallery-item"><div class="gallery-caption">Urban Gardens<span>Green spaces</span></div></div>
      <div class="gallery-item"><div class="gallery-caption">Sound & Color<span>Festival season</span></div></div>
      <div class="gallery-item"><div class="gallery-caption">Building Tomorrow<span>Architecture pushing boundaries around the world</span></div></div>
      <div class="gallery-item"><div class="gallery-caption">Neon Nights<span>City glow series</span></div></div>
    </div>
  </div>

  <div class="quote-section">
    <blockquote>&ldquo;Culture isn't something that happens to us. It's something <span>we make together</span>, every single day.&rdquo;</blockquote>
    <div class="quote-author">&mdash; From our editor's letter</div>
  </div>

  <div class="about">
    <div class="about-inner">
      <div>
        <h3>Culture</h3>
        <p>A digital magazine exploring the intersection of technology, creativity, and human experience. Published monthly with stories from contributors worldwide.</p>
        <div class="socials">
          <div class="social-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg></div>
          <div class="social-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg></div>
          <div class="social-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></div>
        </div>
      </div>
      <div>
        <h3>Sections</h3>
        <ul class="footer-links">
          <li><a href="#">Technology</a></li>
          <li><a href="#">Design</a></li>
          <li><a href="#">Music & Arts</a></li>
          <li><a href="#">Wellness</a></li>
          <li><a href="#">Identity</a></li>
        </ul>
      </div>
      <div>
        <h3>Company</h3>
        <ul class="footer-links">
          <li><a href="#">About Us</a></li>
          <li><a href="#">Careers</a></li>
          <li><a href="#">Advertise</a></li>
          <li><a href="#">Privacy</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
      </div>
    </div>
  </div>
</body>
</html>`;
