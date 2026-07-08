import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import Pagination from '../components/Pagination';
import {
  adminGetStats, adminGetJobs, adminGetWorkers, adminGetUsers,
  adminGetWithdrawals, adminForceFailJob, adminBanWorker,
  adminApproveWithdrawal, adminRejectWithdrawal, adminGetAuditLog,
} from '../api/endpoints';
import { money, timeAgo, pillClass, priorityPillClass, truncateId } from '../utils/format';

const SECTIONS = ['STATS', 'JOBS', 'WORKERS', 'USERS', 'WITHDRAWALS', 'AUDIT LOG'];
const PAGE_SIZE = 20;

export default function Admin() {
  const navigate = useNavigate();
  const [section, setSection] = useState('STATS');

  const [stats, setStats] = useState(null);

  const [jobs, setJobs] = useState(null);
  const [jobsPage, setJobsPage] = useState(0);
  const [jobsTotalPages, setJobsTotalPages] = useState(0);
  const [jobsTotalElements, setJobsTotalElements] = useState(0);

  const [workers, setWorkers] = useState(null);
  const [workersPage, setWorkersPage] = useState(0);
  const [workersTotalPages, setWorkersTotalPages] = useState(0);
  const [workersTotalElements, setWorkersTotalElements] = useState(0);

  const [users, setUsers] = useState(null);
  const [usersPage, setUsersPage] = useState(0);
  const [usersTotalPages, setUsersTotalPages] = useState(0);
  const [usersTotalElements, setUsersTotalElements] = useState(0);

  // Withdrawals only ever returns PENDING items, which stays small in
  // practice — left as a single unpaginated fetch rather than adding
  // page controls for a list that's rarely more than a screenful.
  const [withdrawals, setWithdrawals] = useState(null);

  const [auditLog, setAuditLog] = useState(null);
  const [auditPage, setAuditPage] = useState(0);
  const [auditTotalPages, setAuditTotalPages] = useState(0);
  const [auditTotalElements, setAuditTotalElements] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actioningId, setActioningId] = useState(null);

  // Stats loads once, immediately, regardless of which tab is active.
  useEffect(() => {
    adminGetStats().then((res) => setStats(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  // Each paginated section refetches whenever ITS OWN page changes,
  // not just on tab switch — pagination replaces the earlier "cache on
  // first load" approach, since a per-page cache map would be overkill
  // at this stage.
  useEffect(() => {
    if (section !== 'JOBS') return;
    let ignore = false;
    setError('');
    adminGetJobs(jobsPage, PAGE_SIZE)
      .then((res) => {
        if (ignore) return;
        setJobs(res.data.content);
        setJobsTotalPages(res.data.totalPages);
        setJobsTotalElements(res.data.totalElements);
      })
      .catch(() => { if (!ignore) setError('Could not load jobs.'); });
    return () => { ignore = true; };
  }, [section, jobsPage]);

  useEffect(() => {
    if (section !== 'WORKERS') return;
    let ignore = false;
    setError('');
    adminGetWorkers(workersPage, PAGE_SIZE)
      .then((res) => {
        if (ignore) return;
        setWorkers(res.data.content);
        setWorkersTotalPages(res.data.totalPages);
        setWorkersTotalElements(res.data.totalElements);
      })
      .catch(() => { if (!ignore) setError('Could not load workers.'); });
    return () => { ignore = true; };
  }, [section, workersPage]);

  useEffect(() => {
    if (section !== 'USERS') return;
    let ignore = false;
    setError('');
    adminGetUsers(usersPage, PAGE_SIZE)
      .then((res) => {
        if (ignore) return;
        setUsers(res.data.content);
        setUsersTotalPages(res.data.totalPages);
        setUsersTotalElements(res.data.totalElements);
      })
      .catch(() => { if (!ignore) setError('Could not load users.'); });
    return () => { ignore = true; };
  }, [section, usersPage]);

  useEffect(() => {
    if (section !== 'WITHDRAWALS' || withdrawals !== null) return;
    let ignore = false;
    setError('');
    adminGetWithdrawals()
      .then((res) => { if (!ignore) setWithdrawals(res.data); })
      .catch(() => { if (!ignore) setError('Could not load withdrawals.'); });
    return () => { ignore = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  useEffect(() => {
    if (section !== 'AUDIT LOG') return;
    let ignore = false;
    setError('');
    adminGetAuditLog(auditPage, PAGE_SIZE)
      .then((res) => {
        if (ignore) return;
        setAuditLog(res.data.content);
        setAuditTotalPages(res.data.totalPages);
        setAuditTotalElements(res.data.totalElements);
      })
      .catch(() => { if (!ignore) setError('Could not load the audit log.'); });
    return () => { ignore = true; };
  }, [section, auditPage]);

  const handleForceFail = async (jobId) => {
    setActioningId(jobId);
    try {
      await adminForceFailJob(jobId);
      const res = await adminGetJobs(jobsPage, PAGE_SIZE);
      setJobs(res.data.content);
      setJobsTotalPages(res.data.totalPages);
      setJobsTotalElements(res.data.totalElements);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not force-fail this job.');
    } finally {
      setActioningId(null);
    }
  };

  const handleBan = async (workerId) => {
    setActioningId(workerId);
    try {
      await adminBanWorker(workerId);
      const res = await adminGetWorkers(workersPage, PAGE_SIZE);
      setWorkers(res.data.content);
      setWorkersTotalPages(res.data.totalPages);
      setWorkersTotalElements(res.data.totalElements);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not ban this worker.');
    } finally {
      setActioningId(null);
    }
  };

  const handleApprove = async (id) => {
    setActioningId(id);
    try {
      await adminApproveWithdrawal(id);
      const res = await adminGetWithdrawals();
      setWithdrawals(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not approve this withdrawal.');
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (id) => {
    setActioningId(id);
    try {
      await adminRejectWithdrawal(id, 'Rejected via admin panel');
      const res = await adminGetWithdrawals();
      setWithdrawals(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reject this withdrawal.');
    } finally {
      setActioningId(null);
    }
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Admin Panel</h1>
          <p className="page-header__subtitle">Platform oversight and controls.</p>
        </div>
      </div>

      <div className="tab-row">
        {SECTIONS.map((s) => (
          <button
            key={s}
            className={`tab ${section === s ? 'tab--active' : ''}`}
            onClick={() => setSection(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {error && <div className="banner banner--error">{error}</div>}

      {section === 'STATS' && (
        loading ? <p className="empty-note">Loading...</p> : stats && (
          <div className="admin-stats">
            <div className="card">
              <div className="card__label">Workers</div>
              <div className="admin-stat-row"><span>Total</span><span className="mono">{stats.workers.total}</span></div>
              <div className="admin-stat-row"><span>Online</span><span className="mono" style={{ color: 'var(--teal)' }}>{stats.workers.online}</span></div>
              <div className="admin-stat-row"><span>Offline</span><span className="mono">{stats.workers.offline}</span></div>
            </div>

            <div className="card">
              <div className="card__label">Jobs</div>
              <div className="admin-stat-row"><span>Total</span><span className="mono">{stats.jobs.total}</span></div>
              <div className="admin-stat-row"><span>Running</span><span className="mono">{stats.jobs.running}</span></div>
              <div className="admin-stat-row"><span>Pending</span><span className="mono">{stats.jobs.pending}</span></div>
              <div className="admin-stat-row"><span>Success</span><span className="mono" style={{ color: 'var(--teal)' }}>{stats.jobs.success}</span></div>
              <div className="admin-stat-row"><span>Failed</span><span className="mono" style={{ color: 'var(--rust)' }}>{stats.jobs.failed}</span></div>
            </div>

            <div className="card">
              <div className="card__label">Financials</div>
              <div className="admin-stat-row"><span>Platform revenue</span><span className="mono">{money(stats.financials.totalPlatformRevenue)}</span></div>
              <div className="admin-stat-row"><span>Worker payouts</span><span className="mono">{money(stats.financials.totalWorkerPayouts)}</span></div>
            </div>
          </div>
        )
      )}

      {section === 'JOBS' && (
        <>
          <div className="card" style={{ padding: 0 }}>
            {jobs === null ? <p className="empty-note" style={{ padding: 24 }}>Loading...</p> : jobs.length === 0 ? (
              <div className="table__empty" style={{ padding: '48px 20px' }}>No jobs on the platform yet.</div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Job</th><th>User</th><th>Image</th><th>Status</th><th>Priority</th><th>Cost</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.jobId}>
                      <td className="mono" style={{ cursor: 'pointer' }} onClick={() => navigate(`/jobs/${job.jobId}`)}>{truncateId(job.jobId)}</td>
                      <td className="mono">{truncateId(job.userId, 10)}</td>
                      <td>{job.dockerImage}</td>
                      <td><span className={`pill pill--${pillClass(job.status)}`}>{job.status}</span></td>
                      <td><span className={`pill pill--${priorityPillClass(job.priority)}`}>{job.priority}</span></td>
                      <td className="mono">{money(job.cost ?? job.estimatedCost)}</td>
                      <td>
                        {(job.status !== 'SUCCESS' && job.status !== 'FAILED') && (
                          <button
                            className="btn btn--danger btn--sm"
                            disabled={actioningId === job.jobId}
                            onClick={(e) => { e.stopPropagation(); handleForceFail(job.jobId); }}
                          >
                            {actioningId === job.jobId ? '...' : 'Force Fail'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <Pagination page={jobsPage} totalPages={jobsTotalPages} totalElements={jobsTotalElements} onChange={setJobsPage} />
        </>
      )}

      {section === 'WORKERS' && (
        <>
          <div className="card" style={{ padding: 0 }}>
            {workers === null ? <p className="empty-note" style={{ padding: 24 }}>Loading...</p> : workers.length === 0 ? (
              <div className="table__empty" style={{ padding: '48px 20px' }}>No workers registered yet.</div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Worker</th><th>Specs</th><th>Reputation</th><th>Earned</th><th>Last seen</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {workers.map((w) => (
                    <tr key={w.workerId}>
                      <td className="mono">{truncateId(w.workerId, 16)}</td>
                      <td>{w.cpuCores} cores · {w.memoryMB ? (w.memoryMB / 1024).toFixed(0) : '—'} GB{w.hasGpu ? ' · GPU' : ''}</td>
                      <td className="mono">{(w.reputation ?? 0).toFixed(0)}/100</td>
                      <td className="mono">{money(w.totalEarned)}</td>
                      <td>{timeAgo(w.lastSeen)}</td>
                      <td>
                        <button
                          className="btn btn--danger btn--sm"
                          disabled={actioningId === w.workerId}
                          onClick={() => handleBan(w.workerId)}
                        >
                          {actioningId === w.workerId ? '...' : 'Ban'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <Pagination page={workersPage} totalPages={workersTotalPages} totalElements={workersTotalElements} onChange={setWorkersPage} />
        </>
      )}

      {section === 'USERS' && (
        <>
          <div className="card" style={{ padding: 0 }}>
            {users === null ? <p className="empty-note" style={{ padding: 24 }}>Loading...</p> : users.length === 0 ? (
              <div className="table__empty" style={{ padding: '48px 20px' }}>No users yet.</div>
            ) : (
              <table className="table">
                <thead>
                  <tr><th>User ID</th><th>Email</th><th>Wallet Balance</th><th>Role</th></tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.userId} style={{ cursor: 'default' }}>
                      <td className="mono">{truncateId(u.userId, 10)}</td>
                      <td>{u.email}</td>
                      <td className="mono">{money(u.walletBalance)}</td>
                      <td><span className={`pill ${u.role === 'ADMIN' ? 'pill--failed' : 'pill--neutral'}`}>{u.role}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <Pagination page={usersPage} totalPages={usersTotalPages} totalElements={usersTotalElements} onChange={setUsersPage} />
        </>
      )}

      {section === 'WITHDRAWALS' && (
        <div className="card" style={{ padding: 0 }}>
          {withdrawals === null ? <p className="empty-note" style={{ padding: 24 }}>Loading...</p> : withdrawals.length === 0 ? (
            <div className="table__empty" style={{ padding: '48px 20px' }}>No pending withdrawals.</div>
          ) : (
            <table className="table">
              <thead>
                <tr><th>Worker</th><th>Amount</th><th>Requested</th><th></th></tr>
              </thead>
              <tbody>
                {withdrawals.map((w) => (
                  <tr key={w.withdrawalId} style={{ cursor: 'default' }}>
                    <td className="mono">{truncateId(w.workerId, 16)}</td>
                    <td className="mono">{money(w.amount)}</td>
                    <td>{timeAgo(w.requestedAt)}</td>
                    <td style={{ display: 'flex', gap: 8 }}>
                      <button
                        className="btn btn--primary btn--sm"
                        disabled={actioningId === w.withdrawalId}
                        onClick={() => handleApprove(w.withdrawalId)}
                      >
                        Approve
                      </button>
                      <button
                        className="btn btn--outline btn--sm"
                        disabled={actioningId === w.withdrawalId}
                        onClick={() => handleReject(w.withdrawalId)}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {section === 'AUDIT LOG' && (
        <>
          <div className="card" style={{ padding: 0 }}>
            {auditLog === null ? <p className="empty-note" style={{ padding: 24 }}>Loading...</p> : auditLog.length === 0 ? (
              <div className="table__empty" style={{ padding: '48px 20px' }}>No admin actions recorded yet.</div>
            ) : (
              <table className="table">
                <thead>
                  <tr><th>Admin</th><th>Action</th><th>Target</th><th>Details</th><th>When</th></tr>
                </thead>
                <tbody>
                  {auditLog.map((entry) => (
                    <tr key={entry.auditId} style={{ cursor: 'default' }}>
                      <td className="mono">{truncateId(entry.adminUserId, 10)}</td>
                      <td><span className="pill pill--neutral">{entry.action}</span></td>
                      <td className="mono">{truncateId(entry.targetId, 16)}</td>
                      <td>{entry.details || '—'}</td>
                      <td>{timeAgo(entry.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <Pagination page={auditPage} totalPages={auditTotalPages} totalElements={auditTotalElements} onChange={setAuditPage} />
        </>
      )}
    </AppLayout>
  );
}
