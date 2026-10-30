import { useState } from 'react';
import { Link } from 'react-router-dom';

// Interactive illustration. Sample accounts only; nothing here reads or sends real data.
const ACCOUNTS = [
  ['SeisenMain', '#457258'], ['RobloxAlt01', '#7c6b49'], ['PlayerTwo', '#426c83'], ['TestAccount', '#685b72'],
  ['FarmAlt02', '#4f6a4a'], ['BackupAcc', '#76564f'], ['NightOwl', '#5a6a85'], ['ClayBuilder', '#4d7a6a'],
];

export default function PremiumHook() {
  const [state, setState] = useState('ok'); // ok → crashed → restored
  const gone = state === 'crashed';
  const count = gone ? 0 : ACCOUNTS.length;

  return (
    <section className="hook" id="premium">
      <div className="hook-head">
        <p className="eyebrow">REIYA PREMIUM</p>
        <h2>What happens to your accounts if your PC dies tomorrow?</h2>
        <p>Reiya keeps them on this computer. Don’t take our word for it: press the button.</p>
        <ul className="hook-facts">
          <li>Encrypted cloud copy of your workspace</li>
          <li>One key restores it on up to 3 computers</li>
          <li>Up to 5 snapshots, kept 15 days</li>
        </ul>
        <div className="hook-cta">
          <Link to="/premium" className="hook-buy">Back up my accounts <span aria-hidden="true">↗</span></Link>
          <span>€3/month or €30/year · Yearly saves €6</span>
        </div>
      </div>

      <div className="hook-stage">
        <div className={'hook-window ' + state}>
          <div className="hook-bar">
            <b>Your Reiya workspace</b>
            <span>{count} account{count === 1 ? '' : 's'}</span>
          </div>
          <div className="hook-grid" aria-hidden="true">
            {ACCOUNTS.map(([name, color]) => (
              <div className="hook-acc" key={name}>
                <span style={{ background: color }}>{name[0]}</span>
                <small>{name}</small>
              </div>
            ))}
          </div>
          <div className="hook-msg" role="status" aria-live="polite">
            {state === 'ok' && <span>Everything is where you left it.</span>}
            {state === 'crashed' && <span><strong>0 accounts.</strong> Every login, group and note is gone.</span>}
            {state === 'restored' && <span><strong>All {ACCOUNTS.length} accounts are back.</strong> Restored from your Premium backup.</span>}
          </div>
        </div>

        <div className="hook-actions">
          {state === 'ok' && <button type="button" className="hook-crash" onClick={() => setState('crashed')}>Crash my PC</button>}
          {state === 'crashed' && (
            <>
              <button type="button" className="hook-restore" onClick={() => setState('restored')}>Restore with my Premium key</button>
              <Link to="/premium" className="hook-link">No backup, no accounts. Get Premium ↗</Link>
            </>
          )}
          {state === 'restored' && <button type="button" className="hook-reset" onClick={() => setState('ok')}>Run it again</button>}
          <small>Interactive illustration with sample accounts.</small>
        </div>
      </div>
    </section>
  );
}
