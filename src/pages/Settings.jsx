import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { getWallet } from '../api/endpoints';
import { useAuthStore } from '../store/auth';
import { money } from '../utils/format';

export default function Settings() {
  const navigate = useNavigate();
  const email = useAuthStore((s) => s.email);
  const userId = useAuthStore((s) => s.userId);
  const role = useAuthStore((s) => s.role);
  const logout = useAuthStore((s) => s.logout);

  const [walletBalance, setWalletBalance] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getWallet()
      .then((res) => { if (!cancelled) setWalletBalance(res.data.walletBalance); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Settings</h1>
          <p className="page-header__subtitle">Your account details.</p>
        </div>
      </div>

      <div className="settings-stack">
        <div className="card">
          <div className="card__label">Account</div>

          <div className="detail-row">
            <span>Email address</span>
            <span>{email}</span>
          </div>
          <div className="detail-row">
            <span>User ID</span>
            <span className="mono">{userId}</span>
          </div>
          <div className="detail-row">
            <span>Role</span>
            <span className={`pill ${role === 'ADMIN' ? 'pill--failed' : 'pill--neutral'}`}>
              {role || 'USER'}
            </span>
          </div>
        </div>

        <div className="card">
          <div className="card__label">Billing</div>

          <div className="detail-row">
            <span>Wallet balance</span>
            <span className="mono">{money(walletBalance)}</span>
          </div>

          <Link to="/wallet" className="btn btn--outline btn--sm" style={{ marginTop: 14 }}>
            Manage Wallet →
          </Link>
        </div>

        <div className="card">
          <div className="card__label">Session</div>
          <p className="field__hint" style={{ marginBottom: 14 }}>
            Signing out will clear your session on this device.
          </p>
          <button className="btn btn--danger" onClick={handleLogout}>Sign Out</button>
        </div>
      </div>
    </AppLayout>
  );
}
