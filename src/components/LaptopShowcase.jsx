// Static illustration of the Reiya desktop app. Everything shown is sample data; nothing here talks to the app or a backend.
const ACCOUNTS = [
  { name: 'SeisenMain', user: 'SeisenMain', color: '#457258', game: 'Example Obby', group: 'Main', fav: true, valid: true },
  { name: 'RobloxAlt01', user: 'RobloxAlt01', color: '#7c6b49', game: 'Example Roleplay', group: 'Alts', valid: true },
  { name: 'PlayerTwo', user: 'PlayerTwo', color: '#426c83', game: 'Example Obby', group: 'Alts', valid: false },
  { name: 'TestAccount', user: 'TestAccount', color: '#685b72', game: 'Example Roleplay', group: 'Alts', valid: true },
  { name: 'FarmAlt02', user: 'FarmAlt02', color: '#4f6a4a', game: 'Example Tycoon', group: 'Farming', valid: true },
  { name: 'BackupAcc', user: 'BackupAcc', color: '#76564f', game: 'Example Tycoon', group: 'Farming', valid: true },
  { name: 'NightOwl', user: 'NightOwl', color: '#5a6a85', game: 'Example Obby', group: 'Main', valid: true },
  { name: 'SideQuest', user: 'SideQuest', color: '#7d6a3f', game: 'Example Roleplay', group: 'Alts', valid: false },
  { name: 'ClayBuilder', user: 'ClayBuilder', color: '#4d7a6a', game: 'Example Tycoon', group: 'Farming', valid: true },
];
const NAV = ['Home', 'Accounts', 'Hub', 'Rscripts', 'Bootstrapper', 'Utilities', 'Premium', 'Theme', 'Settings'];
const validCount = ACCOUNTS.filter(a => a.valid).length;
const expiredCount = ACCOUNTS.length - validCount;

function Zap() {
  return <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M13 2 4 14h7l-1 8 9-12h-7z" /></svg>;
}

function Check() {
  return <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>;
}

function AppMock() {
  return (
    <div className="mock" aria-hidden="true">
      <aside className="mock-side">
        <div className="mock-brand"><span className="mock-logo">R</span><b>Reiya</b></div>
        {NAV.map(n => <span key={n} className={'mock-nav' + (n === 'Accounts' ? ' on' : '')}>{n}</span>)}
      </aside>
      <div className="mock-main">
        <div className="mock-head">
          <div>
            <b>Account Manager</b>
            <span><i>{ACCOUNTS.length}</i> total · <i className="g">{validCount}</i> valid · <i className="a">1</i> favorite</span>
          </div>
          <span className="mock-add">+ Add Account</span>
        </div>
        <div className="mock-tools">
          <span className="mock-search">Search by username or display name…</span>
          <span className="mock-tabs"><u className="on">All</u><u>Favorites</u><u>Valid</u></span>
        </div>
        <div className="mock-grid">
          {ACCOUNTS.map(a => (
            <div className={'mock-card' + (a.valid ? '' : ' off')} key={a.name}>
              <div className="mock-row">
                <span className="mock-av" style={{ background: a.color }}>{a.name[0]}<em className={a.valid ? 'ok' : 'bad'} /></span>
                <span className="mock-id"><b>{a.name}{a.fav && <s>★</s>}</b><small>@{a.user}</small></span>
                {a.valid ? <span className="mock-launch"><Zap /> Launch</span> : <span className="mock-exp">EXPIRED</span>}
              </div>
              <div className="mock-meta"><b>{a.group}</b> · {a.game}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LaptopShowcase() {
  return (
    <figure className="laptop-stage">
      <div className="float-card float-launch">
        <div className="float-top"><span className="float-icon"><Zap /></span><b>Bulk launch</b><small>Sample</small></div>
        <p>Launching 3 accounts, 4 seconds apart</p>
        <div className="float-faces">
          {ACCOUNTS.slice(0, 3).map((a, i) => <span key={a.name} style={{ background: a.color }} className={i === 0 ? 'done' : ''}>{a.name[0]}</span>)}
          <em>2 of 3 started</em>
        </div>
      </div>

      <div className="laptop">
        <div className="laptop-lid">
          <span className="laptop-cam" />
          <div className="laptop-screen" role="img" aria-label="The Reiya Accounts tab showing nine sample accounts, each with a status dot, last game and a Launch button">
            <AppMock />
          </div>
        </div>
        <div className="laptop-base" />
      </div>

      <div className="float-card float-health">
        <div className="float-top"><span className="float-icon ok"><Check /></span><b>Cookie check</b><small>Sample</small></div>
        <p><strong>{validCount} of {ACCOUNTS.length}</strong> accounts are valid</p>
        <div className="float-bar"><span style={{ width: Math.round(validCount / ACCOUNTS.length * 100) + '%' }} /></div>
        <p className="float-sub">{expiredCount} need{expiredCount === 1 ? 's' : ''} to log in again</p>
      </div>

      <figcaption>Illustration with sample accounts. Reiya runs on Windows.</figcaption>
    </figure>
  );
}
