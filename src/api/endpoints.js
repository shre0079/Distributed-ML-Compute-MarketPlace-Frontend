import api from './client';

// ── Auth ────────────────────────────────────────────────────────
export const register = (email, password) =>
  api.post('/user/register', { email, password });

export const login = (email, password) =>
  api.post('/user/login', { email, password });

export const logoutRequest = () => api.post('/user/logout');

// ── Wallet ──────────────────────────────────────────────────────
export const getWallet = () => api.get('/wallet');

export const deposit = (amount) =>
  api.post(`/deposit?amount=${amount}`);

export const getTransactions = (page = 0, size = 20) =>
  api.get(`/users/transactions?page=${page}&size=${size}`);

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

export const getMyJobs = (page = 0, size = 20) =>
  api.get(`/jobs?page=${page}&size=${size}`);

export const getMyJobsByStatus = (status, page = 0, size = 20) =>
  api.get(`/jobs/status/${status}?page=${page}&size=${size}`);

export const getJob = (jobId) => api.get(`/jobs/${jobId}`);

export const getJobLogs = (jobId) => api.get(`/jobs/${jobId}/logs`);

export const cancelJob = (jobId) => api.post(`/jobs/${jobId}/cancel`);

export const downloadArtifact = (jobId) =>
  api.get(`/jobs/${jobId}/artifact`, { responseType: 'blob' });

// ── Admin ───────────────────────────────────────────────────────
export const adminGetStats = () => api.get('/admin/stats');

export const adminGetJobs = (page = 0, size = 20) =>
  api.get(`/admin/jobs?page=${page}&size=${size}`);

export const adminGetJobsByStatus = (status, page = 0, size = 20) =>
  api.get(`/admin/jobs/status/${status}?page=${page}&size=${size}`);

export const adminGetWorkers = (page = 0, size = 20) =>
  api.get(`/admin/workers?page=${page}&size=${size}`);

export const adminGetUsers = (page = 0, size = 20) =>
  api.get(`/admin/users?page=${page}&size=${size}`);

export const adminGetTransactions = (page = 0, size = 20) =>
  api.get(`/admin/transactions?page=${page}&size=${size}`);

export const adminGetWithdrawals = () => api.get('/admin/withdrawals');

export const adminGetAuditLog = (page = 0, size = 20) =>
  api.get(`/admin/audit-log?page=${page}&size=${size}`);

export const adminForceFailJob = (jobId) =>
  api.post(`/admin/jobs/${jobId}/force-fail`);

export const adminBanWorker = (workerId) =>
  api.post(`/admin/workers/${workerId}/ban`);

export const adminApproveWithdrawal = (id) =>
  api.post(`/admin/withdrawals/${id}/approve`);

export const adminRejectWithdrawal = (id, reason) =>
  api.post(`/admin/withdrawals/${id}/reject${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`);
