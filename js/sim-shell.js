/* ============================================================
   SIM-SHELL.JS — Shared shell for the interactive walkthroughs
   Provides: simple navbar, self-check score, hints, breadcrumb,
   methodology note, sources, downloadable artifact, back-nav.
   Used by each walkthrough via SimShell.init(cfg).
   ============================================================ */

const SimShell = {
  score: 50,
  totalQ: 0,
  correct: 0,
  mode: 'learning',

  init(cfg) {
    this.cfg = cfg;
    this._injectCSS();
    this._renderShell();
    this._bindEvents();
  },

  _injectCSS() {
    const s = document.createElement('style');
    s.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');

      *{box-sizing:border-box;margin:0;padding:0}
      html{scroll-behavior:smooth}
      body{font-family:'DM Sans',sans-serif;background:#f4f7f9;color:#1e293b;line-height:1.5;-webkit-font-smoothing:antialiased}

      /* ── TOP MICRO-BAR ── */
      .ss-topbar{
        background:#0a1628;
        color:#e8c97a;
        font-size:10px;
        letter-spacing:0.14em;
        text-transform:uppercase;
        text-align:center;
        padding:6px 24px;
        font-weight:500;
      }

      /* ── MAIN NAV ── */
      .ss-nav{
        background:#fff;
        border-bottom:1px solid #e2ddd5;
        padding:0 2.5rem;
        display:flex;
        align-items:center;
        justify-content:space-between;
        height:60px;
        position:sticky;
        top:0;
        z-index:200;
        box-shadow:0 1px 8px rgba(10,22,40,0.07);
      }
      .ss-nav-left{display:flex;align-items:center;gap:1rem}

      /* logo mark */
      .ss-logo-mark{
        width:34px;height:34px;
        background:#0a1628;
        border-radius:4px;
        display:flex;align-items:center;justify-content:center;
        font-family:'Libre Baskerville',serif;
        color:#c9a84c;
        font-size:13px;font-weight:700;
        letter-spacing:-0.5px;
        flex-shrink:0;
      }
      .ss-logo-text{
        font-size:12px;font-weight:600;color:#0a1628;letter-spacing:0.02em;
      }
      .ss-logo-sub{
        font-size:9px;color:#718096;letter-spacing:0.08em;text-transform:uppercase;
      }

      /* breadcrumb */
      .ss-breadcrumb{
        display:flex;align-items:center;gap:0.4rem;
        font-size:11px;color:#94a3b8;
        border-left:1px solid #e2e8f0;
        padding-left:1rem;
        margin-left:0.5rem;
      }
      .ss-breadcrumb-sep{color:#cbd5e1;font-size:13px}
      .ss-breadcrumb-home{
        color:#64748b;text-decoration:none;
        transition:color 0.2s;
        font-weight:500;
      }
      .ss-breadcrumb-home:hover{color:#0a1628}
      .ss-breadcrumb-current{
        color:#0a1628;font-weight:600;
        background:#f5e9c8;
        padding:2px 8px;border-radius:2px;
        font-size:10px;letter-spacing:0.04em;
      }

      /* right controls */
      .ss-nav-right{display:flex;align-items:center;gap:1rem}
      .ss-mode-btn{
        display:flex;align-items:center;gap:0.4rem;
        cursor:pointer;
        font-size:11px;font-weight:600;
        letter-spacing:0.06em;text-transform:uppercase;
        color:#64748b;
        background:#f8fafc;
        border:1px solid #e2e8f0;
        border-radius:3px;
        padding:5px 12px;
        transition:all 0.2s;
        user-select:none;
      }
      .ss-mode-btn:hover{color:#0a1628;border-color:#0a1628}
      .ss-mode-btn.analyst-mode{
        background:#0a1628;color:#e8c97a;border-color:#0a1628;
      }

      .ss-score-pill{
        background:linear-gradient(135deg,#0a1628 0%,#1c3060 100%);
        color:#e8c97a;
        padding:5px 14px;
        border-radius:3px;
        font-size:11px;
        font-weight:700;
        letter-spacing:0.06em;
        text-transform:uppercase;
        min-width:90px;
        text-align:center;
      }

      .ss-back-btn{
        color:#64748b;
        font-size:11px;
        text-decoration:none;
        padding:5px 12px;
        border:1px solid #e2e8f0;
        border-radius:3px;
        font-weight:500;
        transition:all 0.2s;
        display:flex;align-items:center;gap:5px;
        letter-spacing:0.02em;
      }
      .ss-back-btn:hover{color:#0a1628;border-color:#0a1628}

      /* ── MODULE BANNER ── */
      .ss-module-banner{
        background:#0a1628;
        border-bottom:2px solid #c9a84c;
        padding:4px 2.5rem;
        display:flex;align-items:center;gap:10px;
      }
      .ss-module-banner-dot{
        width:6px;height:6px;border-radius:50%;
        background:#c9a84c;
        animation:ssBlink 2s infinite;
      }
      .ss-module-banner-text{
        font-size:10px;color:rgba(255,255,255,0.55);
        letter-spacing:0.12em;text-transform:uppercase;font-weight:500;
      }
      .ss-module-banner-name{
        font-size:10px;color:#e8c97a;
        letter-spacing:0.08em;text-transform:uppercase;font-weight:600;
      }
      @keyframes ssBlink{0%,100%{opacity:1}50%{opacity:0.35}}

      /* ── CONTENT ── */
      .ss-container{max-width:1100px;margin:0 auto;padding:2rem 2.5rem}

      /* ── HERO CARD ── */
      .ss-hero{
        background:linear-gradient(135deg,#0a1628 0%,#122040 60%,#1c3060 100%);
        border-radius:6px;
        padding:2.5rem;
        margin-bottom:1.75rem;
        color:#fff;
        position:relative;
        overflow:hidden;
        border:1px solid rgba(201,168,76,0.2);
      }
      .ss-hero::after{
        content:'';position:absolute;top:0;right:0;
        width:280px;height:100%;
        background:linear-gradient(135deg,transparent 40%,rgba(201,168,76,0.05) 100%);
        pointer-events:none;
      }
      .ss-hero-eyebrow{
        font-size:9px;letter-spacing:0.2em;text-transform:uppercase;
        color:#c9a84c;font-weight:600;margin-bottom:0.5rem;
        display:flex;align-items:center;gap:0.5rem;
      }
      .ss-hero-eyebrow::before{
        content:'';width:7px;height:7px;border-radius:50%;
        background:#c9a84c;animation:ssBlink 2s infinite;
      }
      .ss-hero h2{
        font-family:'Libre Baskerville',serif;
        font-size:1.65rem;font-weight:700;margin-bottom:0.5rem;
        color:#fff;
      }
      .ss-hero p{color:rgba(255,255,255,0.6);font-size:0.9rem;max-width:600px;line-height:1.75}

      /* ── STAT CARDS ── */
      .ss-stats{
        display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));
        gap:1rem;margin-bottom:1.5rem;
      }
      .ss-stat{
        background:#fff;border:1px solid #e2ddd5;
        border-radius:4px;padding:1rem;text-align:center;
        transition:box-shadow 0.2s;
      }
      .ss-stat:hover{box-shadow:0 4px 12px rgba(10,22,40,0.07)}
      .ss-stat-val{
        font-size:1.7rem;font-weight:700;color:#0a1628;
        font-family:'Libre Baskerville',serif;
      }
      .ss-stat-lbl{
        font-size:9px;color:#718096;text-transform:uppercase;
        letter-spacing:0.1em;font-weight:600;margin-top:4px;
      }

      /* ── PROGRESS BAR ── */
      .ss-progress{display:flex;gap:3px;margin-bottom:1.5rem}
      .ss-progress-dot{
        flex:1;height:4px;border-radius:2px;
        background:#e2e8f0;transition:background 0.3s;
      }
      .ss-progress-dot.done{background:#2d7a4f}
      .ss-progress-dot.active{background:#c9a84c}

      /* ── SCENARIO CARD ── */
      .ss-card{
        background:#fff;border:1px solid #e2ddd5;
        border-radius:4px;
        box-shadow:0 1px 3px rgba(10,22,40,0.05);
        margin-bottom:1.5rem;
      }
      .ss-card-hd{
        padding:1rem 1.25rem;
        border-bottom:1px solid #e2e8f0;
        display:flex;justify-content:space-between;align-items:center;
        background:#faf8f4;
      }
      .ss-card-hd h3{
        font-size:0.95rem;font-weight:600;
        display:flex;align-items:center;gap:0.5rem;
        color:#0a1628;
      }
      .ss-card-bd{padding:1.25rem}

      /* ── BADGES ── */
      .ss-badge{
        display:inline-flex;padding:2px 8px;
        border-radius:2px;font-size:9px;
        font-weight:700;text-transform:uppercase;letter-spacing:0.06em;
      }
      .ss-badge-blue{background:#dbeafe;color:#1a56a0}
      .ss-badge-green{background:#edf7f2;color:#2d7a4f}
      .ss-badge-amber{background:#fef3c7;color:#b45309}
      .ss-badge-red{background:#fdecea;color:#c0392b}
      .ss-badge-gold{background:#f5e9c8;color:#7a5c1e}

      /* ── BUTTONS ── */
      .ss-btn{
        display:inline-flex;align-items:center;gap:0.4rem;
        padding:0.55rem 1.2rem;
        font-size:12px;font-weight:600;
        border-radius:3px;cursor:pointer;border:none;
        transition:all 0.2s;letter-spacing:0.02em;
        font-family:'DM Sans',sans-serif;
      }
      .ss-btn:disabled{opacity:0.4;cursor:not-allowed}
      .ss-btn-primary{background:#0a1628;color:#e8c97a}
      .ss-btn-primary:hover:not(:disabled){background:#1c3060;transform:translateY(-1px)}
      .ss-btn-outline{background:transparent;border:1px solid #e2ddd5;color:#4a5568}
      .ss-btn-outline:hover:not(:disabled){background:#faf8f4;border-color:#0a1628;color:#0a1628}
      .ss-btn-success{background:#2d7a4f;color:#fff}
      .ss-btn-success:hover:not(:disabled){background:#235f3d;transform:translateY(-1px)}

      /* ── RADIO OPTIONS ── */
      .ss-radio-group{display:flex;flex-direction:column;gap:0.5rem;margin:1rem 0}
      .ss-radio{
        display:flex;align-items:flex-start;gap:0.6rem;
        padding:0.7rem 1rem;
        border:1px solid #e2ddd5;
        border-radius:3px;cursor:pointer;
        transition:all 0.2s;font-size:0.875rem;
        color:#1e293b;line-height:1.5;
        background:#fff;
      }
      .ss-radio:hover{border-color:#0a1628;background:#faf8f4}
      .ss-radio.selected{border-color:#0a1628;background:#f5e9c8}
      .ss-radio.correct{border-color:#2d7a4f;background:#edf7f2;color:#1a4731}
      .ss-radio.incorrect{border-color:#c0392b;background:#fdecea;color:#7b1d1d}
      .ss-radio input{margin-top:3px;flex-shrink:0;accent-color:#0a1628}

      /* ── FEEDBACK ── */
      .ss-feedback{
        padding:1rem;border-radius:3px;
        margin-top:1rem;font-size:0.875rem;line-height:1.65;
        animation:ssFade 0.3s ease;
      }
      .ss-feedback-correct{background:#edf7f2;border:1px solid #a7d7bc;color:#1a4731}
      .ss-feedback-incorrect{background:#fdecea;border:1px solid #f5c6c2;color:#7b1d1d}

      /* ── HINT ── */
      .ss-hint{
        background:#faf8f4;border:1px solid #e8c97a;
        border-left:3px solid #c9a84c;
        border-radius:3px;padding:0.7rem 1rem;
        margin-top:0.75rem;font-size:0.83rem;
        color:#7a5c1e;display:none;line-height:1.6;
      }
      .ss-hint.visible{display:block}

      /* ── FOOTER ── */
      .ss-shell-footer{
        background:#0a1628;
        padding:16px 2.5rem;
        display:flex;align-items:center;justify-content:space-between;
        margin-top:3rem;
      }
      .ss-shell-footer-brand{
        font-size:10px;color:rgba(255,255,255,0.3);
        letter-spacing:0.1em;text-transform:uppercase;
      }
      .ss-shell-footer-brand strong{color:#c9a84c}

      @keyframes ssFade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}

      /* ── METHODOLOGY NOTE ── */
      .ss-method-note{
        max-width:920px;margin:1.25rem auto 0;padding:0.85rem 1.1rem;
        background:#ebf2fb;border:1px solid #cbdcf2;border-left:3px solid #1a56a0;
        border-radius:6px;font-size:0.82rem;color:#1e3a5f;line-height:1.6;
      }
      .ss-method-note strong{color:#0a1628}

      /* ── SOURCES + ARTIFACT ── */
      .ss-refs{max-width:920px;margin:1.5rem auto 0;padding:0 1rem}
      .ss-refs-inner{
        display:grid;grid-template-columns:1.6fr 1fr;gap:1.25rem;
        background:#fff;border:1px solid #e2ddd5;border-radius:8px;padding:1.4rem 1.6rem;
      }
      .ss-refs-block h4{
        font-size:0.7rem;letter-spacing:0.12em;text-transform:uppercase;
        color:#64748b;font-weight:700;margin-bottom:0.7rem;
      }
      .ss-refs-block ul{margin:0;padding-left:1.1rem}
      .ss-refs-block li{font-size:0.85rem;color:#334155;margin-bottom:0.35rem;line-height:1.5}
      .ss-refs-block a{color:#1a56a0;text-decoration:none}
      .ss-refs-block a:hover{text-decoration:underline}
      .ss-refs-artifact{border-left:1px solid #f1f5f9;padding-left:1.25rem}
      .ss-artifact-btn{
        display:inline-flex;align-items:center;gap:0.5rem;
        background:#0a1628;color:#e8c97a;text-decoration:none;
        padding:0.6rem 1rem;border-radius:4px;font-size:0.8rem;font-weight:600;
        transition:background 0.2s,transform 0.15s;
      }
      .ss-artifact-btn:hover{background:#1c3060;transform:translateY(-1px)}
      @media(max-width:680px){.ss-refs-inner{grid-template-columns:1fr}.ss-refs-artifact{border-left:none;padding-left:0;border-top:1px solid #f1f5f9;padding-top:1rem}}

      /* ── MOBILE (≤ 600px) ── */
      @media(max-width:600px){
        .ss-nav{padding:0 1rem;height:52px}
        .ss-logo-sub{display:none}
        .ss-breadcrumb{display:none}
        .ss-nav-right{gap:0.5rem}
        .ss-score-pill{font-size:10px;padding:4px 10px;min-width:64px;letter-spacing:0.03em}
        .ss-back-btn{padding:5px 10px;font-size:10px;letter-spacing:0}
        .ss-module-banner{padding:4px 1rem}
        .ss-container{padding:1.25rem 1rem}
        .ss-hero{padding:1.5rem 1.25rem}
        .ss-hero h2{font-size:1.3rem}
        .ss-hero p{font-size:0.85rem}
        .ss-card-hd{padding:0.75rem 1rem}
        .ss-card-bd{padding:1rem}
        .ss-btn{padding:0.7rem 1rem;font-size:13px;min-height:44px}
        .ss-radio{padding:0.75rem 0.9rem}
        .ss-refs{padding:0}
        .ss-refs-inner{padding:1rem}
        .ss-shell-footer{padding:12px 1rem;flex-direction:column;gap:6px;text-align:center}
      }
      @media(max-width:380px){
        .ss-score-pill{display:none}
      }
    `;
    document.head.appendChild(s);

    // Font Awesome
    if (!document.querySelector('link[href*="font-awesome"]')) {
      const fa = document.createElement('link');
      fa.rel = 'stylesheet';
      fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
      document.head.appendChild(fa);
    }
  },

  _renderShell() {
    const article = this.cfg.article || '';

    // Top micro-bar
    const topbar = document.createElement('div');
    topbar.className = 'ss-topbar';
    topbar.textContent = 'Deepak N — Privacy & GDPR Portfolio  ·  Interactive Walkthrough  ·  Fictional HealthBridge scenario';
    document.body.prepend(topbar);

    // Main nav
    const nav = document.createElement('nav');
    nav.className = 'ss-nav';
    nav.innerHTML = `
      <div class="ss-nav-left">
        <div style="display:flex;align-items:center;gap:10px">
          <div class="ss-logo-mark">DN</div>
          <div>
            <div class="ss-logo-text">Deepak N</div>
            <div class="ss-logo-sub">Privacy &amp; GDPR Portfolio</div>
          </div>
        </div>
        <div class="ss-breadcrumb">
          <a href="../../portfolio.html" class="ss-breadcrumb-home">Portfolio</a>
          <span class="ss-breadcrumb-sep">›</span>
          <span class="ss-breadcrumb-current">${this.cfg.title}</span>
        </div>
      </div>
      <div class="ss-nav-right">
        <div class="ss-score-pill" id="ss-score-pill">Self-check: ${this.score}</div>
        <a href="../../portfolio.html" class="ss-back-btn">
          <i class="fa-solid fa-arrow-left"></i> Portfolio
        </a>
      </div>`;
    document.body.insertBefore(nav, document.body.children[1]);

    // Methodology note
    const note = document.createElement('div');
    note.className = 'ss-method-note';
    note.innerHTML = `<i class="fa-solid fa-circle-info" style="margin-right:0.5rem;color:#1a56a0"></i>
      Built as a personal learning exercise applying <strong>${article || 'GDPR'}</strong>. Uses a fictional UK
      telehealth scenario (HealthBridge Solutions). Not a production tool.`;
    document.body.insertBefore(note, document.body.children[2]);

    // Sources + downloadable artifact (rendered once, persists below the app)
    const refs = document.createElement('div');
    refs.className = 'ss-refs';
    const sources = (this.cfg.sources || []).map(s =>
      `<li><a href="${s.href}" target="_blank" rel="noopener">${s.label}</a></li>`).join('');
    const artifact = this.cfg.artifact
      ? `<a class="ss-artifact-btn" href="${this.cfg.artifact.href}" download>
           <i class="fa-solid fa-download"></i> ${this.cfg.artifact.label}
         </a>`
      : '';
    refs.innerHTML = `
      <div class="ss-refs-inner">
        <div class="ss-refs-block">
          <h4>Sources &amp; Guidance</h4>
          <ul>${sources || '<li>ICO / EDPB guidance — references to be added.</li>'}</ul>
        </div>
        <div class="ss-refs-block ss-refs-artifact">
          <h4>Downloadable Worksheet</h4>
          ${artifact || '<span style="font-size:0.8rem;color:#64748b">Artifact file to be added.</span>'}
          <div style="font-size:0.72rem;color:#94a3b8;margin-top:0.5rem">Placeholder file — anonymised for portfolio use.</div>
        </div>
      </div>`;
    document.body.appendChild(refs);

    // Footer
    const footer = document.createElement('footer');
    footer.className = 'ss-shell-footer';
    footer.innerHTML = `
      <div class="ss-shell-footer-brand">${this.cfg.title} · Personal learning walkthrough</div>
      <div class="ss-shell-footer-brand">Deepak N — Privacy &amp; GDPR Portfolio · All scenarios are fictional</div>`;
    document.body.appendChild(footer);
  },

  _bindEvents() {
    // Hints are always available in these learning walkthroughs.
    this.mode = 'learning';
  },

  updateScore(delta) {
    this.score = Math.min(100, Math.max(0, this.score + delta));
    const pill = document.getElementById('ss-score-pill');
    if (pill) pill.textContent = 'Self-check: ' + this.score;
  },

  showHints() {
    if (this.mode === 'learning') {
      document.querySelectorAll('.ss-hint').forEach(h => h.classList.add('visible'));
    }
  }
};
