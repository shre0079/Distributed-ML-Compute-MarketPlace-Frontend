import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/endpoints';
import { useAuthStore } from '../store/auth';

export default function Register() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!agreed) {
      setError('You must agree to the Terms of Service to continue.');
      return;
    }

    setLoading(true);
    try {
      const res = await register(email, password);
      setAuth(res.data);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <header className="auth-topbar">
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-mark">▌▌</span>
          DCM
        </Link>
        <nav className="auth-topbar__links">
          <Link to="/marketplace">Marketplace</Link>
        </nav>
        <div className="auth-topbar__right">
          <span className="auth-topbar__hint">Already have an account?</span>
          <Link to="/login" className="btn btn--outline btn--sm">Login</Link>
        </div>
      </header>

      <div className="auth-split">
        <div className="auth-split__left">
          <div className="auth-split__content">
            <div className="auth-feature__icon auth-feature__icon--lg">⚙️</div>
            <h1 className="auth-split__title">Join the Compute Network</h1>
            <p className="auth-split__desc">
              Access shared GPUs and CPUs to train your models, or register a
              machine as a provider and earn from idle compute.
            </p>

            <div className="auth-feature">
              <div className="auth-feature__icon">🛡️</div>
              <div>
                <div className="auth-feature__title">Encrypted Workloads</div>
                <div className="auth-feature__desc">Your datasets and models stay isolated per job.</div>
              </div>
            </div>

            <div className="auth-feature">
              <div className="auth-feature__icon">⚡</div>
              <div>
                <div className="auth-feature__title">Pick Your Provider</div>
                <div className="auth-feature__desc">Choose exactly who runs your job, by price and reputation.</div>
              </div>
            </div>

            <div className="auth-feature">
              <div className="auth-feature__icon">💳</div>
              <div>
                <div className="auth-feature__title">Pay Per Second</div>
                <div className="auth-feature__desc">No subscriptions — top up your wallet and go.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-split__right">
          <form className="auth-form" onSubmit={handleSubmit}>
            <h2 className="auth-form__title">Create Your Account</h2>
            <p className="auth-form__subtitle">Start training on the distributed grid today.</p>

            <div className="field">
              <label className="field__label" htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                className="field__input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="field__input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
              <p className="field__hint">Min 8 characters, letters and numbers only.</p>
            </div>

            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <span>
                I agree to the <Link to="/">Terms of Service</Link> and{' '}
                <Link to="/">Privacy Policy</Link>
              </span>
            </label>

            {error && <p className="field__error">{error}</p>}

            <button className="btn btn--primary btn--full" type="submit" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            <p className="auth-form__footer">
              Need help? <a href="mailto:support@dcm.local">Contact Support</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
