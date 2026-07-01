import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { getWallet, getMyJobs } from '../api/endpoints';
import { useAuthStore } from '../store/auth';
import { money, timeAgo, pillClass, truncateId } from '../utils/format';

export default function Dashboard() {
  const navigate = useNavigate();
  const email = useAuthStore((s) => s.email);
  const setWalletBalance = useAuthStore((s) => s.setWalletBalance);

  const [wallet, setWallet] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [walletRes, jobsRes] = await Promise.all([getWallet(), getMyJobs()]);
        if (cancelled) return;

        setWallet(walletRes.data);
        setWalletBalance(walletRes.data.walletBalance);

        // Newest first
        const sorted = [...jobsRes.data].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setJobs(sorted);
      } catch (err) {
        if (!cancelled) setError('Could not load your dashboard. Is the backend running?');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [setWalletBalance]);

  const activeCount = jobs.filter((j) => j.status === 'CREATED' || j.status === 'RUNNING').length;
  const recentJobs = jobs.slice(0, 5);

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Welcome back</h1>
          <p className="page-header__subtitle">{email}</p>
        </div>
        <Link to="/marketplace" className="btn btn--primary">Browse Marketplace</Link>
      </div>

      {error && <div className="banner banner--error">{error}</div>}

      {loading ? (
        <p className="empty-note">Loading your dashboard...</p>
      ) : (
        <>
          <div className="stat-grid">
            <div className="card stat-card">
              <div className="card__label">Wallet Balance</div>
              <div className="stat-card__value">{money(wallet?.walletBalance)}</div>
              <Link to="/wallet" className="btn btn--outline btn--sm" style={{ marginTop: 12 }}>
                Add Funds
              </Link>
            </div>

            <div className="card stat-card">
              <div className="card__label">Active Jobs</div>
              <div className="stat-card__value">{activeCount}</div>
              <p className="stat-card__hint">Currently created or running</p>
            </div>

            <div className="card stat-card">
              <div className="card__label">Total Jobs</div>
              <div className="stat-card__value">{jobs.length}</div>
              <p className="stat-card__hint">Submitted since you joined</p>
            </div>
          </div>

          <div className="section-title-row">
            <h2 className="section-title-row__title">Recent Jobs</h2>
            {jobs.length > 0 && <Link to="/jobs" className="section-title-row__link">View all →</Link>}
          </div>

          <div className="card" style={{ padding: 0 }}>
            {recentJobs.length === 0 ? (
              <div className="table__empty" style={{ padding: '48px 20px' }}>
                You haven't submitted any jobs yet.
                <div style={{ marginTop: 14 }}>
                  <Link to="/marketplace" className="btn btn--primary btn--sm">Browse Marketplace</Link>
                </div>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Job</th>
                    <th>Image</th>
                    <th>Status</th>
                    <th>Cost</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {recentJobs.map((job) => (
                    <tr key={job.jobId} onClick={() => navigate(`/jobs/${job.jobId}`)}>
                      <td className="mono">{truncateId(job.jobId)}</td>
                      <td>{job.dockerImage}</td>
                      <td><span className={`pill pill--${pillClass(job.status)}`}>{job.status}</span></td>
                      <td className="mono">{money(job.cost ?? job.estimatedCost)}</td>
                      <td>{timeAgo(job.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </AppLayout>
  );
}
