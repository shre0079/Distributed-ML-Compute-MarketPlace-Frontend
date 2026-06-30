import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

export default function AdminRoute({ children }) {
  const token = useAuthStore((s) => s.token);
  const role = useAuthStore((s) => s.role);

  if (!token) return <Navigate to="/login" replace />;
  if (role !== 'ADMIN') return <Navigate to="/dashboard" replace />;

  return children;
}
