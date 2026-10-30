import {Link,useLocation} from 'react-router-dom';

const DISCORD = 'https://discord.gg/F4sAf6z8Ph';

export function SiteHeader() {
  const path = useLocation().pathname;
  const page = id => (path === id ? 'page' : undefined);
  return (
    <header className="site-nav">
      <div className="nav-pill">
        <Link to="/" className="brand" aria-label="Reiya home"><img src="/logo.png" alt="" /><span>Reiya</span></Link>
        <nav className="nav-main" aria-label="Main">
          <Link to="/" aria-current={page('/')}>Overview</Link>
          <a href="/#features">Features</a>
          <Link to="/premium" aria-current={page('/premium')}>Premium</Link>
          <Link to="/changelog" aria-current={page('/changelog')}>Changelog</Link>
        </nav>
        <div className="nav-actions">
          <a className="nav-community" href={DISCORD} target="_blank" rel="noreferrer">Community ↗</a>
          <a className="nav-cta" href="/#download">Download</a>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-card">
        <div className="footer-brand">
          <Link className="brand" to="/" aria-label="Reiya home"><img src="/logo.png" alt="" /><span>Reiya</span></Link>
          <p>Your accounts. Your games. Your way.</p>
          <a className="nav-cta" href="/#download">Download for Windows</a>
        </div>
        <nav className="footer-col" aria-label="Product">
          <h3>Product</h3>
          <Link to="/">Overview</Link>
          <a href="/#features">Features</a>
          <Link to="/premium">Premium</Link>
          <Link to="/changelog">Changelog</Link>
        </nav>
        <nav className="footer-col" aria-label="Help">
          <h3>Help</h3>
          <Link to="/my-premium">My account</Link>
          <Link to="/legal/support">Support</Link>
          <a href={DISCORD} target="_blank" rel="noreferrer">Community ↗</a>
        </nav>
        <nav className="footer-col" aria-label="Legal">
          <h3>Legal</h3>
          <Link to="/legal/terms">Terms</Link>
          <Link to="/legal/privacy">Privacy</Link>
          <Link to="/legal/refunds">Refunds &amp; Cancellation</Link>
        </nav>
        <p className="footer-fine">Windows desktop app · Not affiliated with Roblox Corporation.</p>
      </div>
    </footer>
  );
}

export function Check() { return <span className="check" aria-hidden="true">✓</span>; }
