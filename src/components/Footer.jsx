import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <div className="navbar__logo">
            <span className="navbar__logo-mark">▌▌</span>
            DCM
          </div>
          <p className="footer__tagline">
            The distributed marketplace for machine learning compute.
            Train your models on shared GPUs, pay only for what you use.
          </p>
        </div>

        <div className="footer__col">
          <div className="footer__heading">Platform</div>
          <Link to="/marketplace">Marketplace</Link>
          <Link to="/download">Become a Provider</Link>
        </div>

        <div className="footer__col">
          <div className="footer__heading">Account</div>
          <Link to="/login">Log In</Link>
          <Link to="/register">Sign Up</Link>
          <Link to="/wallet">Wallet</Link>
        </div>

        <div className="footer__col">
          <div className="footer__heading">Connect</div>
          <a href="mailto:support@dcm.local">Email Support</a>
        </div>
      </div>

      <div className="container footer__bottom">
        <span>© 2026 DCM. All rights reserved.</span>
      </div>
    </footer>
  );
}
