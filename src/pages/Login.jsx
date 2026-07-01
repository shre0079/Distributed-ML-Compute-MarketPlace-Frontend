import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api/endpoints';
import { useAuthStore } from '../store/auth';

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      setAuth(res.data);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Check your credentials.';
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
        <Link to="/register" className="btn btn--outline btn--sm">Sign Up</Link>
      </header>

      <div className="auth-split">
        <div className="auth-split__left">
          <div className="auth-split__content">
            <h1 className="auth-split__title">Access the Grid</h1>
            <p className="auth-split__desc">
              Log in to submit training jobs, browse compute providers, and
              track your active runs.
            </p>

            <div className="auth-feature">
              <div className="auth-feature__icon">🛡️</div>
              <div>
                <div className="auth-feature__title">Secure by Design</div>
                <div className="auth-feature__desc">Passwords are hashed, sessions use signed JWTs.</div>
              </div>
            </div>

            <div className="auth-feature">
              <div className="auth-feature__icon">📊</div>
              <div>
                <div className="auth-feature__title">Real-Time Tracking</div>
                <div className="auth-feature__desc">Watch your jobs run live from the dashboard.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-split__right">
          <form className="auth-form" onSubmit={handleSubmit}>
            <h2 className="auth-form__title">Welcome Back</h2>
            <p className="auth-form__subtitle">Enter your credentials to continue</p>

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
                autoComplete="current-password"
              />
            </div>

            {error && <p className="field__error">{error}</p>}

            <button className="btn btn--primary btn--full" type="submit" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In to Dashboard'}
            </button>

            <p className="auth-form__footer">
              Don't have an account? <Link to="/register">Get Started</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
