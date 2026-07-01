// Mirrors BillingService.getPriorityMultiplier() on the backend.
// Used only for a live client-side estimate — the backend recalculates
// and is always the source of truth for actual billing.
export const PRIORITY_MULTIPLIERS = {
  LOW: 0.8,
  NORMAL: 1.0,
  HIGH: 1.5,
  URGENT: 2.0,
};

export const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low', hint: '0.8× price' },
  { value: 'NORMAL', label: 'Normal', hint: '1× price' },
  { value: 'HIGH', label: 'High', hint: '1.5× price' },
  { value: 'URGENT', label: 'Urgent', hint: '2× price' },
];

export function estimateCost(maxRuntimeSeconds, ratePerSecond, priority) {
  if (!maxRuntimeSeconds || !ratePerSecond) return 0;
  const multiplier = PRIORITY_MULTIPLIERS[priority] ?? 1;
  return maxRuntimeSeconds * ratePerSecond * multiplier;
}
