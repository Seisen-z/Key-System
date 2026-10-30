import {useState,useEffect} from 'react';
import {Link} from 'react-router-dom';
import {supabase} from '../lib/supabase';
import {SiteHeader,SiteFooter} from '../components/Site';
import LaptopShowcase from '../components/LaptopShowcase';
import Bento from '../components/Bento';
import PremiumHook from '../components/PremiumHook';
const DlIcon=()=> <span aria-hidden="true">↓</span>;
export default function Home() {
  const [appVersion,   setAppVersion]   = useState(undefined)
  const [downloading,  setDownloading]  = useState(false)
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

  return <><SiteHeader/><main className="green-home"><section className="play-hero" aria-label="Reiya Roblox account manager"><img className="play-hero-art" src="/reiya-roblox-hero.png" alt="A smiling Roblox-style avatar in green, surrounded by other account avatars in a floating game world" fetchPriority="high"/><div className="play-hero-copy"><p className="play-product-label">REIYA · ROBLOX ACCOUNT MANAGER</p><h1>Your accounts.<br/>Your next<br/><span>adventure.</span></h1><p className="play-description">Spend less time switching accounts.<br/>Keep your Roblox world in one place.</p><div className="play-actions"><button className="button dark" onClick={download} disabled={downloading||!appVersion?.download_url}>{downloading?'Starting download…':appVersion===undefined?'Loading download…':'Download for Windows'} <DlIcon/></button><button className="play-demo-button" onClick={()=>document.getElementById('features')?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})}>See the app <span>↓</span></button></div><p className="play-requirements">Free app · Windows x64 · No sign-up {appVersion&&`· v${appVersion.version}`}</p>{appVersion===null&&<a className="release-link" href="https://github.com/Seisen-z/Key-System/releases">Download unavailable. View releases ↗</a>}</div><div className="play-benefits"><div><b>Your accounts</b><span>Saved in an encrypted local vault</span></div><div><b>Your games</b><span>Favorites ready for your next session</span></div><div><b>Your setup</b><span>Settings, flags, and backups together</span></div></div></section>

<section className="feature-studio" id="features"><div className="studio-heading"><div><p className="eyebrow">INSIDE THE DESKTOP APP</p><h2>Not just an account list.<br/>Your Roblox control room.</h2></div><p>From your first launch to your last session, Reiya brings your accounts, games, and client tools together in one window.</p></div><LaptopShowcase/></section>
<Bento/>
<PremiumHook/>
<section className="wrap download-section" id="download"><div><p className="eyebrow">REIYA FOR WINDOWS</p><h2>Your next session<br/>starts here.</h2></div><div><button className="button dark" onClick={download} disabled={downloading||!appVersion?.download_url}>{downloading?'Starting download…':appVersion===undefined?'Loading download…':'Download for Windows'} <DlIcon/></button><p className="micro">Free to use · Windows x64 {appVersion&&`· v${appVersion.version}`} {downloadCount!=null&&`· ${downloadCount.toLocaleString()} downloads`}</p>{appVersion===null&&<a className="release-link" href="https://github.com/Seisen-z/Key-System/releases">View releases ↗</a>}</div></section></main><SiteFooter/></>;
}
