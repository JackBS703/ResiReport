import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, FileText, Users, BookOpen, ShieldCheck } from 'lucide-react';
import useAuth from '@/hooks/useAuth';
import { ROLES } from '@/utils/constants';
import { Button } from '@/components/ui/button';

// Menú filtrado por rol — HU-18
const NAV_LINKS = [
  {
    to: '/mis-denuncias',
    label: 'Mis Denuncias',
    icon: FileText,
    roles: [ROLES.RESIDENT],
  },
  {
    to: '/denuncias',
    label: 'Denuncias',
    icon: FileText,
    roles: [ROLES.ADMIN, ROLES.SUPERADMIN],
  },
  {
    to: '/residentes',
    label: 'Residentes',
    icon: Users,
    roles: [ROLES.ADMIN, ROLES.SUPERADMIN],
  },
  {
    to: '/tipos-denuncia',
    label: 'Catálogos (Tipos)',
    icon: BookOpen,
    roles: [ROLES.ADMIN, ROLES.SUPERADMIN],
  },
  {
    to: '/administradores',
    label: 'Administradores',
    icon: ShieldCheck,
    roles: [ROLES.SUPERADMIN],
  },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Solo muestra los links que el rol actual puede ver
  const linksVisibles = NAV_LINKS.filter((link) =>
    link.roles.includes(user?.rol)
  );

  return (
    <nav className="w-full bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">

      <div className="flex items-center gap-6">
        <span className="text-lg font-bold text-primary">ResiReport</span>
        <div className="flex items-center gap-1">
          {linksVisibles.map((link) => {
            const Icon = link.icon; // ESLint sí detecta el uso de Icon en JSX así
            const activo = location.pathname.startsWith(link.to);
            return (
                <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                    ${activo
                    ? 'bg-primary text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                    }`}
                >
                <Icon className="w-4 h-4" />
                {link.label}
                </Link>
            );
            })}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-500">
          {user?.nombre}
        </span>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-1" />
          Salir
        </Button>
      </div>

    </nav>
  );
};

export default Navbar;