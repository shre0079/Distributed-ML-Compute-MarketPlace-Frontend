import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import Pagination from '../components/Pagination';
import { getMyJobs, getMyJobsByStatus } from '../api/endpoints';
import { money, timeAgo, pillClass, priorityPillClass, truncateId } from '../utils/format';

const TABS = ['ALL', 'CREATED', 'RUNNING', 'SUCCESS', 'FAILED', 'TIMEOUT', 'CANCELLED', 'EXPIRED'];
const PAGE_SIZE = 20;

export default function Jobs() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ALL');
  const [page, setPage] = useState(0);

  const [jobs, setJobs] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Switching tabs always resets back to page 0 — staying on e.g. page 3
  // of a filter you just left would be confusing.
  useEffect(() => {
    setPage(0);
  }, [activeTab]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    async function load() {
      try {
        const res = activeTab === 'ALL'
          ? await getMyJobs(page, PAGE_SIZE)
          : await getMyJobsByStatus(activeTab, page, PAGE_SIZE);

        if (cancelled) return;
        setJobs(res.data.content);
        setTotalPages(res.data.totalPages);
        setTotalElements(res.data.totalElements);
      } catch (err) {
        if (!cancelled) setError('Could not load jobs.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [activeTab, page]);

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="page-header__title">My Jobs</h1>
          <p className="page-header__subtitle">Everything you've submitted to the grid.</p>
        </div>
        <Link to="/marketplace" className="btn btn--primary">Submit a Job</Link>
      </div>

      <div className="tab-row">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'tab--active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {error && <div className="banner banner--error">{error}</div>}

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <p className="empty-note" style={{ padding: 24 }}>Loading...</p>
        ) : jobs.length === 0 ? (
          <div className="table__empty" style={{ padding: '48px 20px' }}>
            No jobs found for this filter.
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Job</th>
                <th>Image</th>
                <th>Worker</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Cost</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.jobId} onClick={() => navigate(`/jobs/${job.jobId}`)}>
                  <td className="mono">{truncateId(job.jobId)}</td>
                  <td>{job.dockerImage}</td>
                  <td className="mono">{truncateId(job.targetWorkerId, 12)}</td>
                  <td><span className={`pill pill--${pillClass(job.status)}`}>{job.status}</span></td>
                  <td><span className={`pill pill--${priorityPillClass(job.priority)}`}>{job.priority}</span></td>
                  <td className="mono">{money(job.cost ?? job.estimatedCost)}</td>
                  <td>{timeAgo(job.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} totalElements={totalElements} onChange={setPage} />
    </AppLayout>
  );
}
