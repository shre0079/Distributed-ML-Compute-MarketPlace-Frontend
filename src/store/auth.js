import { create } from 'zustand';

// JWTs are base64url-encoded JSON, readable client-side with no secret needed.
// This is purely for UI decisions (e.g. showing the Admin nav link) — the
// backend independently re-validates the signature and role on every
// protected request, so nothing security-relevant depends on this decode.
function decodeRole(token) {
  try {
    const payload = token.split('.')[1];
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return json.role || null;
  } catch {
    return null;
  }
}

function loadInitial() {
  const token = localStorage.getItem('dcm_token');
  const userId = localStorage.getItem('dcm_userId');
  const email = localStorage.getItem('dcm_email');
  const role = token ? decodeRole(token) : null;
  return { token, userId, email, role };
}

export const useAuthStore = create((set) => ({
  ...loadInitial(),
  walletBalance: null,

  // Called after successful /user/login or /user/register.
  // AuthResponse only carries {token, userId, email, walletBalance} —
  // role is derived from the token itself, not passed in separately.
  setAuth: ({ token, userId, email, walletBalance }) => {
    localStorage.setItem('dcm_token', token);
    localStorage.setItem('dcm_userId', userId);
    localStorage.setItem('dcm_email', email);
    set({ token, userId, email, role: decodeRole(token), walletBalance });
  },

  setWalletBalance: (walletBalance) => set({ walletBalance }),

  logout: () => {
    localStorage.removeItem('dcm_token');
    localStorage.removeItem('dcm_userId');
    localStorage.removeItem('dcm_email');
    set({ token: null, userId: null, email: null, role: null, walletBalance: null });
  },
}));

export const isAuthenticated = () => !!localStorage.getItem('dcm_token');
