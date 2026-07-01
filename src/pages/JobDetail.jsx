import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { getJob, getJobLogs, cancelJob } from '../api/endpoints';
import { money, duration, timeAgo, pillClass, priorityPillClass } from '../utils/format';

export default function JobDetail() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [logs, setLogs] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  const loadJob = async () => {
    try {
      const res = await getJob(jobId);
      setJob(res.data);
      return res.data;
    } catch (err) {
      setError('Job not found, or you do not have access to it.');
      return null;
    }
  };

  const loadLogs = async () => {
    try {
      const res = await getJobLogs(jobId);
      setLogs(res.data.logs || '');
    } catch (err) {
      // No logs yet is expected for CREATED/RUNNING jobs — not an error state
      setLogs('');
    }
  };

  useEffect(() => {
    let cancelled = false;
    let interval;

    async function init() {
      setLoading(true);
      const j = await loadJob();
      if (cancelled) return;

      if (j) {
        await loadLogs();

        // Poll while the job is still in-flight; stop once it settles
        if (j.status === 'CREATED' || j.status === 'RUNNING') {
          interval = setInterval(async () => {
            const updated = await loadJob();
            await loadLogs();
            if (updated && updated.status !== 'CREATED' && updated.status !== 'RUNNING') {
              clearInterval(interval);
            }
          }, 4000);
        }
      }
      setLoading(false);
    }

    init();
    return () => { cancelled = true; if (interval) clearInterval(interval); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const handleCancel = async () => {
    setCancelError('');
    setCancelling(true);
    try {
      await cancelJob(jobId);
      await loadJob();
    } catch (err) {
      setCancelError(err.response?.data?.message || 'Could not cancel this job.');
    } finally {
      setCancelling(false);
    }
  };

  const handleRerun = () => {
    if (!job) return;
    navigate(`/jobs/create?workerId=${job.targetWorkerId}`);
  };

  if (loading) {
    return (
      <AppLayout>
        <p className="empty-note">Loading job...</p>
      </AppLayout>
    );
  }

  if (error || !job) {
    return (
      <AppLayout>
        <div className="banner banner--error">{error}</div>
        <Link to="/jobs" className="btn btn--primary">Back to Jobs</Link>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="page-header__title mono" style={{ fontSize: 18 }}>{job.jobId}</h1>
          <p className="page-header__subtitle">{job.dockerImage}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {job.status === 'CREATED' && (
            <button className="btn btn--danger" onClick={handleCancel} disabled={cancelling}>
              {cancelling ? 'Cancelling...' : 'Cancel Job'}
            </button>
          )}
          <button className="btn btn--outline" onClick={handleRerun}>Re-run with same worker</button>
        </div>
      </div>

      {cancelError && <div className="banner banner--error">{cancelError}</div>}

      <div className="job-detail-layout">
        <div className="card">
          <div className="card__label">Job Details</div>

          <div className="detail-row">
            <span>Status</span>
            <span className={`pill pill--${pillClass(job.status)}`}>{job.status}</span>
          </div>
          <div className="detail-row">
            <span>Priority</span>
            <span className={`pill pill--${priorityPillClass(job.priority)}`}>{job.priority}</span>
          </div>
          <div className="detail-row">
            <span>Worker</span>
            <span className="mono">{job.targetWorkerId}</span>
          </div>
          <div className="detail-row">
            <span>Required CPU</span>
            <span className="mono">{job.requiredCpu} cores</span>
          </div>
          <div className="detail-row">
            <span>Required memory</span>
            <span className="mono">{job.requiredMemoryMB} MB</span>
          </div>
          <div className="detail-row">
            <span>GPU required</span>
            <span>{job.gpuRequired ? 'Yes' : 'No'}</span>
          </div>
          <div className="detail-row">
            <span>Max runtime</span>
            <span className="mono">{job.maxRuntimeSeconds}s</span>
          </div>
          <div className="detail-row">
            <span>Actual runtime</span>
            <span className="mono">{duration(job.durationMs)}</span>
          </div>
          <div className="detail-row">
            <span>Estimated cost</span>
            <span className="mono">{money(job.estimatedCost)}</span>
          </div>
          <div className="detail-row">
            <span>Actual cost</span>
            <span className="mono">{money(job.cost)}</span>
          </div>
          <div className="detail-row">
            <span>Created</span>
            <span>{timeAgo(job.createdAt)}</span>
          </div>
        </div>

        <div className="card card--terminal">
          <div className="terminal-header">
            <div className="card__label">Job Logs</div>
            <div className="terminal-dots">
              <span className="dot dot--red" />
              <span className="dot dot--yellow" />
              <span className="dot dot--green" />
            </div>
          </div>
          <pre className="terminal scroll-thin">
            {logs || (job.status === 'CREATED'
              ? 'Waiting for a worker to pick up this job...'
              : job.status === 'RUNNING'
                ? 'Job is running — logs will appear once it completes.'
                : 'No logs available for this job.')}
          </pre>
        </div>
      </div>
    </AppLayout>
  );
}
