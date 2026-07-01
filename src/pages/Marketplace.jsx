import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { getWorkers } from '../api/endpoints';
import { money, truncateId } from '../utils/format';

const SORT_OPTIONS = [
  { value: 'reputation', label: 'Reputation (highest first)' },
  { value: 'price', label: 'Price (cheapest first)' },
  { value: 'jobs', label: 'Most jobs completed' },
];

export default function Marketplace() {
  const navigate = useNavigate();

  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [gpuOnly, setGpuOnly] = useState(false);
  const [onlineOnly, setOnlineOnly] = useState(true);
  const [sortBy, setSortBy] = useState('reputation');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await getWorkers();
        if (!cancelled) setWorkers(res.data);
      } catch (err) {
        if (!cancelled) setError('Could not load the marketplace. Is the backend running?');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    const interval = setInterval(load, 15000); // keep online status reasonably fresh
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  const filtered = useMemo(() => {
    let list = [...workers];

    if (gpuOnly) list = list.filter((w) => w.hasGpu);
    if (onlineOnly) list = list.filter((w) => w.online);

    list.sort((a, b) => {
      if (sortBy === 'reputation') return (b.reputation ?? 0) - (a.reputation ?? 0);
      if (sortBy === 'price') return (a.cpuRatePerSecond ?? Infinity) - (b.cpuRatePerSecond ?? Infinity);
      if (sortBy === 'jobs') return (b.completedJobs ?? 0) - (a.completedJobs ?? 0);
      return 0;
    });

    // Online workers always float above offline ones regardless of sort,
    // unless the user has already filtered to online-only.
    if (!onlineOnly) {
      list.sort((a, b) => (b.online === a.online ? 0 : b.online ? 1 : -1));
    }

    return list;
  }, [workers, gpuOnly, onlineOnly, sortBy]);

  const onlineCount = workers.filter((w) => w.online).length;
  const gpuCount = workers.filter((w) => w.hasGpu && w.online).length;

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Marketplace</h1>
          <p className="page-header__subtitle">Browse available workers and pick one to run your job.</p>
        </div>
      </div>

      <div className="marketplace-stats">
        <div className="marketplace-stat">
          <div className="marketplace-stat__value">{onlineCount}</div>
          <div className="marketplace-stat__label">Online now</div>
        </div>
        <div className="marketplace-stat">
          <div className="marketplace-stat__value">{gpuCount}</div>
          <div className="marketplace-stat__label">GPU workers online</div>
        </div>
        <div className="marketplace-stat">
          <div className="marketplace-stat__value">{workers.length}</div>
          <div className="marketplace-stat__label">Total registered</div>
        </div>
      </div>

      {error && <div className="banner banner--error">{error}</div>}

      <div className="marketplace-layout">
        <aside className="card marketplace-filters">
          <div className="card__label">Filters</div>

          <label className="checkbox-row">
            <input type="checkbox" checked={onlineOnly} onChange={(e) => setOnlineOnly(e.target.checked)} />
            <span>Online only</span>
          </label>

          <label className="checkbox-row">
            <input type="checkbox" checked={gpuOnly} onChange={(e) => setGpuOnly(e.target.checked)} />
            <span>GPU workers only</span>
          </label>

          <div className="field" style={{ marginTop: 16, marginBottom: 0 }}>
            <label className="field__label" htmlFor="sort">Sort by</label>
            <select
              id="sort"
              className="field__select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </aside>

        <div className="marketplace-results">
          {loading ? (
            <p className="empty-note">Loading workers...</p>
          ) : filtered.length === 0 ? (
            <div className="card table__empty" style={{ padding: '48px 20px' }}>
              No workers match your filters right now.
            </div>
          ) : (
            <div className="worker-grid">
              {filtered.map((w) => (
                <div key={w.workerId} className={`card worker-card ${!w.online ? 'worker-card--offline' : ''}`}>
                  <div className="worker-card__top">
                    <span className={`worker-card__status ${w.online ? 'online' : ''}`}>
                      <span className="dot" /> {w.online ? 'ONLINE' : 'OFFLINE'}
                    </span>
                    <span className="worker-card__rep">★ {(w.reputation ?? 0).toFixed(0)}/100</span>
                  </div>

                  <div className="worker-card__id mono">{truncateId(w.workerId, 16)}</div>
                  <div className="worker-card__specs">
                    {w.os} · {w.cpuCores} cores · {w.memoryMB ? (w.memoryMB / 1024).toFixed(0) : '—'} GB
                  </div>
                  <div className="worker-card__gpu">
                    GPU: {w.hasGpu ? '✓ Available' : '✗ None'}
                  </div>

                  <div className="worker-card__prices">
                    <div>
                      <span className="worker-card__price-label">CPU</span>
                      <span className="mono">{money(w.cpuRatePerSecond)}/s</span>
                    </div>
                    <div>
                      <span className="worker-card__price-label">GPU</span>
                      <span className="mono">{money(w.gpuRatePerSecond)}/s</span>
                    </div>
                  </div>

                  <div className="worker-card__footer">
                    <span className="worker-card__jobs">{w.completedJobs ?? 0} jobs completed</span>
                    <button
                      className="btn btn--primary btn--sm"
                      disabled={!w.online}
                      onClick={() => navigate(`/jobs/create?workerId=${w.workerId}`)}
                    >
                      Submit a Job →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
