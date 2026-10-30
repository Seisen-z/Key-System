// Home page feature section. Illustrations use sample data only.
const SQUAD = [
  { name: 'SeisenMain', color: '#457258', note: 'In game', pct: 100, state: 'done' },
  { name: 'RobloxAlt01', color: '#7c6b49', note: 'Launching…', pct: 62, state: 'live' },
  { name: 'FarmAlt02', color: '#4f6a4a', note: 'Next in 4s', pct: 8, state: 'wait' },
];
const LAUNCHERS = ['Reiya', 'Official Roblox', 'Bloxstrap', 'Fishstrap', 'Windows protocol'];
const GROUPS = ['Main', 'Alts', 'Farming'];

function Ring({ value, total }) {
  const r = 38, c = 2 * Math.PI * r, dash = (value / total) * c;
  return (
    <svg className="bento-ring" viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r={r} className="ring-track" />
      <circle cx="50" cy="50" r={r} className="ring-fill" strokeDasharray={`${dash} ${c - dash}`} transform="rotate(-90 50 50)" />
      <text x="50" y="55" textAnchor="middle">{value}/{total}</text>
    </svg>
  );
}

export default function Bento() {
  return (
    <section className="bento-section" id="details">
      <div className="bento-head">
        <p className="eyebrow">WHAT’S INSIDE</p>
        <h2>Run ten accounts<br />like they’re one.</h2>
        <p>Launch, check, organize and protect every Roblox login from a single window.</p>
      </div>

      <div className="bento">
        <article className="bento-tile bento-hero">
          <span className="bento-tag">Flexible launching</span>
          <h3>Launch the whole squad with one click.</h3>
          <p>Select your accounts, pick a place or a private server, and Reiya starts them one after another. Save the setup as a preset for next time.</p>
          <ul className="bento-queue" aria-label="Sample launch queue">
            {SQUAD.map(a => (
              <li key={a.name} className={a.state}>
                <span className="q-av" style={{ background: a.color }}>{a.name[0]}</span>
                <span className="q-name">{a.name}</span>
                <span className="q-note">{a.note}</span>
                <span className="q-bar"><i style={{ width: a.pct + '%' }} /></span>
              </li>
            ))}
          </ul>
        </article>

        <article className="bento-tile bento-health">
          <span className="bento-tag">Account health</span>
          <Ring value={7} total={9} />
          <h3>Know which logins still work.</h3>
          <p>Check every saved session before you launch. Expired ones are flagged up front, not discovered mid-game.</p>
        </article>

        <article className="bento-tile bento-org">
          <span className="bento-tag">Organization</span>
          <h3>Find any account in a second.</h3>
          <p>Groups, favorites, notes, tags and bulk edits across as many accounts as you like.</p>
          <div className="bento-chips">
            {GROUPS.map(g => <span key={g}>{g}</span>)}
            <span className="star">★ Favorites</span>
            <span>#farming</span>
          </div>
        </article>

        <article className="bento-tile bento-launcher">
          <span className="bento-tag">Launcher choice</span>
          <h3>Bring your own launcher.</h3>
          <div className="bento-chips">
            {LAUNCHERS.map((l, i) => <span key={l} className={i === 0 ? 'on' : ''}>{l}</span>)}
          </div>
        </article>

        <article className="bento-tile bento-rejoin">
          <span className="bento-tag">Stays on top of it</span>
          <h3>Dropped? It rejoins.</h3>
          <p>Set your own rejoin delay and limit, get Discord alerts, and see live sessions and history.</p>
        </article>

        <article className="bento-tile bento-vault">
          <span className="bento-tag">Local vault</span>
          <h3>Locked down by default.</h3>
          <p>Credentials are encrypted on your PC, with an optional password lock and local backups.</p>
        </article>
      </div>

      <p className="bento-more"><b>Also inside:</b> multi-instance sessions · FastFlags &amp; Roblox versions · game and server search · script browser · themes</p>
    </section>
  );
}
