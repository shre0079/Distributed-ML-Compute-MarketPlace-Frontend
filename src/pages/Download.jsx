import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { BASE_URL } from '../api/client';

export default function Download() {
  const downloadUrl = `${BASE_URL}/downloads/DCM-Worker.zip`;

  return (
    <div className="page">
      <Navbar />

      <main className="page__body">
        <section className="hero">
          <div className="container">
            <h1 className="hero__title">Run a Worker, Earn From Idle Compute</h1>
            <p className="hero__subtitle">
              Lend your machine's CPU and GPU to the network. Set your own
              price, run jobs whenever you're online, and get paid per second
              of compute delivered.
            </p>
            <div className="hero__actions">
              <a href={downloadUrl} className="btn btn--primary" download>
                Download Worker Agent ↓
              </a>
            </div>
            <p className="field__hint" style={{ marginTop: 4 }}>
              No DCM account needed to run a worker. Windows only, for now.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section__heading">
              <h2 className="section__title">System Requirements</h2>
            </div>

            <div className="feature-grid">
              <div className="feature-card">
                <div className="feature-card__icon">🪟</div>
                <div className="feature-card__title">Windows 10 or 11</div>
                <div className="feature-card__desc">
                  The worker agent ships as a self-contained .exe with its own
                  bundled Java runtime — no separate Java install needed.
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-card__icon">🐳</div>
                <div className="feature-card__title">Docker Desktop</div>
                <div className="feature-card__desc">
                  Must be installed and running before you start the agent —
                  this is what actually executes training jobs.
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-card__icon">🎮</div>
                <div className="feature-card__title">NVIDIA GPU (optional)</div>
                <div className="feature-card__desc">
                  For GPU jobs, you also need the NVIDIA Container Toolkit
                  configured for Docker — see the note below.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="showcase">
          <div className="container section">
            <div className="section__heading">
              <h2 className="section__title">Setup — 4 Steps</h2>
            </div>

            <div className="steps">
              <div className="step">
                <div className="step__num">1</div>
                <div className="step__title">Download & Unzip</div>
                <div className="step__desc">Extract the .zip anywhere on your machine.</div>
              </div>
              <div className="step">
                <div className="step__num">2</div>
                <div className="step__title">Run DCM-Worker.exe</div>
                <div className="step__desc">Starts silently — no console window opens.</div>
              </div>
              <div className="step">
                <div className="step__num">3</div>
                <div className="step__title">Set Your Price</div>
                <div className="step__desc">First run only — two quick popups ask your CPU/GPU rate.</div>
              </div>
              <div className="step">
                <div className="step__num">4</div>
                <div className="step__title">Dashboard Opens</div>
                <div className="step__desc">Your browser opens automatically to your local dashboard.</div>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container" style={{ maxWidth: 760 }}>
            <div className="card">
              <div className="card__label">Before You Start</div>
              <ul style={{ paddingLeft: 20, color: 'var(--text2)', fontSize: 13, lineHeight: 1.8 }}>
                <li>Docker Desktop must already be running — the agent will retry registration if it isn't reachable yet.</li>
                <li>Windows may show a firewall prompt on first launch — allow access so the agent can reach the DCM backend and your own dashboard.</li>
                <li>Keep the agent running to receive jobs. Closing it takes you offline in the marketplace immediately.</li>
                <li>
                  <strong>GPU jobs</strong> require the{' '}
                  <a
                    href="https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html"
                    target="_blank"
                    rel="noreferrer"
                  >
                    NVIDIA Container Toolkit
                  </a>{' '}
                  in addition to your GPU drivers. Having <code>nvidia-smi</code> work
                  is not the same as Docker being able to use your GPU — if this
                  isn't configured, GPU jobs you accept will fail at runtime even
                  though your machine shows as GPU-capable.
                </li>
                <li>Nothing about your machine is exposed publicly — the dashboard runs only on <code>localhost</code>, and your worker only ever reaches out to the DCM backend, never the other way around.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="cta-strip">
          <div className="container">
            <h2 className="cta-strip__title">Ready to lend your machine?</h2>
            <p className="cta-strip__desc">
              Set your price, stay online, and start earning from compute
              you're not otherwise using.
            </p>
            <div className="cta-strip__actions">
              <a href={downloadUrl} className="btn btn--primary" download>
                Download Worker Agent ↓
              </a>
              <Link to="/marketplace" className="btn btn--outline">See the Marketplace</Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
