import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';

// Bloquea acceso si no hay sesión activa → redirige a /login
const PrivateRoute = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;