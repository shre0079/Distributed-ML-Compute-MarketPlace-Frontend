import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { logoutRequest } from '../api/endpoints';

export default function Navbar() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const role = useAuthStore((s) => s.role);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    try {
      await logoutRequest();
    } catch (err) {
      // Even if this fails (e.g. token already expired), still clear
      // local state — the user's intent is to be logged out either way.
    }
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-mark">▌▌</span>
          DCM
        </Link>

        <nav className="navbar__links">
          <Link to="/marketplace">Marketplace</Link>
          <Link to="/jobs">Jobs</Link>
          <Link to="/wallet">Wallet</Link>
          {role === 'ADMIN' && <Link to="/admin">Admin</Link>}
        </nav>

        <div className="navbar__actions">
          {token ? (
            <>
              <Link to="/settings" className="btn btn--ghost btn--sm">Settings</Link>
              <button className="btn btn--outline btn--sm" onClick={handleLogout}>Log Out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn--ghost btn--sm">Log In</Link>
              <Link to="/register" className="btn btn--primary btn--sm">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
