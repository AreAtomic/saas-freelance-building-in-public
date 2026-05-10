import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, '..');
const bundlePath = path.join(__dirname, 'spec-viewer.bundle.js');

const spec = JSON.parse(
  fs.readFileSync(path.join(dir, 'gestionnaire-contrats-freelance-spec.json'), 'utf8'),
);
const embedded = JSON.stringify(spec).replace(/</g, '\\u003c');
const viewerBundle = fs.readFileSync(bundlePath, 'utf8');

const css = `
:root{
  --bg:#08080f;
  --bg2:#0e0e18;
  --surface:#151522;
  --surface2:#1c1c2e;
  --border:#2e2e45;
  --text:#ececf4;
  --muted:#9393b8;
  --dim:#5c5c7a;
  --accent:#d4a24c;
  --accent2:#5eead4;
  --violet:#a78bfa;
  --rose:#fb7185;
  --radius:14px;
  --rsm:10px;
}
*{box-sizing:border-box}
body{
  margin:0;
  background:var(--bg);
  background-image:radial-gradient(ellipse 120% 80% at 10% -20%,rgba(167,139,250,.09),transparent 55%),
                   radial-gradient(ellipse 90% 50% at 100% 0%,rgba(212,162,76,.06),transparent 45%);
  color:var(--text);
  font:15px/1.58 'Segoe UI',system-ui,sans-serif;
  min-height:100vh;
}
.app-header{padding:26px 28px 22px;border-bottom:1px solid var(--border);background:rgba(21,21,34,.92);backdrop-filter:blur(12px)}
h1{font-size:clamp(18px,2.2vw,22px);font-weight:670;margin:0 0 8px;letter-spacing:-.02em}
.sub{color:var(--muted);font-size:14px;line-height:1.45}
.hint{margin:12px 0 0;font-size:13px;color:var(--dim);max-width:72ch}
.mono{font-family:ui-monospace,'Cascadia Code',Consolas,monospace;font-size:.92em}

.tabs{display:flex;flex-wrap:wrap;gap:6px;padding:12px 24px;background:var(--bg2);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:30}
.tabs button{
  font:inherit;font-size:13px;font-weight:550;border:1px solid var(--border);background:var(--surface);color:var(--muted);
  padding:8px 16px;border-radius:999px;cursor:pointer;transition:background .15s,color .15s,border-color .15s;
}
.tabs button:hover{border-color:var(--dim);color:var(--text)}
.tabs button.on{background:linear-gradient(135deg,rgba(167,139,250,.22),rgba(212,162,76,.14));border-color:rgba(167,139,250,.35);color:var(--text)}

main{max-width:min(1120px,96vw);margin:0 auto;padding:22px 20px 48px}

section[data-tab-pane]{display:none}
section[data-tab-pane].on{display:block}

.sec-head{display:flex;flex-wrap:wrap;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid var(--border)}
.sec-head h2{font-size:11px;text-transform:uppercase;letter-spacing:.12em;color:var(--dim);margin:6px 0 0;font-weight:650}

.view-toolbar{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin-bottom:18px}
.view-toolbar .seg{display:flex;border:1px solid var(--border);border-radius:999px;overflow:hidden;background:var(--surface)}
.view-toolbar .seg button{
  font:inherit;font-size:12px;font-weight:600;border:none;background:transparent;color:var(--muted);
  padding:7px 16px;cursor:pointer;
}
.view-toolbar .seg button.on{background:var(--surface2);color:var(--text)}
.btn-copy{font:inherit;font-size:12px;font-weight:600;padding:7px 14px;border-radius:999px;border:1px solid var(--border);background:transparent;color:var(--muted);cursor:pointer}
.btn-copy:hover{color:var(--accent);border-color:rgba(212,162,76,.35)}

.pane-json{display:none;margin:0;padding:16px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);
  font-size:11px;line-height:1.45;overflow:auto;max-height:min(76vh,900px);white-space:pre;word-break:break-word;color:#b8b8d8}
.pane-json.show{display:block}
.pane-human.hidden{display:none}

/* —— CDC —— */
.hero-card{
  border:1px solid var(--border);border-radius:var(--radius);padding:22px 24px;background:linear-gradient(145deg,var(--surface),var(--surface2));
  margin-bottom:22px;
}
.hero-badge{display:inline-block;font-size:10px;font-weight:800;letter-spacing:.14em;color:var(--accent);margin-bottom:8px}
.hero-title{font-size:22px;font-weight:710;margin:0 0 10px;line-height:1.25;color:var(--text)}
.hero-note{font-size:13px;color:var(--muted);margin:0 0 16px;line-height:1.45}
.kv-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px}
.kv{font-size:12px;background:rgba(0,0,0,.2);padding:10px 12px;border-radius:var(--rsm);border:1px solid var(--border)}
.kv .k{display:block;font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:var(--dim);margin-bottom:4px}
.kv .v{color:var(--text);font-weight:600}

.prose-grid{display:grid;gap:14px;margin-bottom:22px}
@media(min-width:800px){.prose-grid{grid-template-columns:1fr 1fr}.prose-wide{grid-column:1/-1}}
.prose-card{border:1px solid var(--border);border-radius:var(--radius);padding:18px;background:var(--surface)}
.prose-card p{margin:8px 0 0;line-height:1.55;color:#c9c9de}
.pill{display:inline-block;font-size:10px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;padding:4px 10px;border-radius:999px;margin-bottom:6px}
.pill-vision{background:rgba(167,139,250,.18);color:var(--violet)}
.pill-prob{background:rgba(251,113,133,.14);color:var(--rose)}
.pill-sol{background:rgba(94,234,212,.14);color:var(--accent2)}

.two-col{display:grid;gap:14px;margin:18px 0}
@media(min-width:720px){.two-col{grid-template-columns:1fr 1fr}}

.list-card{border-radius:var(--radius);padding:18px;border:1px solid var(--border);background:var(--surface)}
.list-card-hd{font-size:13px;font-weight:700;margin-bottom:10px;display:flex;align-items:center;gap:10px;color:var(--text)}
.list-ico{opacity:.8}
.checklist{margin:0;padding-left:22px;line-height:1.55;color:#c5c5d8;font-size:14px}
.checklist li{margin:6px 0}
.tone-in{border-left:3px solid rgba(94,234,212,.65)}
.tone-out{border-left:3px solid var(--rose)}
.tone-ctr{border-left:3px solid rgba(212,162,76,.65)}

.viz-table{width:100%;border-collapse:collapse;font-size:13px;margin:8px 0 20px;background:var(--surface);border-radius:var(--radius);overflow:hidden;border:1px solid var(--border)}
.viz-table th{text-align:left;padding:10px 14px;background:var(--surface2);color:var(--dim);font-size:10px;text-transform:uppercase;letter-spacing:.08em;font-weight:700}
.viz-table td{padding:11px 14px;border-top:1px solid var(--border);vertical-align:top}
.viz-table .muted{color:var(--muted)}

.block-title{font-size:11px;text-transform:uppercase;letter-spacing:.12em;color:var(--dim);font-weight:700;margin:24px 0 10px}

/* —— Matrice —— */
.matrice-intro{color:var(--muted);margin:0 0 22px;line-height:1.55;font-size:14px;max-width:78ch}

.axes-ribbon{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px}
.axe-chip{font-size:11px;font-weight:700;padding:6px 12px;border-radius:999px;border:1px solid var(--border);background:rgba(255,255,255,.03)}
.axe-chip.axe-cre{border-color:rgba(94,234,212,.35);background:rgba(94,234,212,.06)}
.axe-chip.axe-mod{border-color:rgba(96,165,250,.35);background:rgba(96,165,250,.06)}
.axe-chip.axe-vis{border-color:rgba(167,139,250,.35);background:rgba(167,139,250,.06)}
.axe-chip.axe-prt{border-color:rgba(212,162,76,.35);background:rgba(212,162,76,.06)}
.axe-chip.axe-rgl{border-color:rgba(244,114,182,.3);background:rgba(244,114,182,.05)}
.axe-chip.axe-alt{border-color:rgba(251,146,60,.35);background:rgba(251,146,60,.06)}
.axe-chip.axe-pcv{border-color:rgba(34,211,238,.3);background:rgba(34,211,238,.05)}
.axe-chip.axe-bil{border-color:rgba(250,204,21,.35);background:rgba(250,204,21,.06)}
.axe-chip.axe-sec{border-color:rgba(248,113,113,.35);background:rgba(248,113,113,.06)}
.axe-chip.axe-def{color:var(--muted)}

.bloc-visual{border:1px solid var(--border);border-radius:var(--radius);margin-bottom:20px;background:linear-gradient(180deg,var(--surface),rgba(255,255,255,.015));overflow:hidden}
.bloc-visual-hd{padding:20px 22px;background:rgba(167,139,250,.06);border-bottom:1px solid var(--border)}
.bloc-id-tag{font-size:11px;color:var(--violet)}
.bloc-visual-hd h3{font-size:17px;font-weight:685;margin:8px 0 8px;line-height:1.35;color:var(--text)}
.bloc-resume{margin:0;font-size:13px;line-height:1.5;color:var(--muted)}

.sf-grid{display:grid;gap:12px;padding:16px 18px 20px}
@media(min-width:900px){.sf-grid{grid-template-columns:1fr 1fr}}

.sf-card{border:1px solid var(--border);border-radius:var(--rsm);padding:14px 15px;background:var(--surface2);transition:border-color .15s,transform .15s}
.sf-card:hover{border-color:rgba(167,139,250,.35);transform:translateY(-2px)}
.sf-hd{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-bottom:8px}
.sf-id{font-size:10px;color:var(--dim)}
.sf-title{font-size:14px;font-weight:638;margin:0 0 6px;line-height:1.4;color:var(--text)}
.sf-desc{font-size:12px;line-height:1.5;color:var(--muted);margin:0}
.sf-ft{margin-top:10px;font-size:11px;color:var(--dim)}
.sf-ft code{font-size:10px;background:rgba(0,0,0,.35);padding:2px 6px;border-radius:4px}

.axe-tag{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;padding:4px 9px;border-radius:6px;background:rgba(255,255,255,.04);border:1px solid var(--border)}
.axe-tag.axe-cre{border-color:rgba(94,234,212,.4);color:#5eead4}
.axe-tag.axe-mod{border-color:rgba(96,165,250,.4);color:#93c5fd}
.axe-tag.axe-vis{border-color:rgba(167,139,250,.45);color:#c4b5fd}
.axe-tag.axe-sup{border-color:rgba(248,113,113,.35);color:#fca5a5}
.axe-tag.axe-prt{border-color:rgba(212,162,76,.4);color:var(--accent)}
.axe-tag.axe-rgl{border-color:rgba(244,114,182,.35);color:#f9a8d4}
.axe-tag.axe-alt{border-color:rgba(251,146,60,.4);color:#fdba74}
.axe-tag.axe-pcv{border-color:rgba(34,211,238,.4);color:#67e8f9}
.axe-tag.axe-bil{border-color:rgba(250,204,21,.35);color:#fde047}
.axe-tag.axe-sec{border-color:rgba(248,113,113,.4);color:#fca5a5}
.axe-tag.axe-def{color:var(--muted)}
.moscow-tag{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;padding:4px 9px;border-radius:6px;border:1px solid transparent}
.moscow-must{background:rgba(212,162,76,.22);color:var(--accent)}
.moscow-should{background:rgba(96,165,250,.22);color:#93c5fd}
.moscow-could{background:rgba(148,163,184,.14);color:#94a3b8}
.moscow-wont{background:rgba(239,68,68,.14);color:#fca5a5}

.cx-tag{font-size:10px;color:var(--dim);margin-left:auto}
.stars .star{font-size:9px;opacity:.25;color:var(--accent)}
.stars .star.on{opacity:1}

/* Personas */
.persona-stack{display:flex;flex-direction:column;gap:20px}
.persona-card{border:1px solid var(--border);border-radius:var(--radius);padding:22px;background:var(--surface)}
.persona-card header{border-bottom:1px solid var(--border);padding-bottom:14px;margin-bottom:16px}
.persona-id{font-size:11px;color:var(--violet);font-weight:800;margin-right:8px}
.persona-card h3{font-size:20px;margin:6px 0 4px}
.persona-role{color:var(--muted);font-size:14px}
.canal-row{margin-top:10px;display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.canal-badge{font-size:11px;padding:5px 10px;border-radius:999px;background:var(--surface2);border:1px solid var(--border)}
.tech-level{font-size:12px;color:var(--muted);margin-left:auto}
.persona-three{display:grid;gap:14px;margin-top:14px}
@media(min-width:800px){.persona-three{grid-template-columns:repeat(3,1fr)}}
.mini-lbl{font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:var(--dim);font-weight:700;display:block;margin-bottom:4px}
.scenario-flow{list-style:none;padding:0;margin:10px 0 0;display:flex;flex-direction:column;gap:12px}
.scenario-flow li{display:grid;grid-template-columns:auto 1fr;gap:10px;font-size:13px;line-height:1.45;background:var(--surface2);padding:11px 14px;border-radius:var(--rsm);border:1px solid var(--border)}
.sc-step{font-weight:800;color:var(--accent)}
.sc-res{font-size:12px;display:block;margin-top:2px}

/* User stories */
.us-stack{display:flex;flex-direction:column;gap:16px}
.us-card{border-radius:var(--radius);padding:18px 20px;border:1px solid var(--border);background:var(--surface)}
.us-card.stripe-moscow-must{border-left:4px solid var(--accent)}
.us-card.stripe-moscow-should{border-left:4px solid #93c5fd}
.us-card.stripe-moscow-could{border-left:4px solid #94a3b8}
.us-card.stripe-moscow-wont{border-left:4px solid #fca5a5}
.us-top{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-bottom:8px}
.us-id{color:var(--dim);font-size:11px}
.us-card h4{font-size:16px;margin:0 0 10px;line-height:1.35;font-weight:650}
.cx-pill{font-size:10px;color:var(--dim)}
.us-story{font-size:14px;line-height:1.55;color:#c8c8dd;margin:0;padding:14px 16px;border-radius:var(--rsm);background:rgba(0,0,0,.28);border:1px solid var(--border);border-left:3px solid var(--violet)}
.crit-list{margin:8px 0 0;font-size:13px;line-height:1.5;padding-left:20px;color:#bdc0d4}
.us-deps{font-size:12px;margin-top:12px;color:var(--dim)}
.us-deps code{font-size:11px;background:rgba(0,0,0,.35);padding:2px 6px;border-radius:4px;margin-right:6px}

/* Diagrammes */
.diag-stack{display:flex;flex-direction:column;gap:18px}
.diag-card{border:1px solid var(--border);border-radius:var(--radius);padding:18px;background:var(--surface)}
.diag-hd{display:flex;align-items:center;gap:10px;margin-bottom:8px}
.diag-f{font-size:11px;color:var(--violet)}
.actor-pill{font-size:11px;padding:5px 10px;background:var(--surface2);border-radius:999px;border:1px solid var(--border)}
.diag-trig{font-size:15px;line-height:1.5;margin:0 0 16px;color:var(--text)}
.flow-track{display:flex;flex-direction:column;gap:0;border-left:2px dashed rgba(167,139,250,.35);margin-left:8px;padding-left:16px}
.flow-step{display:flex;gap:14px;padding:11px 0}
.flow-num{font-size:13px;color:var(--accent);font-weight:800;width:28px;flex-shrink:0}
.flow-type{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:var(--dim);display:block}
.flow-etape{font-size:14px;line-height:1.45;color:var(--text);margin-top:2px}
.branch{font-size:12px;margin-top:4px}
.grid-2-small{display:grid;gap:10px;margin-top:14px}
@media(min-width:640px){.grid-2-small{grid-template-columns:1fr 1fr}}
.side-list{margin:10px 0;font-size:13px;line-height:1.5;padding-left:20px;color:#bdc0d4}

/* Technique */
.ctx-grid{display:grid;gap:14px;margin-bottom:20px}
@media(min-width:760px){.ctx-grid{grid-template-columns:repeat(2,1fr)}}
.ctx-card{border:1px solid var(--border);border-radius:var(--rsm);padding:16px;background:var(--surface2)}
.ctx-card h4{margin:0 0 6px;font-size:14px;color:var(--text)}
.ctx-meta{font-size:12px;margin-top:10px;display:flex;flex-direction:column;gap:4px}
.ctx-meta span{color:var(--dim)}
.fe-track{border:1px solid var(--border);border-radius:var(--radius);padding:14px;background:var(--surface)}
.fe-step{display:flex;align-items:baseline;gap:12px;padding:10px 8px;border-bottom:1px solid var(--border);font-size:13px;line-height:1.45}
.fe-step:last-child{border-bottom:none}
.fe-num{font-weight:900;color:var(--accent);min-width:22px;font-size:12px}
.fe-type{font-size:10px;color:var(--violet);text-transform:uppercase;font-weight:800;min-width:72px}

/* UX util */
.onb-flow{display:flex;flex-direction:column;gap:10px;margin-bottom:20px}
.onb-card{display:flex;gap:16px;padding:14px;border:1px solid var(--border);border-radius:var(--rsm);background:var(--surface)}
.onb-num{font-weight:900;font-size:22px;line-height:1;color:var(--accent);opacity:.75;min-width:36px;text-align:center}
.parc-grid{display:grid;gap:12px;margin-bottom:20px}
@media(min-width:640px){.parc-grid{grid-template-columns:repeat(2,1fr)}}
.parc-card{border:1px solid var(--border);padding:14px;border-radius:var(--rsm);background:var(--surface2)}
.parc-card ol{margin:8px 0 0;font-size:13px;line-height:1.5;padding-left:18px;color:#bdc0d4}
.messages-tbl{font-size:13px}

/* POC */
.poc-cards{display:grid;gap:14px}
@media(min-width:700px){.poc-cards{grid-template-columns:1fr 1fr 1fr}}
.poc-mini{border:1px solid var(--border);border-radius:var(--radius);padding:18px;background:var(--surface)}
.file-row{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
.file-chip{font-size:11px;display:inline-block;margin:4px 4px 0 0}
.us-chip{font-size:11px;padding:6px 10px;border-radius:999px;margin:4px 4px 0 0;display:inline-block;background:var(--surface2);border:1px solid var(--border)}
.us-chip.ok{border-color:rgba(94,234,212,.35);color:#5eead4}
.us-chip.todo{border-color:rgba(251,146,60,.35);color:#fb923c}
.poc-mini.align{align-self:start}

/* Infra dual-track */
.viz-infra{margin-bottom:8px}
.infra-lead{font-size:15px;color:var(--muted);max-width:78ch;line-height:1.55;margin:0 0 20px}
.infra-rule-wrap{margin-bottom:22px}
.infra-rule-card{border:1px solid var(--border);border-radius:var(--radius);padding:18px 22px;background:linear-gradient(135deg,rgba(167,139,250,.07),transparent 42%),var(--surface)}
.infra-rule-card h4{margin:0 0 12px;font-size:15px;font-weight:650;letter-spacing:-.015em}
.infra-accent{color:var(--accent2);font-weight:750}
.infra-res-ol{margin:0;padding-left:20px;font-size:13px;line-height:1.55;color:#c8cad8}
.infra-res-ol li{margin-bottom:6px}
.infra-poc-ref{margin:14px 0 0;font-size:12px}
.infra-poc-ref code{font-size:11px;color:var(--accent2)}
.infra-grid{display:grid;gap:18px;margin-top:10px}
@media(min-width:900px){.infra-grid{grid-template-columns:1fr 1fr;align-items:start}}
.infra-phase-card{border:1px solid var(--border);border-radius:var(--radius);padding:18px 20px;background:var(--surface2);min-height:100%}
.infra-mvp{border-top:3px solid rgba(94,234,212,.52)}
.infra-v2{border-top:3px solid rgba(167,139,250,.52)}
.infra-phase-head h4{margin:0 0 10px;font-size:14px;font-weight:760;letter-spacing:-.01em}
.infra-obj{margin:0 0 14px;font-size:13px;line-height:1.5}
.infra-sub{font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:var(--dim);margin:14px 0 7px;font-weight:700}
.infra-bullet{margin:0 0 0 18px;padding:0;font-size:13px;line-height:1.5;color:#bdc0d4}
.infra-bullet li{margin-bottom:6px}
.infra-hors{margin-top:12px;margin-bottom:4px}
.infra-chip-row{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.infra-ban-chip{font-size:10px;padding:5px 9px;border-radius:8px;background:rgba(251,146,60,.1);border:1px solid rgba(251,146,60,.26);color:#fdba74}
.infra-mini-stack{font-size:12px;margin-top:4px}
.infra-mini-stack th{font-size:10px;text-transform:uppercase;letter-spacing:.06em}
.infra-mini-stack td{vertical-align:top;padding:8px 10px}
.infra-foot{margin-top:14px;font-size:12px;line-height:1.45;border-top:1px solid var(--border);padding-top:12px}

/* Vue complète */
.overview-lead{font-size:15px;color:var(--muted);max-width:72ch;line-height:1.55;margin:0 0 22px}

.stat-bar{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:12px;margin-bottom:22px}
.stat-item{border:1px solid var(--border);border-radius:var(--radius);padding:14px;text-align:center;background:var(--surface)}
.stat-num{font-size:22px;font-weight:800;display:block;color:var(--accent);letter-spacing:-.02em}
.stat-lbl{font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:var(--dim);margin-top:4px;display:block}

.anchor-block{margin-bottom:42px;padding-top:8px;border-top:1px solid var(--border)}
.ov-title{font-size:12px;text-transform:uppercase;letter-spacing:.14em;color:var(--violet);margin:0 0 16px;font-weight:750}

.err{background:#391c1f;color:#fecaca;padding:14px;margin:14px;border-radius:var(--rsm)}
.empty{color:var(--dim);padding:28px;text-align:center}
footer{padding:8px 20px 32px;color:var(--dim);font-size:12px;max-width:min(1120px,96vw);margin:0 auto;text-align:center}

@media print{.tabs,.view-toolbar{display:none!important}section{display:block!important}.pane-json{display:none!important}.pane-human.hidden{display:block!important}}
`;

const bootstrap = `
(function(){
var SPEC = JSON.parse(document.getElementById('embedded-spec').textContent);
var V = window.SpecViewer;

function pick(id){
  switch(id){
    case 'cdc': return { project: SPEC.project, cahier_des_charges: SPEC.cahier_des_charges };
    case 'matrice': return { matrice_axes: SPEC.matrice_axes, matrice_fonctionnalites_detaillee: SPEC.matrice_fonctionnalites_detaillee };
    case 'personas': return { personas: SPEC.personas };
    case 'us': return { user_stories: SPEC.user_stories };
    case 'flux': return { diagrammes_utilisation: SPEC.diagrammes_utilisation };
    case 'infra': return { infra_phases: SPEC.infra_phases };
    case 'tech': return { spec_technique: SPEC.spec_technique };
    case 'ux': return { spec_utilisateur: SPEC.spec_utilisateur };
    case 'poc': return { poc_tracking: SPEC.poc_tracking };
    case 'all': return SPEC;
    default: return {};
  }
}

function renderHuman(id){
  switch(id){
    case 'cdc': return V.renderCDC(SPEC);
    case 'matrice': return V.renderMatrice(SPEC);
    case 'personas': return V.renderPersonas(SPEC);
    case 'us': return V.renderUS(SPEC);
    case 'flux': return V.renderDiagrammes(SPEC);
    case 'infra': return V.renderInfra(SPEC);
    case 'tech': return V.renderTech(SPEC);
    case 'ux': return V.renderUX(SPEC);
    case 'poc': return V.renderPOC(SPEC);
    case 'all': return V.renderOverview(SPEC);
    default: return '';
  }
}

var tabs = [
  { id:'cdc', label:'Projet & CDC' },
  { id:'matrice', label:'Matrice' },
  { id:'personas', label:'Personas' },
  { id:'us', label:'User stories' },
  { id:'flux', label:'Diagrammes' },
  { id:'infra', label:'Infra' },
  { id:'tech', label:'Tech' },
  { id:'ux', label:'UX' },
  { id:'poc', label:'POC' },
  { id:'all', label:'Vue complète' }
];

var nav = document.getElementById('tabnav');
var main = document.getElementById('mainpanes');

tabs.forEach(function(t, idx){
  var b = document.createElement('button');
  b.type = 'button';
  b.dataset.tab = t.id;
  b.textContent = t.label;
  if(idx===0) b.classList.add('on');
  nav.appendChild(b);

  var sec = document.createElement('section');
  sec.dataset.tabPane = t.id;
  sec.className = idx===0 ? 'on' : '';
  sec.innerHTML =
    '<div class="sec-head"><h2>'+escHtml(t.label)+' — contenu intégral</h2></div>'+
    '<div class="view-toolbar">'+
      '<div class="seg" role="group">'+
        '<button type="button" class="on" data-mode="human" data-for="'+escAttr(t.id)+'">Vue lecture</button>'+
        '<button type="button" data-mode="json" data-for="'+escAttr(t.id)+'">JSON brut</button>'+
      '</div>'+
      '<button type="button" class="btn-copy" data-copy="'+escAttr(t.id)+'">Copier le JSON</button>'+
    '</div>'+
    '<div class="pane-human" id="visual-'+escAttr(t.id)+'"></div>'+
    '<pre class="pane-json" id="json-'+escAttr(t.id)+'"></pre>';
  main.appendChild(sec);
});

function escHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function escAttr(s){ return String(s||'').replace(/"/g,'&quot;'); }

function fillPane(id){
  var v = document.getElementById('visual-'+id);
  var j = document.getElementById('json-'+id);
  if(v) v.innerHTML = renderHuman(id);
  if(j) j.textContent = JSON.stringify(pick(id), null, 2);
}

tabs.forEach(function(t){ fillPane(t.id); });

nav.addEventListener('click', function(ev){
  var btn = ev.target.closest('button[data-tab]');
  if(!btn) return;
  var id = btn.dataset.tab;
  nav.querySelectorAll('button').forEach(function(el){ el.classList.toggle('on', el.dataset.tab===id); });
  main.querySelectorAll('section').forEach(function(s){
    s.classList.toggle('on', s.dataset.tabPane===id);
  });
});

main.addEventListener('click', function(ev){
  var modeBtn = ev.target.closest('button[data-mode]');
  if(modeBtn){
    var fid = modeBtn.dataset.for;
    var seg = modeBtn.closest('.seg');
    if(seg) seg.querySelectorAll('button').forEach(function(b){ b.classList.toggle('on', b===modeBtn); });
    var human = document.getElementById('visual-'+fid);
    var json = document.getElementById('json-'+fid);
    var jsonMode = modeBtn.dataset.mode === 'json';
    if(human){ human.classList.toggle('hidden', jsonMode); }
    if(json){ json.classList.toggle('show', jsonMode); }
    return;
  }

  var copyBtn = ev.target.closest('button[data-copy]');
  if(!copyBtn) return;
  var id = copyBtn.dataset.copy;
  var text = JSON.stringify(pick(id), null, 2);
  function done(){ copyBtn.textContent = 'Copié !'; setTimeout(function(){ copyBtn.textContent = 'Copier le JSON'; }, 1600); }
  if(navigator.clipboard && navigator.clipboard.writeText)
    navigator.clipboard.writeText(text).then(done).catch(function(){});
  else {
    var ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); } catch(e){}
    document.body.removeChild(ta);
  }
});
})();`;

const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Spec — Gestionnaire Contrats Freelance</title>
  <style>${css}</style>
</head>
<body>
<header class="app-header">
  <h1>Gestionnaire de Contrats Freelance</h1>
  <div class="sub">Spec produit en <strong>vue lecture</strong> — toutes les données viennent du JSON embarqué (aucune perte). Basculez sur <em>JSON brut</em> pour copier-coller ou diff.</div>
  <p class="hint">Pour resynchroniser : <span class="mono">node scripts/build-spec-html.mjs</span> depuis le dossier <span class="mono">crm-freelance/</span>.</p>
</header>
<nav class="tabs" id="tabnav" role="tablist"></nav>
<main id="mainpanes"></main>

<script type="application/json" id="embedded-spec">${embedded}</script>
<script>${viewerBundle}</script>
<script>${bootstrap}<\/script>
<footer><span class="mono">gestionnaire-contrats-freelance-spec.html</span> — généré par <span class="mono">build-spec-html.mjs</span></footer>
</body>
</html>`;

const out = path.join(dir, 'gestionnaire-contrats-freelance-spec.html');
fs.writeFileSync(out, html, 'utf8');
console.log('OK →', out);
