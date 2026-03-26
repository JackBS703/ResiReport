import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';

// Bloquea acceso si el rol del usuario no está en los roles permitidos
const RoleRoute = ({ roles = [] }) => {
  const { user } = useAuth();
  return roles.includes(user?.rol)
    ? <Outlet />
    : <Navigate to="/no-autorizado" replace />;
};

export default RoleRoute;