import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { getTransactions, deposit } from '../api/endpoints';
import { useAuthStore } from '../store/auth';
import { money, amountTone, truncateId } from '../utils/format';

const DEPOSIT_PRESETS = [5, 10, 25, 50];

export default function Wallet() {
  const navigate = useNavigate();
  const setWalletBalance = useAuthStore((s) => s.setWalletBalance);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [amount, setAmount] = useState('');
  const [depositing, setDepositing] = useState(false);
  const [depositError, setDepositError] = useState('');
  const [depositSuccess, setDepositSuccess] = useState('');

  const load = async () => {
    try {
      const res = await getTransactions();
      setData(res.data);
      setWalletBalance(res.data.currentBalance);
    } catch (err) {
      setError('Could not load wallet data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeposit = async (e) => {
    e.preventDefault();
    setDepositError('');
    setDepositSuccess('');

    const value = Number(amount);
    if (!value || value < 0.01) {
      setDepositError('Enter an amount of at least $0.01.');
      return;
    }

    setDepositing(true);
    try {
      await deposit(value);
      setDepositSuccess(`Added $${value.toFixed(2)} to your wallet.`);
      setAmount('');
      await load();
    } catch (err) {
      setDepositError(err.response?.data?.message || 'Deposit failed. Please try again.');
    } finally {
      setDepositing(false);
    }
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Wallet</h1>
          <p className="page-header__subtitle">Manage your balance and view transaction history.</p>
        </div>
      </div>

      {error && <div className="banner banner--error">{error}</div>}

      {loading ? (
        <p className="empty-note">Loading...</p>
      ) : (
        <>
          <div className="wallet-layout">
            <div className="card wallet-balance-card">
              <div className="card__label">Current Balance</div>
              <div className="wallet-balance-card__value">{money(data.currentBalance)}</div>
              <div className="wallet-summary-row">
                <div>
                  <span className="wallet-summary-row__label">Deposited</span>
                  <span className="mono">{money(data.summary.totalDeposited)}</span>
                </div>
                <div>
                  <span className="wallet-summary-row__label">Spent</span>
                  <span className="mono">{money(data.summary.totalSpent)}</span>
                </div>
                <div>
                  <span className="wallet-summary-row__label">Refunded</span>
                  <span className="mono">{money(data.summary.totalRefunded)}</span>
                </div>
              </div>
            </div>

            <form className="card" onSubmit={handleDeposit}>
              <div className="card__label">Add Funds</div>

              <div className="preset-row" style={{ marginBottom: 12 }}>
                {DEPOSIT_PRESETS.map((v) => (
                  <button
                    type="button"
                    key={v}
                    className={`chip ${Number(amount) === v ? 'chip--active' : ''}`}
                    onClick={() => setAmount(String(v))}
                  >
                    ${v}
                  </button>
                ))}
              </div>

              <div className="field" style={{ marginBottom: 12 }}>
                <label className="field__label" htmlFor="amount">Amount (USD)</label>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="field__input mono"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              {depositError && <p className="field__error">{depositError}</p>}
              {depositSuccess && <p className="field__hint" style={{ color: 'var(--teal)' }}>{depositSuccess}</p>}

              <button className="btn btn--primary btn--full" type="submit" disabled={depositing}>
                {depositing ? 'Adding Funds...' : 'Add Funds'}
              </button>
            </form>
          </div>

          <div className="section-title-row">
            <h2 className="section-title-row__title">Transaction History</h2>
          </div>

          <div className="card" style={{ padding: 0 }}>
            {data.transactions.length === 0 ? (
              <div className="table__empty" style={{ padding: '48px 20px' }}>
                No transactions yet.
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Job</th>
                    <th>Amount</th>
                    <th>When</th>
                  </tr>
                </thead>
                <tbody>
                  {data.transactions.map((t) => (
                    <tr
                      key={t.transactionId}
                      onClick={() => t.jobId && navigate(`/jobs/${t.jobId}`)}
                      style={{ cursor: t.jobId ? 'pointer' : 'default' }}
                    >
                      <td><span className="pill pill--neutral">{t.type}</span></td>
                      <td>{t.description}</td>
                      <td className="mono">{t.jobId ? truncateId(t.jobId) : '—'}</td>
                      <td className={`mono amount amount--${amountTone(t.amount)}`}>
                        {t.amount >= 0 ? '+' : ''}{money(t.amount)}
                      </td>
                      <td>{t.timestamp}</td>
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
