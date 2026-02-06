export const minimalistReportHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Minimalist Report</title>
<style>
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  :root {
    --accent: #0ea5e9;
    --accent-light: #e0f2fe;
    --black: #0f172a;
    --gray-100: #f1f5f9;
    --gray-200: #e2e8f0;
    --gray-400: #94a3b8;
    --gray-500: #64748b;
    --gray-800: #1e293b;
    --white: #ffffff;
  }
  body { font-family: system-ui, -apple-system, sans-serif; color: var(--black); background: var(--white); line-height: 1.6; }
  .container { max-width: 800px; margin: 0 auto; padding: 0 40px; }

  /* Title */
  .report-header { padding: 100px 0 60px; border-bottom: 3px solid var(--black); }
  .report-header .report-type { font-size: 12px; font-weight: 700; letter-spacing: 4px; text-transform: uppercase; color: var(--accent); margin-bottom: 20px; }
  .report-header h1 { font-size: 48px; font-weight: 800; line-height: 1.1; letter-spacing: -1px; }
  .report-header .report-meta { display: flex; gap: 32px; margin-top: 24px; font-size: 14px; color: var(--gray-500); }
  .report-header .report-meta strong { color: var(--black); font-weight: 600; }

  /* Sections */
  .report-section { padding: 60px 0; border-bottom: 1px solid var(--gray-200); }
  .report-section:last-child { border-bottom: none; }
  .report-section .section-num { font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: var(--gray-400); margin-bottom: 8px; }
  .report-section h2 { font-size: 28px; font-weight: 700; letter-spacing: -0.3px; margin-bottom: 20px; }
  .report-section p { font-size: 16px; color: var(--gray-500); line-height: 1.8; margin-bottom: 16px; }
  .report-section p:last-child { margin-bottom: 0; }

  /* Pull Quote */
  .pull-quote { margin: 32px 0; padding: 24px 0 24px 24px; border-left: 3px solid var(--accent); font-size: 20px; font-weight: 500; color: var(--black); line-height: 1.5; }

  /* Data Visualization - Bar Chart */
  .chart { margin: 40px 0; }
  .chart-title { font-size: 14px; font-weight: 600; margin-bottom: 20px; color: var(--black); }
  .chart-row { display: flex; align-items: center; gap: 16px; margin-bottom: 12px; }
  .chart-label { width: 100px; font-size: 13px; color: var(--gray-500); text-align: right; flex-shrink: 0; }
  .chart-bar-track { flex: 1; height: 28px; background: var(--gray-100); border-radius: 4px; overflow: hidden; position: relative; }
  .chart-bar-fill { height: 100%; border-radius: 4px; display: flex; align-items: center; justify-content: flex-end; padding-right: 10px; font-size: 12px; font-weight: 700; color: white; }
  .chart-bar-fill.accent { background: var(--accent); }
  .chart-bar-fill.dark { background: var(--black); }
  .chart-bar-fill.muted { background: var(--gray-400); }

  /* Key Metrics */
  .key-metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin: 40px 0; }
  .key-metric { padding: 24px; border: 1px solid var(--gray-200); border-radius: 8px; }
  .key-metric .km-value { font-size: 36px; font-weight: 800; color: var(--black); letter-spacing: -1px; }
  .key-metric .km-label { font-size: 13px; color: var(--gray-500); margin-top: 4px; }
  .key-metric .km-change { font-size: 12px; font-weight: 600; margin-top: 8px; }
  .km-change.up { color: #10b981; }
  .km-change.down { color: #ef4444; }

  /* Table */
  .data-table { width: 100%; border-collapse: collapse; margin: 32px 0; font-size: 14px; }
  .data-table th { text-align: left; padding: 12px 16px; border-bottom: 2px solid var(--black); font-weight: 600; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; color: var(--gray-500); }
  .data-table td { padding: 12px 16px; border-bottom: 1px solid var(--gray-100); color: var(--gray-800); }
  .data-table tr:last-child td { border-bottom: none; }
  .data-table .num { text-align: right; font-variant-numeric: tabular-nums; font-weight: 600; }

  /* Conclusion */
  .conclusion { background: var(--gray-100); border-radius: 12px; padding: 40px; margin: 40px 0; }
  .conclusion h3 { font-size: 18px; font-weight: 700; margin-bottom: 12px; }
  .conclusion p { font-size: 15px; color: var(--gray-500); line-height: 1.7; }
  .conclusion ul { list-style: none; margin-top: 16px; }
  .conclusion ul li { padding: 6px 0; font-size: 15px; color: var(--gray-800); display: flex; align-items: flex-start; gap: 10px; }
  .conclusion ul li::before { content: ""; width: 6px; height: 6px; background: var(--accent); border-radius: 50%; flex-shrink: 0; margin-top: 8px; }

  /* Footer */
  .report-footer { padding: 40px 0; text-align: center; font-size: 13px; color: var(--gray-400); border-top: 1px solid var(--gray-200); }
</style>
</head>
<body>
  <div class="container">
    <div class="report-header">
      <div class="report-type">Research Report</div>
      <h1>State of Cloud Infrastructure 2026</h1>
      <div class="report-meta">
        <span>Published <strong>February 2026</strong></span>
        <span>Author <strong>Research Team</strong></span>
        <span>Pages <strong>24</strong></span>
      </div>
    </div>

    <div class="report-section">
      <div class="section-num">01 &mdash; Executive Summary</div>
      <h2>The infrastructure landscape has fundamentally shifted</h2>
      <p>Cloud spending reached $723 billion in 2025, with organizations increasingly moving toward multi-cloud and edge-first architectures. This report examines the key trends driving this transformation.</p>
      <p>Our analysis of 2,400 enterprises across 18 industries reveals three dominant patterns: accelerated serverless adoption, the rise of platform engineering, and a decisive move toward sustainability-driven infrastructure decisions.</p>
      <div class="pull-quote">Organizations with mature platform engineering practices deploy 4.7x more frequently with 85% fewer failures.</div>
    </div>

    <div class="report-section">
      <div class="section-num">02 &mdash; Market Analysis</div>
      <h2>Cloud spending by segment</h2>
      <p>Infrastructure-as-a-Service continues to dominate, but Platform-as-a-Service shows the fastest growth trajectory.</p>
      <div class="key-metrics">
        <div class="key-metric"><div class="km-value">$723B</div><div class="km-label">Total cloud spend</div><div class="km-change up">+23% YoY</div></div>
        <div class="key-metric"><div class="km-value">67%</div><div class="km-label">Multi-cloud adoption</div><div class="km-change up">+12 pts</div></div>
        <div class="key-metric"><div class="km-value">3.2x</div><div class="km-label">Edge compute growth</div><div class="km-change up">Since 2023</div></div>
      </div>
      <div class="chart">
        <div class="chart-title">Revenue by Cloud Segment ($B)</div>
        <div class="chart-row"><div class="chart-label">IaaS</div><div class="chart-bar-track"><div class="chart-bar-fill dark" style="width:78%">$312B</div></div></div>
        <div class="chart-row"><div class="chart-label">PaaS</div><div class="chart-bar-track"><div class="chart-bar-fill accent" style="width:52%">$208B</div></div></div>
        <div class="chart-row"><div class="chart-label">SaaS</div><div class="chart-bar-track"><div class="chart-bar-fill muted" style="width:40%">$159B</div></div></div>
        <div class="chart-row"><div class="chart-label">Edge</div><div class="chart-bar-track"><div class="chart-bar-fill accent" style="width:18%">$44B</div></div></div>
      </div>
    </div>

    <div class="report-section">
      <div class="section-num">03 &mdash; Key Findings</div>
      <h2>Platform engineering emerges as differentiator</h2>
      <p>The most significant finding of our research is the direct correlation between platform engineering maturity and business outcomes. Organizations that have invested in internal developer platforms report measurably better results across all metrics.</p>
      <table class="data-table">
        <thead>
          <tr><th>Metric</th><th class="num">Traditional</th><th class="num">Platform-Led</th><th class="num">Delta</th></tr>
        </thead>
        <tbody>
          <tr><td>Deploy frequency</td><td class="num">Weekly</td><td class="num">On-demand</td><td class="num" style="color:#10b981">4.7x</td></tr>
          <tr><td>Lead time</td><td class="num">14 days</td><td class="num">2 days</td><td class="num" style="color:#10b981">-85%</td></tr>
          <tr><td>Failure rate</td><td class="num">12%</td><td class="num">1.8%</td><td class="num" style="color:#10b981">-85%</td></tr>
          <tr><td>Recovery time</td><td class="num">6 hours</td><td class="num">18 min</td><td class="num" style="color:#10b981">-95%</td></tr>
          <tr><td>Developer satisfaction</td><td class="num">62%</td><td class="num">91%</td><td class="num" style="color:#10b981">+29pts</td></tr>
        </tbody>
      </table>
    </div>

    <div class="report-section">
      <div class="section-num">04 &mdash; Conclusion</div>
      <h2>Recommendations</h2>
      <p>Based on our research, we recommend organizations prioritize three strategic investments to remain competitive in the evolving cloud landscape.</p>
      <div class="conclusion">
        <h3>Strategic priorities for 2026</h3>
        <p>The window for competitive advantage through infrastructure innovation is narrowing. Organizations that act now will be best positioned.</p>
        <ul>
          <li>Invest in platform engineering teams and internal developer portals to achieve the 4.7x deployment advantage</li>
          <li>Adopt a multi-cloud strategy with edge-first architecture to reduce latency and improve resilience</li>
          <li>Integrate sustainability metrics into infrastructure decisions, as green cloud will become a regulatory requirement by 2027</li>
        </ul>
      </div>
    </div>

    <div class="report-footer">
      <p>2026 State of Cloud Infrastructure Report. Published by Research Team. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
