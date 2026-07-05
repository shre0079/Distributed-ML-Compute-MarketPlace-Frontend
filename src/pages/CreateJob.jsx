import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { getWorker, getWallet, uploadFile, createJob } from '../api/endpoints';
import { money } from '../utils/format';
import { PRIORITY_OPTIONS, estimateCost } from '../utils/pricing';

const RUNTIME_PRESETS = [
  { label: '1 min', seconds: 60 },
  { label: '5 min', seconds: 300 },
  { label: '30 min', seconds: 1800 },
  { label: '1 hour', seconds: 3600 },
  { label: '6 hours', seconds: 21600 },
];

export default function CreateJob() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const workerId = searchParams.get('workerId');

  const [worker, setWorker] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [dockerImage, setDockerImage] = useState('');
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const [requiredCpu, setRequiredCpu] = useState(1);
  const [requiredMemoryMB, setRequiredMemoryMB] = useState(256);
  const [gpuRequired, setGpuRequired] = useState(false);
  const [maxRuntimeSeconds, setMaxRuntimeSeconds] = useState(300);
  const [priority, setPriority] = useState('NORMAL');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');



  useEffect(() => {
    if (!workerId) {
      setLoadError('No worker selected. Pick one from the marketplace first.');
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const [workerRes, walletRes] = await Promise.all([getWorker(workerId), getWallet()]);
        if (cancelled) return;
        setWorker(workerRes.data);
        setWalletBalance(walletRes.data.walletBalance);
        setRequiredCpu(1);
      } catch (err) {
        if (!cancelled) setLoadError('Could not find that worker. It may have been deregistered.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [workerId]);

  const handleFileChange = async (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setFileUrl('');
    setUploadError('');
    setUploading(true);

    try {
      const res = await uploadFile(selected);
      setFileUrl(res.data); // backend returns the URL as a plain string
    } catch (err) {
      setUploadError('Upload failed. Please try again.');
      setFile(null);
    } finally {
      setUploading(false);
    }
  };

  const rate = worker ? (gpuRequired ? worker.gpuRatePerSecond : worker.cpuRatePerSecond) : 0;
  const estimate = estimateCost(maxRuntimeSeconds, rate, priority);
  const insufficientBalance = walletBalance !== null && estimate > walletBalance;

  const canSubmit =
    worker && worker.online && dockerImage.trim() && fileUrl &&
    requiredCpu >= 1 && requiredMemoryMB >= 128 &&
    maxRuntimeSeconds >= 1 && !insufficientBalance && !submitting && !uploading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitting(true);

    try {
        const res = await createJob({
            dockerImage: dockerImage.trim(),
            fileUrl,
            requiredCpu: Number(requiredCpu),
            requiredMemoryMB: Number(requiredMemoryMB),
            gpuRequired,
            networkRequired,   // ← new
            maxRuntimeSeconds: Number(maxRuntimeSeconds),
            targetWorkerId: workerId,
            priority,
        });
      navigate(`/jobs/${res.data.jobId}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not create the job. Please try again.';
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <p className="empty-note">Loading...</p>
      </AppLayout>
    );
  }

  if (loadError) {
    return (
      <AppLayout>
        <div className="banner banner--error">{loadError}</div>
        <Link to="/marketplace" className="btn btn--primary">Go to Marketplace</Link>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Submit a Job</h1>
          <p className="page-header__subtitle">Targeting worker {worker.workerId}</p>
        </div>
        <Link to="/marketplace" className="btn btn--ghost btn--sm">← Change worker</Link>
      </div>

      {!worker.online && (
        <div className="banner banner--error">
          This worker just went offline. Go back and pick another one.
        </div>
      )}

      <div className="create-job-layout">
        <form className="card" onSubmit={handleSubmit}>
          <div className="field">
            <label className="field__label" htmlFor="dockerImage">Docker Image</label>
            <input
              id="dockerImage"
              className="field__input mono"
              placeholder="e.g. hello-world, pytorch/pytorch:latest"
              value={dockerImage}
              onChange={(e) => setDockerImage(e.target.value)}
              required
            />
              <p className="field__hint">
                  Your training script reads data from <code>/input</code> (read-only) and
                  writes results to <code>/output</code>.
              </p>
          </div>

          <div className="field">
            <label className="field__label" htmlFor="dataset">Dataset</label>
            <input id="dataset" type="file" className="field__input" onChange={handleFileChange} />
            {uploading && <p className="field__hint">Uploading...</p>}
            {fileUrl && !uploading && <p className="field__hint" style={{ color: 'var(--teal)' }}>✓ {file?.name} uploaded</p>}
            {uploadError && <p className="field__error">{uploadError}</p>}
          </div>

          <div className="field-row">
            <div className="field">
              <label className="field__label" htmlFor="cpu">Required CPU cores</label>
              <input
                id="cpu"
                type="number"
                className="field__input mono"
                min={1}
                max={worker.cpuCores}
                value={requiredCpu}
                onChange={(e) => setRequiredCpu(e.target.value)}
                required
              />
              <p className="field__hint">Worker has {worker.cpuCores} cores available</p>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="memory">Required memory (MB)</label>
              <input
                id="memory"
                type="number"
                className="field__input mono"
                min={128}
                max={worker.memoryMB}
                step={128}
                value={requiredMemoryMB}
                onChange={(e) => setRequiredMemoryMB(e.target.value)}
                required
              />
              <p className="field__hint">Worker has {worker.memoryMB ? (worker.memoryMB / 1024).toFixed(0) : '—'} GB available</p>
            </div>
          </div>

          <div className="field">
            <label className="checkbox-row" style={{ marginBottom: 0 }}>
              <input
                type="checkbox"
                checked={gpuRequired}
                disabled={!worker.hasGpu}
                onChange={(e) => setGpuRequired(e.target.checked)}
              />
              <span>
                Require GPU {!worker.hasGpu && <span className="field__hint" style={{ display: 'inline' }}>(this worker has no GPU)</span>}
              </span>
            </label>
          </div>

            <div className="field">
                <label className="checkbox-row" style={{ marginBottom: 0 }}>
                    <input
                        type="checkbox"
                        checked={networkRequired}
                        onChange={(e) => setNetworkRequired(e.target.checked)}
                    />
                    <span>Require internet access</span>
                </label>
                <p className="field__hint">
                    Jobs run fully network-isolated by default. Only enable this if your
                    script needs to reach the internet (e.g. downloading pretrained weights).
                </p>
            </div>

          <div className="field">
            <label className="field__label">Max runtime</label>
            <div className="preset-row">
              {RUNTIME_PRESETS.map((p) => (
                <button
                  type="button"
                  key={p.seconds}
                  className={`chip ${maxRuntimeSeconds === p.seconds ? 'chip--active' : ''}`}
                  onClick={() => setMaxRuntimeSeconds(p.seconds)}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <input
              type="number"
              className="field__input mono"
              style={{ marginTop: 10 }}
              min={1}
              max={86400}
              value={maxRuntimeSeconds}
              onChange={(e) => setMaxRuntimeSeconds(e.target.value)}
              required
            />
            <p className="field__hint">
              Your job is killed if it exceeds this duration. You're charged for actual runtime, up to this cap.
            </p>
          </div>

          <div className="field">
            <label className="field__label">Priority</label>
            <div className="preset-row">
              {PRIORITY_OPTIONS.map((p) => (
                <button
                  type="button"
                  key={p.value}
                  className={`chip ${priority === p.value ? 'chip--active' : ''}`}
                  onClick={() => setPriority(p.value)}
                >
                  {p.label} <span className="chip__hint">{p.hint}</span>
                </button>
              ))}
            </div>
          </div>

          {submitError && <div className="banner banner--error">{submitError}</div>}

          <button className="btn btn--primary btn--full" type="submit" disabled={!canSubmit}>
            {submitting ? 'Submitting...' : 'Submit Job'}
          </button>
        </form>

        <aside className="create-job-sidebar">
          <div className="card">
            <div className="card__label">Worker</div>
            <div className="worker-summary">
              <div className="worker-summary__id mono">{worker.workerId}</div>
              <div className="worker-summary__row">
                <span>Specs</span>
                <span>{worker.cpuCores} cores · {worker.memoryMB ? (worker.memoryMB / 1024).toFixed(0) : '—'} GB</span>
              </div>
              <div className="worker-summary__row">
                <span>Reputation</span>
                <span>{(worker.reputation ?? 0).toFixed(0)}/100</span>
              </div>
              <div className="worker-summary__row">
                <span>CPU rate</span>
                <span className="mono">{money(worker.cpuRatePerSecond)}/s</span>
              </div>
              <div className="worker-summary__row">
                <span>GPU rate</span>
                <span className="mono">{money(worker.gpuRatePerSecond)}/s</span>
              </div>
            </div>
          </div>

          <div className="card estimate-card">
            <div className="card__label">Estimated Cost</div>
            <div className="estimate-card__value mono">{money(estimate)}</div>
            <p className="field__hint">
              Locked in at the current worker rate. Unused time is refunded automatically.
            </p>

            <div className="divider" />

            <div className="worker-summary__row">
              <span>Your balance</span>
              <span className="mono">{money(walletBalance)}</span>
            </div>

            {insufficientBalance && (
              <p className="field__error" style={{ marginTop: 10 }}>
                Insufficient balance. <Link to="/wallet">Add funds →</Link>
              </p>
            )}
          </div>
        </aside>
      </div>
    </AppLayout>
  );
}
