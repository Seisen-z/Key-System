import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

/* ── Landing mockup data ── */
const MOCK_ACCOUNTS = [
  { initial: 'S', name: 'SeisenMain',   time: 'active now', live: true  },
  { initial: 'R', name: 'RobloxAlt01',  time: '2h ago',     live: false },
  { initial: 'P', name: 'PlayerTwo',    time: '5h ago',     live: false },
  { initial: 'T', name: 'TestAccount',  time: '1d ago',     live: false },
]

/* ── Demo accounts ── */
const INITIAL_DEMO_ACCOUNTS = [
  { id: 1, init: 'S', name: 'SeisenMain',  display: 'SeisenMain',  status: 'Valid',   fav: true,  lastLaunched: 'Dec 28, 10:30 AM', game: 'Blox Fruits', tags: ['main'] },
  { id: 2, init: 'R', name: 'RobloxAlt01', display: 'RobloxAlt01', status: 'Valid',   fav: false, lastLaunched: 'Dec 27, 2:14 PM',  game: 'Adopt Me!',   tags: [] },
  { id: 3, init: 'P', name: 'PlayerTwo',   display: 'PlayerTwo',   status: 'Expired', fav: false, lastLaunched: 'Dec 25, 8:45 AM',  game: '',            tags: ['alt'] },
  { id: 4, init: 'T', name: 'TestAccount', display: 'TestAccount', status: 'Unknown', fav: false, lastLaunched: 'Never',            game: '',            tags: ['test'] },
]

/* ── Demo app color tokens (matching actual app index.css) ── */
const C = {
  bg:      '#07080a',
  surface: '#0e0f13',
  surf2:   '#141519',
  surf3:   '#1a1b22',
  bd:      'rgba(255,255,255,0.06)',
  bdm:     'rgba(255,255,255,0.10)',
  t1:      '#F0F1F6',
  t2:      '#8B8FA8',
  t3:      '#4B4E64',
  green:   '#34D399',
  amber:   '#FBBF24',
  purple:  '#A78BFA',
  blue:    '#60A5FA',
  red:     '#F87171',
  acc:     '#E8E8E8',
  accText: '#0a0a0a',
}

/* ── Website CSS ── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:#F7F4F0}
.rp{font-family:'Inter',system-ui,-apple-system,sans-serif;background:#F7F4F0;color:#4A4540;min-height:100vh}
.nav{position:sticky;top:0;z-index:50;background:rgba(247,244,240,0.92);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom:1px solid #E5E1DB}
.nav-inner{max-width:1200px;margin:0 auto;padding:0 48px;height:56px;display:flex;align-items:center;justify-content:space-between}
@media(max-width:600px){.nav-inner{padding:0 20px}}
.nav-logo{font-family:'Syne',sans-serif;font-weight:800;font-size:19px;letter-spacing:-0.045em;color:#111110}
.nav-right{display:flex;align-items:center;gap:8px}
.nav-demo{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;background:transparent;color:#4A4540;font-family:'Inter',sans-serif;font-weight:600;font-size:12px;border:1px solid #D8D4CE;border-radius:7px;cursor:pointer;transition:background .15s,border-color .15s,color .15s}
.nav-demo:hover{background:#EEEAE5;border-color:#C5C0B8;color:#111110}
.nav-dl{display:inline-flex;align-items:center;gap:7px;padding:8px 16px;background:#111110;color:#F7F4F0;font-family:'Inter',sans-serif;font-weight:700;font-size:12px;border:none;border-radius:7px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.18);transition:box-shadow .18s,transform .12s,background .12s}
.nav-dl:hover{background:#2A2622;box-shadow:0 4px 16px rgba(0,0,0,.24);transform:translateY(-1px)}
.nav-dl:active{transform:translateY(0)}
.nav-dl:disabled{opacity:.4;cursor:not-allowed;transform:none}
.hero{max-width:1200px;margin:0 auto;padding:88px 48px 96px;display:grid;grid-template-columns:55fr 45fr;gap:48px;align-items:center}
@media(max-width:860px){.hero{grid-template-columns:1fr;padding:64px 20px 72px;gap:52px}.hero-right{order:-1}}
.hero-eyebrow{font-family:ui-monospace,'Cascadia Code',monospace;font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:#C5C0B8;margin-bottom:28px}
.hero-h1{font-family:'Syne',sans-serif;font-weight:800;line-height:.88;letter-spacing:-.05em;margin-bottom:32px;display:flex;flex-direction:column}
.hero-mark{font-size:clamp(72px,10vw,120px);color:#111110}
.hero-mark-sub{font-size:clamp(18px,2.2vw,26px);color:#9A958E;margin-top:10px;letter-spacing:-.03em}
.hero-desc{font-size:14.5px;line-height:1.75;color:#6A6560;max-width:400px;margin-bottom:40px}
.hero-actions{display:flex;flex-direction:column;gap:12px;align-items:flex-start}
.hero-btn{display:inline-flex;align-items:center;gap:9px;padding:14px 28px;background:#111110;color:#F7F4F0;font-family:'Inter',sans-serif;font-weight:700;font-size:14px;letter-spacing:-.01em;border:none;border-radius:9px;cursor:pointer;box-shadow:0 2px 16px rgba(0,0,0,.2);transition:box-shadow .2s,transform .14s,background .14s}
.hero-btn:hover{background:#2A2622;box-shadow:0 4px 24px rgba(0,0,0,.28);transform:translateY(-1px)}
.hero-btn:active{transform:translateY(0)}
.hero-btn:disabled{opacity:.4;cursor:not-allowed;transform:none;box-shadow:none}
.hero-meta{display:flex;align-items:center;gap:16px}
.hero-free{font-size:11px;font-weight:600;color:#9A958E;letter-spacing:.02em}
.hero-ver{font-family:ui-monospace,'Cascadia Code',monospace;font-size:10.5px;color:#C5C0B8}
.hero-right{position:relative}
.hero-right::before{content:'';position:absolute;inset:-40px;background:radial-gradient(ellipse at 60% 50%,rgba(17,17,16,.04) 0%,transparent 65%);pointer-events:none}
.accounts-panel{position:relative;z-index:1;background:#FFFFFF;border:1px solid #E5E1DB;border-radius:14px;overflow:hidden;user-select:none;box-shadow:0 4px 24px rgba(0,0,0,.07),0 1px 4px rgba(0,0,0,.05)}
.panel-top{display:flex;align-items:center;justify-content:space-between;padding:14px 18px 13px;border-bottom:1px solid #F0ECE7}
.panel-title{font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#C5C0B8}
.panel-count{font-family:ui-monospace,monospace;font-size:10px;color:#9A958E;background:#F7F4F0;padding:2px 8px;border-radius:4px}
.acc-row{display:flex;align-items:center;gap:11px;padding:10px 18px;border-bottom:1px solid #F7F4F0;cursor:default;transition:background .14s}
.acc-row:last-child{border-bottom:none}
.acc-row:hover{background:#FDFCFB}
.acc-dot{width:6px;height:6px;border-radius:50%;background:#E5E1DB;flex-shrink:0}
.acc-dot.live{background:#8A9478;box-shadow:0 0 5px rgba(138,148,120,.4)}
.acc-avatar{width:30px;height:30px;border-radius:7px;background:#F7F4F0;border:1px solid #E5E1DB;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#9A958E;flex-shrink:0}
.acc-name{font-size:12.5px;font-weight:600;color:#4A4540;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.acc-time{font-family:ui-monospace,monospace;font-size:10px;color:#C5C0B8;flex-shrink:0}
.acc-action{font-size:11px;font-weight:600;color:#111110;flex-shrink:0;opacity:0;transition:opacity .14s}
.acc-row:hover .acc-action{opacity:1}
.panel-fade{height:28px;background:linear-gradient(transparent,#FFFFFF);margin-top:-28px;position:relative}
.rule{height:1px;background:#EAE6E1}
.features{padding:88px 48px 80px;max-width:1200px;margin:0 auto}
@media(max-width:600px){.features{padding:64px 20px}}
.sec-label{font-family:ui-monospace,'Cascadia Code',monospace;font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#C5C0B8;margin-bottom:32px}
.bento{display:grid;grid-template-columns:repeat(12,1fr);gap:10px}
@media(max-width:700px){.bento{grid-template-columns:1fr 1fr}.bt{grid-column:span 1!important}}
@media(max-width:460px){.bento{grid-template-columns:1fr}}
.bt:nth-child(1){grid-column:span 7}
.bt:nth-child(2){grid-column:span 5}
.bt:nth-child(3){grid-column:span 5}
.bt:nth-child(4){grid-column:span 7}
.bt:nth-child(5){grid-column:span 4}
.bt:nth-child(6){grid-column:span 8}
.bt{background:#FFFFFF;border:1px solid #E5E1DB;border-radius:14px;padding:28px 26px 30px;display:flex;flex-direction:column;gap:12px;transition:border-color .18s,box-shadow .18s;box-shadow:0 1px 4px rgba(0,0,0,.04)}
.bt:hover{border-color:#D8D4CE;box-shadow:0 4px 16px rgba(0,0,0,.08)}
.bt-marker{width:20px;height:2px;background:#E5E1DB;border-radius:1px;transition:background .18s}
.bt:hover .bt-marker{background:#111110}
.bt-name{font-size:14px;font-weight:700;color:#2A2622;letter-spacing:-.01em;transition:color .18s}
.bt:hover .bt-name{color:#111110}
.bt-desc{font-size:12.5px;line-height:1.65;color:#9A958E}
.dl-strip{background:#111110;padding:80px 48px}
.dl-strip-inner{max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:40px;flex-wrap:wrap}
.dl-strip-left{display:flex;flex-direction:column;gap:10px}
.dl-strip-h{font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(24px,3.2vw,40px);letter-spacing:-.035em;line-height:1.1;color:#F7F4F0}
.dl-strip-sub{font-size:13px;color:#5A5550}
.dl-strip-btn{display:inline-flex;align-items:center;gap:10px;padding:16px 38px;background:#F7F4F0;color:#111110;font-family:'Inter',sans-serif;font-weight:700;font-size:14px;letter-spacing:-.01em;border:none;border-radius:10px;cursor:pointer;flex-shrink:0;box-shadow:0 2px 16px rgba(0,0,0,.3);transition:box-shadow .2s,transform .14s,background .14s}
.dl-strip-btn:hover{background:#EDE9E3;box-shadow:0 4px 28px rgba(0,0,0,.4);transform:translateY(-1px)}
.dl-strip-btn:active{transform:translateY(0)}
.dl-strip-btn:disabled{opacity:.4;cursor:not-allowed;transform:none}
.foot{padding:28px 48px 36px;max-width:1200px;margin:0 auto}
@media(max-width:600px){.foot{padding:28px 20px 36px}}
.foot-row{display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap;padding-bottom:20px;margin-bottom:20px;border-bottom:1px solid #EAE6E1}
.foot-logo{font-family:'Syne',sans-serif;font-weight:800;font-size:15px;letter-spacing:-.04em;color:#C5C0B8}
.foot-discord{display:inline-flex;align-items:center;gap:8px;font-size:12px;font-weight:600;color:#9A958E;text-decoration:none;transition:color .16s}
.foot-discord:hover{color:#4A4540}
.foot-copy{font-family:ui-monospace,'Cascadia Code',monospace;font-size:10px;color:#C5C0B8;letter-spacing:.08em}
.demo-overlay{position:fixed;inset:0;z-index:200;background:rgba(4,5,7,.75);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:20px;animation:dFadeIn .16s ease}
@keyframes dFadeIn{from{opacity:0}to{opacity:1}}
.demo-window{width:100%;max-width:940px;height:min(620px,calc(100vh - 40px));background:#07080a;border-radius:12px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 40px 100px rgba(0,0,0,.7),0 0 0 1px rgba(255,255,255,.06);animation:dSlideUp .2s ease;font-family:'Inter',system-ui,-apple-system,sans-serif;-webkit-font-smoothing:antialiased}
@keyframes dSlideUp{from{transform:translateY(10px);opacity:0}to{transform:translateY(0);opacity:1}}
`

/* ── Icons ── */
const DlIcon   = () => <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
const PlayIcon = () => <svg width="11" height="11" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>
const IcHome      = () => <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6.8L8 2l6 4.8V14a1 1 0 01-1 1H3a1 1 0 01-1-1V6.8z"/></svg>
const IcAccounts  = () => <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="5.5" r="2.5"/><path d="M1 14c0-2.5 2-4 5-4s5 1.5 5 4"/><path d="M11.5 2.5a2.5 2.5 0 010 5M15 14c0-2-1.5-3.3-3.5-3.7"/></svg>
const IcHub       = () => <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polygon points="8,1.5 10.2,6 15,6.5 11.5,10 12.5,15 8,12.5 3.5,15 4.5,10 1,6.5 5.8,6"/></svg>
const IcGrid      = () => <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.5"/><rect x="9" y="1.5" width="5.5" height="5.5" rx="1.5"/><rect x="1.5" y="9" width="5.5" height="5.5" rx="1.5"/><rect x="9" y="9" width="5.5" height="5.5" rx="1.5"/></svg>
const IcBootstrap = () => <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v8M5 7l3 3 3-3"/><rect x="2" y="12" width="12" height="2" rx="1"/></svg>
const IcTheme     = () => <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6"/><path d="M8 2a6 6 0 0 1 0 12"/><circle cx="8" cy="8" r="2.2" fill="currentColor" stroke="none"/></svg>
const IcSettings  = () => <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="2.2"/><path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4"/></svg>
const IcChangelog = () => <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4h9M2 8h12M2 12h7"/><circle cx="13.2" cy="12" r="1.3" fill="currentColor" stroke="none"/></svg>
const IcStar      = ({ filled }) => <svg width="13" height="13" viewBox="0 0 24 24" fill={filled ? '#FBBF24' : 'none'} stroke={filled ? '#FBBF24' : 'currentColor'} strokeWidth="2"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
const IcLaunch    = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
const IcSearch    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
const IcCheck     = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
const IcDC        = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
const IcYT        = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
const IcGH        = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/></svg>

function statusColor(s) {
  if (s === 'Valid')   return C.green
  if (s === 'Expired') return C.red
  return C.amber
}

/* ═══ DEMO SIDEBAR ═══════════════════════════════════ */
function DemoSidebar({ activePage, onNav }) {
  const NAV = [
    { id: 'home',      Icon: IcHome,      label: 'Home' },
    { id: 'accounts',  Icon: IcAccounts,  label: 'Accounts' },
    null,
    { id: 'utilities', Icon: IcHub,       label: 'Utilities' },
    { id: 'rscript',   Icon: IcGrid,      label: 'Utilities+' },
    { id: 'bootstrap', Icon: IcBootstrap, label: 'Bootstrapper' },
    null,
    { id: 'theme',     Icon: IcTheme,     label: 'Theme' },
    { id: 'settings',  Icon: IcSettings,  label: 'Settings' },
    null,
    { id: 'changelog', Icon: IcChangelog, label: 'Changelog' },
  ]
  const CLICKABLE = new Set(['home', 'accounts', 'utilities', 'settings', 'changelog'])
  const Div = () => <div style={{ height: 1, background: C.bd, margin: '6px 4px' }} />
  return (
    <aside style={{ width: 200, flexShrink: 0, background: C.surface, borderRight: `1px solid ${C.bd}`, display: 'flex', flexDirection: 'column', padding: '18px 10px', gap: 3, overflowY: 'auto' }}>
      <div style={{ padding: '0 8px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.bdm}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: C.t1, flexShrink: 0 }}>R</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.t1, lineHeight: 1 }}>Reiya</div>
          <div style={{ fontSize: 9.5, color: C.t3, marginTop: 2 }}>Account Manager</div>
        </div>
      </div>
      <Div />
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: C.t3, padding: '4px 10px 6px' }}>MENU</div>
      {NAV.map((n, i) => n === null ? <Div key={i} /> : (
        <div key={n.id} onClick={() => CLICKABLE.has(n.id) && onNav(n.id)} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 10px', borderRadius: 9, background: activePage === n.id ? 'rgba(255,255,255,0.07)' : 'transparent', color: activePage === n.id ? C.t1 : C.t3, fontSize: 12, fontWeight: 600, cursor: CLICKABLE.has(n.id) ? 'pointer' : 'default', userSelect: 'none', transition: 'all 0.12s' }}
          onMouseEnter={e => { if (CLICKABLE.has(n.id) && activePage !== n.id) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = C.t2 } }}
          onMouseLeave={e => { if (activePage !== n.id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.t3 } }}
        ><n.Icon />{n.label}</div>
      ))}
      <div style={{ flex: 1 }} />
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: C.t3, padding: '0 10px', marginBottom: 6 }}>COMMUNITY</div>
        <div style={{ display: 'flex', gap: 4, padding: '0 4px' }}>
          {[IcDC, IcYT, IcGH].map((Icon, i) => <div key={i} style={{ width: 28, height: 28, borderRadius: 7, background: C.surf2, border: `1px solid ${C.bd}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.t3 }}><Icon /></div>)}
        </div>
      </div>
      <div style={{ padding: '8px 10px', background: C.surf2, borderRadius: 10, border: `1px solid ${C.bd}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div><div style={{ fontSize: 11, fontWeight: 600, color: C.t2 }}>v1.1.4</div><div style={{ fontSize: 9, marginTop: 1, color: C.t3 }}>Up to date</div></div>
        <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 99, background: 'rgba(52,211,153,0.1)', color: C.green, fontWeight: 700 }}>● live</span>
      </div>
    </aside>
  )
}

/* ═══ HOME PAGE ══════════════════════════════════════ */
const DEMO_SESSIONS = [
  { username: 'SeisenMain',  game: 'Blox Fruits', dur: '2h 14m', when: 'Today, 10:30 AM' },
  { username: 'RobloxAlt01', game: 'Adopt Me!',   dur: '45m',    when: 'Yesterday, 2:14 PM' },
  { username: 'SeisenMain',  game: 'Blox Fruits', dur: '1h 30m', when: 'Dec 26, 8:00 PM' },
]
const GRAPH = [{ day:'Mon',s:2},{ day:'Tue',s:0},{ day:'Wed',s:4},{ day:'Thu',s:1},{ day:'Fri',s:3},{ day:'Sat',s:5},{ day:'Sun',s:2}]

function HomePageDemo() {
  const [selAcc,    setSelAcc]    = useState(1)
  const [selGame,   setSelGame]   = useState('Blox Fruits')
  const [launching, setLaunching] = useState(false)
  const [launched,  setLaunched]  = useState(false)
  const accs = INITIAL_DEMO_ACCOUNTS
  const sel = accs.find(a => a.id === selAcc)
  const GAMES = ['Blox Fruits', 'Adopt Me!', 'Da Hood', 'Pet Simulator 99', 'Arsenal']
  const maxS = Math.max(...GRAPH.map(d => d.s))
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const handleLaunch = () => {
    if (launching || sel?.status !== 'Valid') return
    setLaunching(true); setLaunched(false)
    setTimeout(() => { setLaunching(false); setLaunched(true); setTimeout(() => setLaunched(false), 3000) }, 1800)
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: C.bg }}>
      <div style={{ padding: '16px 22px', borderBottom: `1px solid ${C.bd}`, flexShrink: 0, background: 'rgba(255,255,255,0.01)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 15, fontWeight: 900, color: C.t1, margin: 0, letterSpacing: '-0.01em' }}>{greeting}, SeisenMain 👋</h1>
            <p style={{ fontSize: 10, color: C.t3, marginTop: 3, letterSpacing: '0.08em', fontWeight: 700 }}>DASHBOARD · LAUNCH · TRACK SESSIONS</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[{l:'TOTAL',v:4,c:C.t1},{l:'VALID',v:2,c:C.green},{l:'ACTIVE',v:0,c:C.green},{l:'THIS WEEK',v:'2h',c:C.amber}].map(p => (
              <div key={p.l} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 12px', background: C.surf2, border: `1px solid ${C.bd}`, borderRadius: 10, minWidth: 52 }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: p.c, lineHeight: 1, letterSpacing: '-0.04em' }}>{p.v}</span>
                <span style={{ fontSize: 8, fontWeight: 700, color: C.t3, marginTop: 2, letterSpacing: '0.1em' }}>{p.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Account list */}
        <div style={{ width: 200, flexShrink: 0, borderRight: `1px solid ${C.bd}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '10px 10px 6px', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: C.t3 }}>SELECT ACCOUNT</div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 6px 8px', display: 'flex', flexDirection: 'column', gap: 3 }}>
            {accs.map(a => {
              const sc = statusColor(a.status)
              const active = selAcc === a.id
              return (
                <div key={a.id} onClick={() => setSelAcc(a.id)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px', borderRadius: 10, background: active ? 'rgba(255,255,255,0.07)' : 'transparent', border: `1px solid ${active ? C.bdm : 'transparent'}`, cursor: 'pointer', transition: 'all 0.12s' }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: C.surf2, border: `1px solid ${C.bd}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: C.t2 }}>{a.init}</div>
                    <span style={{ position: 'absolute', bottom: 0, right: 0, width: 7, height: 7, borderRadius: '50%', background: sc, border: '1px solid #07080a' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: active ? C.t1 : C.t2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.display}</div>
                    <div style={{ fontSize: 9, color: C.t3, marginTop: 1 }}>{a.status}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        {/* Right panel */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sel && (
            <div style={{ background: C.surf2, border: `1px solid ${C.bd}`, borderRadius: 14, padding: '14px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: C.surf3, border: `1px solid ${C.bd}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: C.t2 }}>{sel.init}</div>
                  <span style={{ position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, borderRadius: '50%', background: statusColor(sel.status), border: '2px solid #07080a' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: C.t1 }}>{sel.display}</div>
                  <div style={{ fontSize: 11, color: C.t2 }}>@{sel.name} · ID: {7800000 + sel.id}</div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', marginTop: 4, gap: 5 }}>
                    <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 8px', borderRadius: 5, background: statusColor(sel.status) + '18', color: statusColor(sel.status), border: `1px solid ${statusColor(sel.status)}30`, letterSpacing: '0.05em' }}>{sel.status.toUpperCase()}</span>
                    {sel.fav && <IcStar filled />}
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: 10, color: C.t3 }}>
                  <div>Last launched</div><div style={{ color: C.t2, fontWeight: 600, marginTop: 2 }}>{sel.lastLaunched}</div>
                </div>
              </div>
            </div>
          )}
          <div style={{ background: C.surf2, border: `1px solid ${C.bd}`, borderRadius: 14, padding: '14px 18px' }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: C.t3, marginBottom: 10 }}>SELECT GAME</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {GAMES.map(g => <button key={g} onClick={() => setSelGame(g)} style={{ padding: '5px 11px', borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: 'pointer', background: selGame === g ? 'rgba(255,255,255,0.08)' : 'transparent', border: `1px solid ${selGame === g ? C.bdm : C.bd}`, color: selGame === g ? C.t1 : C.t3, transition: 'all 0.12s' }}>{g}</button>)}
            </div>
            <button onClick={handleLaunch} disabled={!!launching || sel?.status !== 'Valid'} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, width: '100%', padding: '11px 0', borderRadius: 10, border: launched ? `1px solid rgba(52,211,153,0.3)` : launching ? `1px solid ${C.bd}` : 'none', background: launched ? 'rgba(52,211,153,0.12)' : launching ? 'rgba(255,255,255,0.04)' : C.acc, color: launched ? C.green : launching ? C.t3 : C.accText, fontSize: 13, fontWeight: 800, cursor: (launching || sel?.status !== 'Valid') ? 'not-allowed' : 'pointer', opacity: sel?.status !== 'Valid' ? 0.4 : 1, transition: 'all 0.14s' }}>
              {launched ? <><IcCheck /> Launched!</> : launching ? 'Launching…' : <><IcLaunch /> Launch {selGame}</>}
            </button>
            {sel?.status !== 'Valid' && <div style={{ textAlign: 'center', fontSize: 10, color: C.red, marginTop: 6 }}>Cookie is not valid — cannot launch</div>}
          </div>
          <div style={{ background: C.surf2, border: `1px solid ${C.bd}`, borderRadius: 14, padding: '14px 18px' }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: C.t3, marginBottom: 12 }}>7-DAY SESSIONS</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 52 }}>
              {GRAPH.map(d => (
                <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: '100%', background: d.s ? `rgba(232,232,232,${0.15 + (d.s / maxS) * 0.45})` : 'rgba(255,255,255,0.03)', borderRadius: 4, height: d.s ? `${Math.max(12, (d.s / maxS) * 40)}px` : '4px' }} />
                  <span style={{ fontSize: 8.5, color: C.t3, fontWeight: 600 }}>{d.day}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: C.surf2, border: `1px solid ${C.bd}`, borderRadius: 14, padding: '14px 18px' }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: C.t3, marginBottom: 10 }}>RECENT SESSIONS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {DEMO_SESSIONS.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: 9, border: `1px solid ${C.bd}` }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.t3, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}><span style={{ fontSize: 11.5, fontWeight: 700, color: C.t1 }}>{s.username}</span><span style={{ fontSize: 11, color: C.t3 }}> · {s.game}</span></div>
                  <div style={{ textAlign: 'right' }}><div style={{ fontSize: 10, fontWeight: 700, color: C.amber }}>{s.dur}</div><div style={{ fontSize: 9, color: C.t3, marginTop: 1 }}>{s.when}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══ ACCOUNTS PAGE ══════════════════════════════════ */
function DemoAccountCard({ acc, launching, launched, onFav, onLaunch }) {
  const [hov, setHov] = useState(false)
  const sc = statusColor(acc.status)
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 18px', background: hov ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.015)', border: `1px solid ${hov ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 14, transition: 'all 0.14s', userSelect: 'none' }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{ width: 46, height: 46, borderRadius: 12, background: C.surf2, border: `1px solid ${C.bd}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: C.t2 }}>{acc.init}</div>
        <span style={{ position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, borderRadius: '50%', background: sc, border: '2px solid #07080a', boxShadow: acc.status === 'Valid' ? `0 0 5px ${sc}` : 'none' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: C.t1 }}>{acc.display}</span>
          {acc.fav && <IcStar filled />}
        </div>
        <div style={{ fontSize: 11, color: C.t2, marginBottom: acc.game ? 3 : 0 }}>@{acc.name} · ID: {7800000 + acc.id}</div>
        {acc.game && <div style={{ fontSize: 10, color: C.t3, fontStyle: 'italic' }}>{acc.game}</div>}
        {acc.tags.length > 0 && <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>{acc.tags.map(tag => <span key={tag} style={{ fontSize: 9, fontWeight: 700, padding: '1px 7px', borderRadius: 4, background: 'rgba(96,165,250,0.1)', color: '#60A5FA', border: '1px solid rgba(96,165,250,0.2)' }}>{tag}</span>)}</div>}
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 108 }}>
        <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 8px', borderRadius: 5, background: sc + '18', color: sc, border: `1px solid ${sc}30`, letterSpacing: '0.05em' }}>{acc.status.toUpperCase()}</span>
        <div style={{ fontSize: 9.5, color: C.t3, marginTop: 5 }}>Last: {acc.lastLaunched}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
        <button onClick={() => onFav(acc.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: acc.fav ? C.amber : C.t3, padding: 5, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: hov || acc.fav ? 1 : 0, transition: 'all 0.12s' }}><IcStar filled={acc.fav} /></button>
        <button onClick={() => onLaunch(acc.id)} disabled={!!launching} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 8, background: launched === acc.id ? 'rgba(52,211,153,0.12)' : launching === acc.id ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.07)', border: `1px solid ${launched === acc.id ? 'rgba(52,211,153,0.3)' : launching === acc.id ? C.bd : C.bdm}`, color: launched === acc.id ? C.green : launching === acc.id ? C.t3 : C.t1, fontSize: 11, fontWeight: 700, cursor: launching ? 'not-allowed' : 'pointer', opacity: launching && launching !== acc.id ? 0.4 : 1, transition: 'all 0.14s', flexShrink: 0 }}>
          <IcLaunch />
          {launched === acc.id ? 'Launched' : launching === acc.id ? 'Launching…' : 'Launch'}
        </button>
      </div>
    </div>
  )
}

function AccountsPageDemo() {
  const [accounts, setAccounts] = useState(INITIAL_DEMO_ACCOUNTS)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [launching, setLaunching] = useState(null)
  const [launched, setLaunched] = useState(null)
  const toggleFav = useCallback(id => setAccounts(prev => prev.map(a => a.id === id ? { ...a, fav: !a.fav } : a)), [])
  const launch = useCallback(id => {
    if (launching) return
    setLaunching(id); setLaunched(null)
    setTimeout(() => { setLaunching(null); setLaunched(id); setTimeout(() => setLaunched(l => l === id ? null : l), 3200) }, 1800)
  }, [launching])
  const visible = accounts.filter(a => {
    const q = search.toLowerCase()
    return (!q || a.name.toLowerCase().includes(q) || a.display.toLowerCase().includes(q)) &&
           (filter === 'all' || (filter === 'favorites' && a.fav) || (filter === 'valid' && a.status === 'Valid'))
  })
  const Pill = ({ value, label, color }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 12px', background: C.surf2, border: `1px solid ${C.bd}`, borderRadius: 10, minWidth: 52 }}>
      <span style={{ fontSize: 16, fontWeight: 800, color, lineHeight: 1, letterSpacing: '-0.04em' }}>{value}</span>
      <span style={{ fontSize: 8.5, fontWeight: 700, color: C.t3, marginTop: 2, letterSpacing: '0.1em' }}>{label}</span>
    </div>
  )
  const Tab = ({ id, label }) => <button onClick={() => setFilter(id)} style={{ padding: '6px 14px', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: 'none', background: filter === id ? 'rgba(255,255,255,0.07)' : 'transparent', color: filter === id ? C.t1 : C.t3, transition: 'all 0.12s' }}>{label}</button>
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: C.bg }}>
      <div style={{ padding: '16px 22px', borderBottom: `1px solid ${C.bd}`, background: 'rgba(255,255,255,0.01)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <h1 style={{ fontSize: 13, fontWeight: 900, letterSpacing: '0.06em', color: C.t1, margin: 0 }}>ACCOUNT MANAGER</h1>
            <p style={{ fontSize: 9.5, fontWeight: 700, color: C.t3, letterSpacing: '0.1em', marginTop: 3 }}>MANAGE · LAUNCH · VALIDATE ROBLOX ACCOUNTS</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Pill value={accounts.length} label="TOTAL" color={C.t1} />
            <Pill value={accounts.filter(a => a.status === 'Valid').length} label="VALID" color={C.green} />
            <Pill value={accounts.filter(a => a.fav).length} label="FAVORITES" color={C.amber} />
            <Pill value={0} label="ACTIVE" color={C.green} />
            <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 9, border: 'none', background: C.acc, color: C.accText, fontSize: 11.5, fontWeight: 800, cursor: 'default' }}>+ Add Account ▾</button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: C.t3, pointerEvents: 'none' }}><IcSearch /></span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search accounts…" style={{ width: '100%', padding: '8px 12px 8px 33px', background: C.surf2, border: `1px solid ${C.bd}`, borderRadius: 9, color: C.t1, fontSize: 12, outline: 'none', fontFamily: 'Inter,system-ui,sans-serif' }} onFocus={e => e.target.style.borderColor = C.bdm} onBlur={e => e.target.style.borderColor = C.bd} />
          </div>
          <div style={{ display: 'flex', gap: 2, padding: 3, borderRadius: 10, background: C.surf2, border: `1px solid ${C.bd}`, flexShrink: 0 }}>
            <Tab id="all" label="All" /><Tab id="favorites" label="Favorites" /><Tab id="valid" label="Valid" />
          </div>
          <select style={{ height: 34, padding: '0 10px', borderRadius: 9, border: `1px solid ${C.bd}`, background: C.surf2, color: C.t2, fontSize: 11, fontWeight: 700, cursor: 'pointer', outline: 'none', fontFamily: 'Inter,system-ui,sans-serif' }}><option>↓ Last Launched</option></select>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {visible.length === 0
          ? <div style={{ textAlign: 'center', padding: '40px 20px', color: C.t3, fontSize: 12 }}>No accounts match "{search}"</div>
          : visible.map(acc => <DemoAccountCard key={acc.id} acc={acc} launching={launching} launched={launched} onFav={toggleFav} onLaunch={launch} />)}
        <div style={{ fontSize: 10, color: C.t3, textAlign: 'center', marginTop: 4, fontStyle: 'italic' }}>Demo only — no real accounts or cookies</div>
      </div>
    </div>
  )
}

/* ═══ UTILITIES PAGE ═════════════════════════════════ */
const DEMO_SERVERS = [
  { job: 'a8f3c2e1-4b91-4d55-8f6a-2e7c9d012345', players: '14/20', ping: 42,  fps: '60' },
  { job: 'b2d7a901-3c44-4e88-9f1b-5d8e0f123456', players: '8/20',  ping: 78,  fps: '60' },
  { job: 'c9e5b312-7f66-4a22-8c3d-6a1b2e234567', players: '20/20', ping: 124, fps: '58' },
  { job: 'd1f8c423-9a77-4b33-7d4e-7b2c3f345678', players: '3/20',  ping: 55,  fps: '60' },
]
const DEMO_HIST_GAMES = [
  { name: 'Blox Fruits',    placeId: '2753915549', creator: 'go_place',          date: 'Dec 28' },
  { name: 'Adopt Me!',      placeId: '920587237',  creator: 'Uplift Games',       date: 'Dec 27' },
  { name: 'Da Hood',        placeId: '2788229376', creator: 'Hood',               date: 'Dec 25' },
  { name: 'Arsenal',        placeId: '286090429',  creator: 'ROLVe Community',    date: 'Dec 20' },
]

function UtilitiesPageDemo() {
  const [tab,    setTab]    = useState('servers')
  const [query,  setQuery]  = useState('')
  const [multi,  setMulti]  = useState(true)
  const [selSrv, setSelSrv] = useState(null)
  const [selHst, setSelHst] = useState(null)
  const TABS = [{ id: 'servers', l: 'SERVERS' }, { id: 'games', l: 'GAMES' }, { id: 'history', l: 'HISTORY' }, { id: 'favorites', l: 'FAVORITES' }]
  const hasSel = !!(selSrv || selHst)
  const selText = selSrv ? `Server · ${selSrv.slice(0, 24)}…` : selHst ? `${selHst.name} · PID ${selHst.placeId}` : 'No item selected'
  const pingColor = p => p < 80 ? C.green : p < 150 ? C.amber : C.red

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: C.bg }}>
      <div style={{ padding: '16px 22px', borderBottom: `1px solid ${C.bd}`, background: 'rgba(255,255,255,0.01)', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 13, fontWeight: 900, letterSpacing: '0.06em', color: C.t1, margin: 0 }}>GAME BROWSER</h1>
          <p style={{ fontSize: 9.5, fontWeight: 700, color: C.t3, letterSpacing: '0.1em', marginTop: 3 }}>SEARCH GAMES · BROWSE SERVERS · LAUNCH CUSTOM PLACES</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 10, background: C.surf2, border: `1px solid ${multi ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}` }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: multi ? C.green : C.red, boxShadow: `0 0 5px ${multi ? C.green : C.red}` }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: C.t2 }}>Multi-Instance: {multi ? 'Active' : 'Disabled'}</span>
          </div>
          <button onClick={() => setMulti(!multi)} style={{ padding: '6px 13px', borderRadius: 9, fontSize: 11, fontWeight: 800, background: multi ? 'rgba(248,113,113,0.08)' : 'rgba(52,211,153,0.08)', color: multi ? C.red : C.green, border: `1px solid ${multi ? 'rgba(248,113,113,0.2)' : 'rgba(52,211,153,0.2)'}`, cursor: 'pointer' }}>{multi ? 'Disable' : 'Enable'}</button>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '14px 18px', gap: 12, overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 2, padding: 3, borderRadius: 10, background: C.surf2, border: `1px solid ${C.bd}`, alignSelf: 'flex-start' }}>
          {TABS.map(t => <button key={t.id} onClick={() => { setTab(t.id); setSelSrv(null); setSelHst(null) }} style={{ padding: '6px 14px', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: 'none', background: tab === t.id ? 'rgba(255,255,255,0.07)' : 'transparent', color: tab === t.id ? C.t1 : C.t3, transition: 'all 0.12s' }}>{t.l}</button>)}
        </div>
        {tab === 'servers' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: C.surf2, border: `1px solid ${C.bd}`, borderRadius: 12, padding: '5px 8px 5px 14px' }}>
              <IcSearch />
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Place ID or game name…" style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: C.t1, fontSize: 12, padding: '6px 4px', fontFamily: 'Inter,system-ui,sans-serif' }} />
              <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: C.surf3, border: `1px solid ${C.bd}`, borderRadius: 8, color: C.t1, fontSize: 11, fontWeight: 700, padding: '6px 14px', cursor: 'pointer' }}>Scan</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', background: C.surf2, border: `1px solid ${C.bd}`, borderRadius: 14 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.bd}` }}>
                    {['JOB ID (GUID)', 'PLAYERS', 'PING', 'FPS'].map((h, i) => <th key={h} style={{ padding: '10px 16px', color: C.t3, fontWeight: 800, fontSize: 9.5, letterSpacing: '0.1em', textAlign: i > 0 ? 'right' : 'left', width: i > 0 ? 90 : undefined }}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {DEMO_SERVERS.map(s => {
                    const isSel = selSrv === s.job
                    return (
                      <tr key={s.job} onClick={() => setSelSrv(isSel ? null : s.job)} style={{ borderBottom: `1px solid rgba(255,255,255,0.03)`, background: isSel ? 'rgba(255,255,255,0.05)' : 'transparent', cursor: 'pointer' }} onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }} onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = 'transparent' }}>
                        <td style={{ padding: '11px 16px', fontFamily: 'monospace', fontSize: 10.5, color: isSel ? C.amber : C.t2, fontWeight: isSel ? 700 : 400 }}>{s.job}</td>
                        <td style={{ padding: '11px 16px', textAlign: 'right', fontWeight: 700, color: C.t1 }}>{s.players}</td>
                        <td style={{ padding: '11px 16px', textAlign: 'right', fontWeight: 700, color: pingColor(s.ping) }}>{s.ping}ms</td>
                        <td style={{ padding: '11px 16px', textAlign: 'right', color: C.t2 }}>{s.fps}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {tab === 'history' && (
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <span style={{ fontSize: 9.5, fontWeight: 800, color: C.t3, letterSpacing: '0.12em' }}>RECENT HISTORY</span>
              <span style={{ fontSize: 9, fontWeight: 800, color: C.amber, background: C.surf2, border: `1px solid ${C.bd}`, padding: '1px 7px', borderRadius: 99 }}>{DEMO_HIST_GAMES.length}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 10 }}>
              {DEMO_HIST_GAMES.map(g => {
                const isSel = selHst?.placeId === g.placeId
                return (
                  <div key={g.placeId} onClick={() => setSelHst(isSel ? null : g)} style={{ display: 'flex', gap: 10, padding: '12px 14px', background: isSel ? C.surf3 : C.surf2, border: `1px solid ${isSel ? 'rgba(255,255,255,0.12)' : C.bd}`, borderRadius: 12, alignItems: 'center', cursor: 'pointer', transition: 'all .12s' }}>
                    <div style={{ width: 46, height: 46, borderRadius: 10, background: C.surf3, border: `1px solid ${C.bd}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18 }}>🎮</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: C.t1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.name}</div>
                      <div style={{ fontSize: 10, color: C.t2 }}>{g.creator}</div>
                      <div style={{ fontSize: 9.5, color: C.amber, marginTop: 2, fontFamily: 'monospace', fontWeight: 700 }}>{g.date} · PID {g.placeId}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
        {(tab === 'games' || tab === 'favorites') && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.t3, fontSize: 12 }}>
            {tab === 'games' ? 'Search for a game by name or Place ID above' : 'No favorites yet — star a game in History to save it here'}
          </div>
        )}
      </div>
      <div style={{ padding: '12px 22px', borderTop: `1px solid ${C.bd}`, background: 'rgba(255,255,255,0.01)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: hasSel ? C.amber : C.t3, boxShadow: hasSel ? `0 0 5px ${C.amber}` : 'none' }} />
          <div>
            <div style={{ fontSize: 9, color: C.t3, fontWeight: 800, letterSpacing: '0.1em' }}>SELECTION</div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: hasSel ? C.t1 : C.t3, marginTop: 2 }}>{selText}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => { setSelSrv(null); setSelHst(null) }} style={{ padding: '9px 20px', borderRadius: 10, border: `1px solid ${C.bd}`, background: C.surf2, color: C.t2, fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
          <button disabled={!hasSel} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 20px', borderRadius: 10, border: 'none', background: hasSel ? C.acc : C.surf3, color: hasSel ? C.accText : C.t3, fontSize: 11.5, fontWeight: 800, cursor: hasSel ? 'pointer' : 'not-allowed', opacity: hasSel ? 1 : 0.5 }}>Use Selected →</button>
        </div>
      </div>
    </div>
  )
}

/* ═══ SETTINGS PAGE ══════════════════════════════════ */
const SETTINGS_TABS = [
  { id: 'app',       label: 'App',       accent: '#A78BFA' },
  { id: 'client',    label: 'Client',    accent: '#60A5FA' },
  { id: 'watchdog',  label: 'Watchdog',  accent: '#34D399' },
  { id: 'alerts',    label: 'Alerts',    accent: '#FBBF24' },
  { id: 'developer', label: 'Developer', accent: '#F87171' },
]
const SETTINGS_SECTIONS = {
  app: [
    { title: 'App Options', accent: '#A78BFA', rows: [
      { k: 'CheckForUpdates', label: 'Check for updates on launch', desc: 'Automatically check for a new version at startup.' },
      { k: 'RunOnStartup',    label: 'Run on startup',              desc: 'Launch Reiya automatically when Windows starts.' },
      { k: 'MinToTray',       label: 'Minimize to tray on close',   desc: 'Keep running in the system tray instead of quitting.' },
      { k: 'MinOnLaunch',     label: 'Minimize window on launch',   desc: 'Hide the main window when launching an account.' },
      { k: 'Presence',        label: 'Show account presence',       desc: 'Display the active account in your system tray tooltip.' },
    ]},
    { title: 'Performance', accent: '#34D399', rows: [
      { k: 'UnlockFps',      label: 'Unlock FPS cap',               desc: 'Remove the 60 FPS limit imposed by Roblox.' },
      { k: 'CustomSettings', label: 'Custom client settings',       desc: 'Apply custom ClientAppSettings.json on each launch.' },
    ]},
  ],
  client: [
    { title: 'Multi-Instance & Mutex', accent: '#60A5FA', rows: [
      { k: 'MultiRoblox',    label: 'Enable multi-instance',        desc: 'Allow multiple Roblox windows simultaneously.' },
      { k: 'Bootstrapper',   label: 'Use Bootstrapper on launch',   desc: 'Launch via Bootstrapper instead of direct exe.' },
      { k: 'ShuffleServer',  label: 'Shuffle to lowest-ping server',desc: 'Automatically join the lowest ping server.' },
    ]},
    { title: 'Credentials', accent: '#34D399', rows: [
      { k: 'SavePasswords',  label: 'Save account passwords',       desc: 'Store passwords encrypted so re-login is automatic.' },
      { k: 'Clipboard',      label: 'Clipboard cookie detection',   desc: 'Prompt to import a cookie when one is in clipboard.' },
      { k: 'AutoRefresh',    label: 'Auto-refresh cookies',         desc: 'Re-validate cookies in the background.' },
    ]},
  ],
  watchdog: [
    { title: 'Auto-Rejoin Watchdog', accent: '#34D399', rows: [
      { k: 'AutoRejoin',     label: 'Enable auto-rejoin',           desc: 'Automatically rejoin after a disconnect or kick.' },
    ]},
    { title: 'Session History', accent: '#60A5FA', rows: [
      { k: 'SessionHistory', label: 'Record session activity',      desc: 'Save a log of every Roblox session for stats.' },
    ]},
  ],
  alerts: [
    { title: 'Notifications', accent: '#FBBF24', rows: [
      { k: 'Toasts',         label: 'Toast notifications',          desc: 'Show pop-up toasts for app events.' },
      { k: 'Sound',          label: 'Audio alert sounds',           desc: 'Play a sound for important events.' },
      { k: 'Disconnect',     label: 'Warn on disconnect',           desc: 'Alert you when a session drops.' },
      { k: 'LaunchAlert',    label: 'Notify on launch success',     desc: 'Confirm when an account has launched.' },
    ]},
    { title: 'Discord', accent: '#818CF8', rows: [
      { k: 'DiscordRpc',     label: 'Discord Rich Presence',        desc: 'Show your activity in your Discord status.' },
    ]},
  ],
  developer: [
    { title: 'Local Web Server', accent: '#34D399', rows: [
      { k: 'DevMode',        label: 'Developer mode',               desc: 'Enable extra logging and debug endpoints.' },
      { k: 'WebServer',      label: 'Enable web server',            desc: 'Expose a REST API for scripting.' },
    ]},
  ],
}

function ToggleSwitch({ value, onChange }) {
  return (
    <div onClick={() => onChange(!value)} style={{ width: 38, height: 20, borderRadius: 99, background: value ? C.acc : 'rgba(255,255,255,0.08)', border: `1px solid ${value ? C.acc : 'rgba(255,255,255,0.12)'}`, position: 'relative', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 2, left: value ? 20 : 2, width: 14, height: 14, borderRadius: '50%', background: value ? C.accText : C.t3, transition: 'all 0.2s cubic-bezier(.25,.8,.25,1)' }} />
    </div>
  )
}

function SettingsPageDemo() {
  const [tab,   setTab]   = useState('app')
  const [saved, setSaved] = useState(false)
  const [vals,  setVals]  = useState({
    CheckForUpdates: true, RunOnStartup: false, MinToTray: true, MinOnLaunch: true, Presence: true,
    UnlockFps: false, CustomSettings: false, MultiRoblox: true, Bootstrapper: true, ShuffleServer: false,
    SavePasswords: true, Clipboard: false, AutoRefresh: true, AutoRejoin: false, SessionHistory: true,
    Toasts: true, Sound: false, Disconnect: true, LaunchAlert: false, DiscordRpc: true, DevMode: false, WebServer: false,
  })
  const set = (k, v) => setVals(prev => ({ ...prev, [k]: v }))
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2500) }
  const activeTab = SETTINGS_TABS.find(t => t.id === tab)
  const EMOJI = { app: '⚙️', client: '🎮', watchdog: '👁', alerts: '🔔', developer: '🛠' }
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: C.bg }}>
      <div style={{ height: 48, display: 'flex', alignItems: 'stretch', justifyContent: 'space-between', padding: '0 22px', borderBottom: `1px solid ${C.bd}`, background: 'rgba(255,255,255,0.01)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'stretch' }}>
          {SETTINGS_TABS.map(t => <button key={t.id} onClick={() => setTab(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '0 14px', border: 'none', background: 'transparent', color: tab === t.id ? C.t1 : C.t3, fontSize: 12, fontWeight: tab === t.id ? 700 : 500, cursor: 'pointer', borderBottom: tab === t.id ? `2px solid ${t.accent}` : '2px solid transparent', marginBottom: -1, transition: 'all .15s' }}>{t.label}</button>)}
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 12px', border: 'none', background: 'transparent', color: C.t3, fontSize: 11.5, fontWeight: 600, cursor: 'default' }}>← Back</button>
      </div>
      <div style={{ padding: '14px 24px 12px', borderBottom: `1px solid rgba(255,255,255,0.05)`, flexShrink: 0, background: `linear-gradient(135deg,${activeTab.accent}06 0%,transparent 60%)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: activeTab.accent + '14', border: `1px solid ${activeTab.accent}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{EMOJI[tab]}</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, color: C.t1, letterSpacing: '-0.3px' }}>{activeTab.label} Settings</div>
            <div style={{ fontSize: 11, color: C.t3, marginTop: 2 }}>Configure {activeTab.label.toLowerCase()} behavior and preferences</div>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 900 }}>
          {(SETTINGS_SECTIONS[tab] || []).map(sec => (
            <div key={sec.title} style={{ background: 'rgba(255,255,255,0.015)', border: `1px solid ${C.bd}`, borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ padding: '10px 16px', borderBottom: `1px solid rgba(255,255,255,0.05)`, background: sec.accent + '06', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: 6, background: sec.accent + '18', border: `1px solid ${sec.accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: sec.accent }}>●</div>
                <span style={{ fontSize: 11, fontWeight: 800, color: C.t1, letterSpacing: '0.04em' }}>{sec.title}</span>
              </div>
              <div style={{ padding: '2px 16px' }}>
                {sec.rows.map(row => (
                  <div key={row.k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid rgba(255,255,255,0.04)`, gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.t1 }}>{row.label}</div>
                      <div style={{ fontSize: 10, color: C.t3, marginTop: 2, lineHeight: 1.4 }}>{row.desc}</div>
                    </div>
                    <ToggleSwitch value={!!vals[row.k]} onChange={v => set(row.k, v)} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '10px 24px', borderTop: `1px solid ${C.bd}`, background: 'rgba(255,255,255,0.01)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ minHeight: 20 }}>
          {saved && <span style={{ color: C.green, fontSize: 11.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}><IcCheck /> Settings saved</span>}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ padding: '7px 16px', borderRadius: 8, border: `1px solid ${C.bd}`, background: 'transparent', color: C.t2, fontSize: 12, fontWeight: 600, cursor: 'default' }}>Cancel</button>
          <button onClick={save} style={{ padding: '7px 20px', borderRadius: 8, border: 'none', background: C.acc, color: C.accText, fontSize: 12, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><IcCheck /> Save Settings</button>
        </div>
      </div>
    </div>
  )
}

/* ═══ CHANGELOG PAGE ══════════════════════════════════ */
const DEMO_CHANGELOG = [
  { version: '1.1.4', date: 'July 24, 2026', title: 'Major CPU & Memory Performance Optimizations', current: true, changes: [
    { kind: 'improved', text: 'GPU Compositing: Replaced CPU box-shadow repaints with hardware-accelerated composite keyframe animations.' },
    { kind: 'improved', text: 'Idle Process Monitoring: Rust session tracker dynamically reduces scan frequency when no active games are running, cutting CPU usage by over 60%.' },
    { kind: 'improved', text: 'Background polling and re-renders automatically pause when the manager is minimized or hidden in tray.' },
    { kind: 'fixed',    text: 'Eliminated unnecessary root component re-render loops and unmemoized effect calculations.' },
    { kind: 'improved', text: 'Asynchronous Image Decoding: Added off-thread decoding and lazy loading for account avatar thumbnails.' },
  ]},
  { version: '1.1.3', date: 'July 23, 2026', title: 'Roblox Multi-Instance persistent handles & launch fixes', current: false, changes: [
    { kind: 'fixed',    text: 'Multi-Instance Roblox: singleton mutex and event handles remain active continuously so opening another game no longer closes active Roblox windows.' },
    { kind: 'fixed',    text: 'Direct launching now executes RobloxPlayerBeta.exe directly, preventing the launcher from terminating active instances.' },
    { kind: 'improved', text: 'Removed automatic process termination during loading screens and place teleports.' },
    { kind: 'improved', text: 'Removed unnecessary multi-instance conflict warning dialog.' },
  ]},
  { version: '1.1.2', date: 'July 15, 2026', title: 'MultiRoblox conflict warning, crash logging', current: false, changes: [
    { kind: 'new',      text: "If MultiRoblox can't activate, you'll now get a clear warning with a one-click 'Close All Roblox Windows' button." },
    { kind: 'improved', text: 'Crashes now get logged with a full error message and stack trace.' },
    { kind: 'fixed',    text: 'Fixed the "Get a Free Key" link pointing at an old domain.' },
  ]},
  { version: '1.1.1', date: 'July 14, 2026', title: 'Password-locked encryption, multi-launch, MultiRoblox fix', current: false, changes: [
    { kind: 'new',      text: 'Added optional password-locked encryption mode — set a password and Reiya will ask for it every launch.' },
    { kind: 'new',      text: 'You can now select multiple accounts and launch them all into the same game at once.' },
    { kind: 'improved', text: 'Backup export/import no longer requires a password — leave it blank to skip.' },
    { kind: 'fixed',    text: 'MultiRoblox handles are now released only once every in-flight launch is done.' },
  ]},
  { version: '1.1.0', date: 'July 6, 2026', title: 'Changelog tab, backup fixes', current: false, changes: [
    { kind: 'new',      text: 'Added a Changelog tab so you can see what\'s new in every update.' },
    { kind: 'fixed',    text: 'Restoring a backup could say "Wrong password" even with the correct password.' },
    { kind: 'fixed',    text: 'Restoring a backup could report "0 accounts imported" when accounts weren\'t already saved.' },
  ]},
]
const KIND = {
  new:      { label: 'NEW',      color: '#34D399', bg: 'rgba(52,211,153,0.08)' },
  improved: { label: 'IMPROVED', color: '#A78BFA', bg: 'rgba(167,139,250,0.08)' },
  fixed:    { label: 'FIXED',    color: '#F87171', bg: 'rgba(248,113,113,0.08)' },
}

function ChangelogPageDemo() {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: C.bg }}>
      <div style={{ padding: '16px 22px', borderBottom: `1px solid ${C.bd}`, background: 'rgba(255,255,255,0.01)', flexShrink: 0 }}>
        <h1 style={{ fontSize: 13, fontWeight: 900, letterSpacing: '0.06em', color: C.t1, margin: 0 }}>CHANGELOG</h1>
        <p style={{ fontSize: 9.5, fontWeight: 700, color: C.t3, letterSpacing: '0.1em', marginTop: 3 }}>WHAT'S NEW IN EVERY VERSION</p>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 22px 32px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {DEMO_CHANGELOG.map(rel => (
            <div key={rel.version} style={{ padding: '16px 18px', borderRadius: 14, border: `1px solid ${rel.current ? 'rgba(52,211,153,0.35)' : C.bd}`, background: C.surface }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 900, color: C.t1 }}>v{rel.version}</span>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: C.t2 }}>{rel.title}</span>
                  {rel.current && <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 99, background: 'rgba(52,211,153,0.12)', color: C.green, fontWeight: 700, border: '1px solid rgba(52,211,153,0.25)' }}>CURRENT</span>}
                </div>
                <span style={{ fontSize: 10, color: C.t3, fontWeight: 600, flexShrink: 0 }}>{rel.date}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {rel.changes.map((c, i) => {
                  const ks = KIND[c.kind]
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <span style={{ flexShrink: 0, fontSize: 9, fontWeight: 800, letterSpacing: '0.05em', padding: '2px 7px', borderRadius: 6, color: ks.color, background: ks.bg, marginTop: 1 }}>{ks.label}</span>
                      <span style={{ fontSize: 12, color: C.t2, lineHeight: 1.6 }}>{c.text}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ═══ DEMO MODAL ═════════════════════════════════════ */
function DemoModal({ onClose }) {
  const [activePage, setActivePage] = useState('accounts')
  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])
  return (
    <div className="demo-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }} role="dialog" aria-modal="true" aria-label="Reiya demo">
      <div className="demo-window">
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '11px 16px', background: C.surface, borderBottom: `1px solid ${C.bd}`, flexShrink: 0, position: 'relative' }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FF5F57', cursor: 'pointer' }} onClick={onClose} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FFBD2E' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28C840' }} />
          <span style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', fontSize: 11.5, fontWeight: 600, color: C.t3 }}>Reiya Account Manager</span>
        </div>
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <DemoSidebar activePage={activePage} onNav={setActivePage} />
          {activePage === 'home'      && <HomePageDemo />}
          {activePage === 'accounts'  && <AccountsPageDemo />}
          {activePage === 'utilities' && <UtilitiesPageDemo />}
          {activePage === 'settings'  && <SettingsPageDemo />}
          {activePage === 'changelog' && <ChangelogPageDemo />}
        </div>
      </div>
    </div>
  )
}

/* ═══ LANDING PAGE ═══════════════════════════════════ */
const FEATURES = [
  { name: 'Multi-Account Switching', desc: 'Store unlimited accounts. Launch any one instantly — no login screens, no manual cookies.' },
  { name: 'Encrypted Vault',         desc: 'Password-lock your account vault. All credentials are encrypted at rest on your machine.' },
  { name: 'Multi-Instance',          desc: 'Break the Roblox singleton lock and run multiple sessions at the same time.' },
  { name: 'FastFlags Editor',        desc: 'Write client flags once and push them to every launcher — official, Bloxstrap, Fishstrap — in one action.' },
  { name: 'Backup & Restore',        desc: 'Export your full vault to a file. Import it anywhere in seconds.' },
  { name: 'Session Watchdog',        desc: 'Background monitor that detects crashes or kicks and surfaces them immediately.' },
]

export default function Home() {
  const [appVersion,   setAppVersion]   = useState(undefined)
  const [downloading,  setDownloading]  = useState(false)
  const [demoOpen,     setDemoOpen]     = useState(false)
  const [visitCount,   setVisitCount]   = useState(null)
  const [downloadCount,setDownloadCount]= useState(null)

  useEffect(() => {
    supabase.rpc('increment_visits').then(({ data }) => { if (data != null) setVisitCount(data) })
    supabase.from('site_stats').select('downloads').eq('id', 1).single().then(({ data }) => { if (data != null) setDownloadCount(data.downloads) })
    fetch('https://api.github.com/repos/Seisen-z/Key-System/releases/latest', { headers: { Accept: 'application/vnd.github+json' } })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) { setAppVersion(null); return }
        const exe = data.assets?.find(a => a.name.endsWith('.exe'))
        setAppVersion(exe ? { version: data.tag_name.replace(/^v/i, ''), download_url: exe.browser_download_url } : null)
      })
      .catch(() => setAppVersion(null))
  }, [])

  const download = () => {
    if (!appVersion?.download_url || downloading) return
    setDownloading(true)
    supabase.rpc('increment_downloads').then(({ data }) => { if (data != null) setDownloadCount(data) })
    const a = document.createElement('a')
    a.href = appVersion.download_url
    a.download = ''
    a.click()
    setTimeout(() => setDownloading(false), 3000)
  }

  return (
    <>
      <style>{css}</style>
      <div className="rp">
        <nav className="nav" aria-label="Site navigation">
          <div className="nav-inner">
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <img src="/logo.png" alt="" aria-hidden="true" style={{ width: 26, height: 26, objectFit: 'contain' }} />
              <span className="nav-logo" aria-label="Reiya">Reiya</span>
            </div>
            <div className="nav-right">
              <button className="nav-demo" onClick={() => setDemoOpen(true)} aria-label="Try the demo"><PlayIcon /> Try Demo</button>
              <button className="nav-dl" onClick={download} disabled={downloading} aria-label="Download Reiya"><DlIcon />{downloading ? 'Starting…' : 'Download'}</button>
            </div>
          </div>
        </nav>

        <section className="hero" aria-label="Introduction">
          <div className="hero-left">
            <p className="hero-eyebrow">Windows · Free · Open Source</p>
            <h1 className="hero-h1">
              <span className="hero-mark">Reiya</span>
              <span className="hero-mark-sub">Account Manager</span>
            </h1>
            <p className="hero-desc">The all-in-one Roblox account manager for Windows. Store, switch, and launch accounts in seconds — encryption, multi-instance, and FastFlags included.</p>
            <div className="hero-actions">
              <button className="hero-btn" onClick={download} disabled={downloading}><DlIcon />{downloading ? 'Starting download…' : 'Download for Windows'}</button>
              <div className="hero-meta">
                <span className="hero-free">Free, always</span>
                {appVersion && <span className="hero-ver">v{appVersion.version} · x64</span>}
                {(visitCount != null || downloadCount != null) && (
                  <span className="hero-ver">
                    {visitCount != null && <>{visitCount.toLocaleString()} visits</>}
                    {visitCount != null && downloadCount != null && ' · '}
                    {downloadCount != null && <>{downloadCount.toLocaleString()} downloads</>}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="hero-right" aria-hidden="true">
            <div className="accounts-panel">
              <div className="panel-top">
                <span className="panel-title">Accounts</span>
                <span className="panel-count">{MOCK_ACCOUNTS.length}</span>
              </div>
              {MOCK_ACCOUNTS.map(acc => (
                <div className="acc-row" key={acc.name}>
                  <span className={`acc-dot${acc.live ? ' live' : ''}`} />
                  <div className="acc-avatar">{acc.initial}</div>
                  <span className="acc-name">{acc.name}</span>
                  <span className="acc-time">{acc.time}</span>
                  <span className="acc-action">Launch →</span>
                </div>
              ))}
              <div className="panel-fade" />
            </div>
          </div>
        </section>

        <div className="rule" />

        <section className="features" aria-label="Features">
          <p className="sec-label">What's included</p>
          <div className="bento">
            {FEATURES.map(f => (
              <div className="bt" key={f.name}>
                <div className="bt-marker" />
                <p className="bt-name">{f.name}</p>
                <p className="bt-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="dl-strip" aria-label="Download">
          <div className="dl-strip-inner">
            <div className="dl-strip-left">
              <p className="dl-strip-h">Ready to get started?</p>
              <p className="dl-strip-sub">Free download · Windows x64 · No account required</p>
            </div>
            <button className="dl-strip-btn" onClick={download} disabled={downloading}><DlIcon />{downloading ? 'Starting…' : 'Download Reiya'}</button>
          </div>
        </section>

        <footer className="foot" aria-label="Footer">
          <div className="foot-row">
            <span className="foot-logo">Reiya</span>
            <a className="foot-discord" href="https://discord.gg/F4sAf6z8Ph" target="_blank" rel="noopener noreferrer">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="#5865F2" aria-hidden="true"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
              Join Discord
            </a>
          </div>
          <p className="foot-copy">Not affiliated with Roblox Corporation</p>
        </footer>
      </div>

      {demoOpen && <DemoModal onClose={() => setDemoOpen(false)} />}
    </>
  )
}
