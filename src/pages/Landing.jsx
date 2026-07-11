import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Landing() {
  return (
    <div className="page">
      <Navbar />

      <main className="page__body">
        {/* Hero */}
        <section className="hero">
          <div className="container">
            <h1 className="hero__title">
              Distributed ML Compute for Every Developer
            </h1>
            <p className="hero__subtitle">
              Submit your training job, we match it with a compute provider.
              Pay only for the seconds your model actually trains.
            </p>
            <div className="hero__actions">
              <Link to="/register" className="btn btn--primary">Submit Your First Job</Link>
              <Link to="/marketplace" className="btn btn--outline">Browse Marketplace</Link>
            </div>
            <div className="hero__badges" aria-hidden="true">
              <span>🐳</span>
              <span>🐍</span>
              <span>🛡️</span>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="section">
          <div className="container">
            <div className="section__heading">
              <h2 className="section__title">Everything You Need to Train</h2>
              <p className="section__subtitle">
                No cloud account, no GPU rental contracts — just submit and go.
              </p>
            </div>

            <div className="feature-grid">
              <div className="feature-card">
                <div className="feature-card__icon">🐳</div>
                <div className="feature-card__title">Docker-Based Execution</div>
                <div className="feature-card__desc">
                  Package your training script as a Docker image and DCM runs it
                  consistently on any provider's hardware.
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-card__icon">⚙️</div>
                <div className="feature-card__title">Choose Your Provider</div>
                <div className="feature-card__desc">
                  Browse online workers by price, reputation, and specs — pick
                  exactly who runs your job.
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-card__icon">💳</div>
                <div className="feature-card__title">Wallet-Based Billing</div>
                <div className="feature-card__desc">
                  Top up your balance, pay per second of actual compute.
                  Unused time is refunded automatically.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live tracking showcase */}
        <section className="showcase">
          <div className="container section showcase__inner">
            <div>
              <h2 className="showcase__title">Real-Time Job Tracking</h2>
              <p className="showcase__desc">
                Watch your training job run live — full stdout/stderr streaming
                and status updates from creation to completion.
              </p>
              <div className="showcase__list">
                <div className="showcase__list-item">
                  <span className="showcase__check">✓</span>
                  Live container log streaming
                </div>
                <div className="showcase__list-item">
                  <span className="showcase__check">✓</span>
                  Automatic timeout protection
                </div>
                <div className="showcase__list-item">
                  <span className="showcase__check">✓</span>
                  Transparent per-second billing
                </div>
              </div>
            </div>

            <div className="showcase__terminal">
              <div className="showcase__terminal-bar">
                <span className="showcase__terminal-dot showcase__terminal-dot--red" />
                <span className="showcase__terminal-dot showcase__terminal-dot--yellow" />
                <span className="showcase__terminal-dot showcase__terminal-dot--green" />
                <span className="showcase__terminal-label">job_id: dcm_train_8829</span>
              </div>
              <div className="showcase__terminal-body">
                [14:20:01] Downloading dataset...<br />
                [14:20:05] Pulling image: pytorch/pytorch:latest<br />
                [14:20:12] Container started on worker-a1b2c3d4<br />
                [14:20:15] Epoch 1/10 — loss: 0.423<br />
                [14:20:22] Epoch 2/10 — loss: 0.381
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="section">
          <div className="container">
            <div className="section__heading">
              <h2 className="section__title">How It Works</h2>
            </div>

            <div className="steps">
              <div className="step">
                <div className="step__num">1</div>
                <div className="step__title">Upload Dataset</div>
                <div className="step__desc">Submit your dataset and Docker image via the dashboard.</div>
              </div>
              <div className="step">
                <div className="step__num">2</div>
                <div className="step__title">Pick a Worker</div>
                <div className="step__desc">Browse the marketplace and choose by price and reputation.</div>
              </div>
              <div className="step">
                <div className="step__num">3</div>
                <div className="step__title">Execute & Track</div>
                <div className="step__desc">Monitor progress in real time with live logs.</div>
              </div>
              <div className="step">
                <div className="step__num">4</div>
                <div className="step__title">Collect Results</div>
                <div className="step__desc">Download your trained model once the job finishes.</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA strip */}
        <section className="cta-strip">
          <div className="container">
            <h2 className="cta-strip__title">Ready to train your first model?</h2>
            <p className="cta-strip__desc">
              Join a growing network of students and developers running ML jobs
              on shared compute — no cloud contract required.
            </p>
            <div className="cta-strip__actions">
              <Link to="/register" className="btn btn--primary">Start Training Now</Link>
              <Link to="/download" className="btn btn--outline">Become a Provider</Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
