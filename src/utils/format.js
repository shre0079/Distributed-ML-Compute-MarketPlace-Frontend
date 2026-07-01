export function money(v) {
  if (v === null || v === undefined) return '—';
  return '$' + Number(v).toFixed(8);
}

export function moneyShort(v) {
  if (v === null || v === undefined) return '—';
  return '$' + Number(v).toFixed(2);
}

export function duration(ms) {
  if (ms === null || ms === undefined) return '—';
  const s = ms / 1000;
  if (s < 60) return s.toFixed(1) + 's';
  if (s < 3600) return (s / 60).toFixed(1) + 'm';
  return (s / 3600).toFixed(2) + 'h';
}

export function timeAgo(value) {
  if (!value) return '—';
  const epoch = typeof value === 'number' ? value : new Date(value).getTime();
  const diff = Date.now() - epoch;
  const s = Math.floor(diff / 1000);
  if (s < 60) return s + 's ago';
  if (s < 3600) return Math.floor(s / 60) + 'm ago';
  if (s < 86400) return Math.floor(s / 3600) + 'h ago';
  return Math.floor(s / 86400) + 'd ago';
}

export function pillClass(status) {
  const map = {
    SUCCESS: 'success',
    RUNNING: 'running',
    CREATED: 'created',
    FAILED: 'failed',
    TIMEOUT: 'timeout',
    CANCELLED: 'neutral',
    EXPIRED: 'neutral',
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
  };
  return map[status] || 'neutral';
}

export function priorityPillClass(priority) {
  const map = {
    URGENT: 'failed',
    HIGH: 'created',
    NORMAL: 'neutral',
    LOW: 'neutral',
  };
  return map[priority] || 'neutral';
}

export function truncateId(id, len = 8) {
  if (!id) return '—';
  return id.slice(0, len);
}

export function amountTone(amount) {
  if (amount === null || amount === undefined) return 'neutral';
  return Number(amount) >= 0 ? 'credit' : 'debit';
}
