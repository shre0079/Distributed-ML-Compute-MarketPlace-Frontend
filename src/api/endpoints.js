import api from './client';

// ── Auth ────────────────────────────────────────────────────────
export const register = (email, password) =>
  api.post('/user/register', { email, password });

export const login = (email, password) =>
  api.post('/user/login', { email, password });

// ── Wallet ──────────────────────────────────────────────────────
export const getWallet = () => api.get('/wallet');

export const deposit = (amount) =>
  api.post(`/deposit?amount=${amount}`);

export const getTransactions = () => api.get('/users/transactions');

export const getJobTransactions = (jobId) =>
  api.get(`/users/transactions/job/${jobId}`);

// ── Files ───────────────────────────────────────────────────────
export const uploadFile = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// ── Marketplace / Workers ──────────────────────────────────────
export const getWorkers = () => api.get('/workers');

export const getWorker = (workerId) => api.get(`/workers/${workerId}`);

// ── Jobs ────────────────────────────────────────────────────────
export const createJob = (payload) => api.post('/jobs/create', payload);

export const getMyJobs = () => api.get('/jobs');

export const getMyJobsByStatus = (status) => api.get(`/jobs/status/${status}`);

export const getJob = (jobId) => api.get(`/jobs/${jobId}`);

export const getJobLogs = (jobId) => api.get(`/jobs/${jobId}/logs`);

export const cancelJob = (jobId) => api.post(`/jobs/${jobId}/cancel`);

// ── Admin ───────────────────────────────────────────────────────
export const adminGetStats = () => api.get('/admin/stats');
export const adminGetJobs = () => api.get('/admin/jobs');
export const adminGetWorkers = () => api.get('/admin/workers');
export const adminGetUsers = () => api.get('/admin/users');
export const adminGetTransactions = () => api.get('/admin/transactions');
export const adminGetWithdrawals = () => api.get('/admin/withdrawals');
export const adminForceFailJob = (jobId) =>
  api.post(`/admin/jobs/${jobId}/force-fail`);
export const adminBanWorker = (workerId) =>
  api.post(`/admin/workers/${workerId}/ban`);
export const adminApproveWithdrawal = (id) =>
  api.post(`/admin/withdrawals/${id}/approve`);
export const adminRejectWithdrawal = (id, reason) =>
  api.post(`/admin/withdrawals/${id}/reject${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`);
