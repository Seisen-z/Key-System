import {useState,useEffect,useCallback} from 'react';
import {Link} from 'react-router-dom';
import {supabase} from '../lib/supabase';
import {SiteHeader,SiteFooter} from '../components/Site';
import ProductExplorer,{ProductDemoModal} from '../components/ProductExplorer';
const DlIcon=()=> <span aria-hidden="true">↓</span>;
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

  const closeDemo = useCallback(()=>setDemoOpen(false), []);
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

  return <><SiteHeader onDemo={()=>setDemoOpen(true)}/><main className="green-home"><section className="play-hero" aria-label="Reiya Roblox account manager"><img className="play-hero-art" src="/reiya-roblox-hero.png" alt="A smiling Roblox-style avatar in green, surrounded by other account avatars in a floating game world" fetchPriority="high"/><div className="play-hero-copy"><p className="play-product-label">REIYA · ROBLOX ACCOUNT MANAGER</p><h1>Your accounts.<br/>Your next<br/><span>adventure.</span></h1><p className="play-description">Spend less time switching accounts.<br/>Keep your Roblox world in one place.</p><div className="play-actions"><button className="button dark" onClick={download} disabled={downloading||!appVersion?.download_url}>{downloading?'Starting download…':appVersion===undefined?'Loading download…':'Download for Windows'} <DlIcon/></button><button className="play-demo-button" onClick={()=>setDemoOpen(true)}>Try the demo <span>↗</span></button></div><p className="play-requirements">Free app · Windows x64 · No sign-up {appVersion&&`· v${appVersion.version}`}</p>{appVersion===null&&<a className="release-link" href="https://github.com/Seisen-z/Key-System/releases">Download unavailable. View releases ↗</a>}</div><div className="play-benefits"><div><b>Your accounts</b><span>Saved in an encrypted local vault</span></div><div><b>Your games</b><span>Favorites ready for your next session</span></div><div><b>Your setup</b><span>Settings, flags, and backups together</span></div></div></section>

<section className="feature-studio" id="features"><div className="studio-heading"><div><p className="eyebrow">INSIDE THE DESKTOP APP</p><h2>Not just an account list.<br/>Your Roblox control room.</h2></div><p>From your first launch to your last session, Reiya brings your accounts, games, and client tools together. Explore the essentials below.</p></div><ProductExplorer/><div className="feature-caption"><span>Use Reiya’s real sidebar, pages, and account controls with sample data.</span><button onClick={()=>setDemoOpen(true)}>Open larger preview ↗</button></div></section>
<section className="capabilities-section" id="details"><div className="capabilities-intro"><p className="eyebrow">WHAT’S ACTUALLY INCLUDED</p><h2>A tool for each<br/>part of your session.</h2><p>Built into Reiya’s desktop workspace. No separate Premium app required.</p></div><div className="capabilities-grid">{[
['Account organization','Favorites, groups, account notes, card/list views, and bulk account actions.','Accounts'],
['Account health checks','Validate saved account sessions and review cookie health before launching.','Accounts / Settings'],
['Multi-instance sessions','Run multiple Roblox sessions and manage the multi-instance setting in your workspace.','Utilities / Settings'],
['Flexible launching','Launch multiple selected accounts. Save launch presets and target a place, server job, or private server.','Accounts / Home'],
['Games & servers','Search Roblox games, pin favorites, revisit recent games, and inspect available servers.','Utilities'],
['Launcher choice','Use Reiya, Official Roblox, Bloxstrap, Fishstrap, or the Windows protocol handler when available.','Bootstrapper'],
['FastFlags & versions','Edit client flags, browse presets, manage local Roblox versions, and check launch diagnostics.','Bootstrapper'],
['Session tracking','See live sessions, session history, recent activity, and event logs.','Home / Utilities'],
['Rejoin & alerts','Configure automatic rejoin delays and limits, notifications, and Discord alerts.','Settings'],
['Local vault & backups','Store encrypted credentials, optionally password-lock your vault, and export or import local account backups.','Accounts / Settings'],
['Themes & preferences','Light, dark, and seasonal looks, language settings, and workspace preferences.','Theme / Settings'],
['Discovery tools','Browse the Hub catalog and the script browser with search, sorting, and available risk information.','Hub / Script browser']
].map(([title,desc,source])=><article key={title}><span>{source}</span><h3>{title}</h3><p>{desc}</p></article>)}</div></section>
<section className="premium-showcase"><div className="premium-showcase-copy"><p className="eyebrow">OPTIONAL UPGRADE / REIYA PREMIUM</p><h2>Your whole workspace.<br/><span>A copy in the cloud.</span></h2><p>Back up the accounts and settings you’ve already organized. Restore your saved workspace on another computer using the same Premium key.</p><ul><li>Accounts, credentials, groups & notes</li><li>Games, history & app preferences</li><li>Settings & bootstrapper configuration</li></ul><Link to="/premium" className="premium-showcase-cta">Choose a Premium plan <span>↗</span></Link><p className="premium-price-note">€3/month or €30/year · Yearly saves €6</p></div><div className="backup-flow"><div className="backup-flow-header"><span>YOUR CLOUD PROFILE</span><b>One key. Up to 3 computers.</b></div><div className="backup-source"><img src="/logo.png" alt=""/><div><b>Your Reiya workspace</b><span>Accounts · Games · Settings</span></div><span>↑</span></div><div className="backup-link-line"><span>Encrypted backup</span></div><div className="backup-cloud"><span className="cloud-mark" aria-hidden="true">☁</span><div><h3>Ready when you need it.</h3><p>Up to five encrypted snapshots, kept for 15 days after upload.</p></div><span>✓</span></div><div className="backup-restore"><span>↓ Restore with your Premium key</span><div><span>Current computer</span><span>Another computer</span></div></div><p className="backup-flow-note">Free keeps working locally. Cloud features need an active Premium subscription.</p></div></section>
<section className="wrap download-section" id="download"><div><p className="eyebrow">REIYA FOR WINDOWS</p><h2>Your next session<br/>starts here.</h2></div><div><button className="button dark" onClick={download} disabled={downloading||!appVersion?.download_url}>{downloading?'Starting download…':appVersion===undefined?'Loading download…':'Download for Windows'} <DlIcon/></button><p className="micro">Free to use · Windows x64 {appVersion&&`· v${appVersion.version}`} {downloadCount!=null&&`· ${downloadCount.toLocaleString()} downloads`}</p>{appVersion===null&&<a className="release-link" href="https://github.com/Seisen-z/Key-System/releases">View releases ↗</a>}</div></section></main><SiteFooter/>{demoOpen&&<ProductDemoModal onClose={closeDemo}/>}</>;
}
