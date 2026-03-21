import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from '@/routes/PrivateRoute';
import RoleRoute from '@/routes/RoleRoute';
import { ROLES } from '@/utils/constants';

// Páginas auth
import LoginPage from '@/pages/auth/LoginPage';

// Layouts con Navbar (placeholders por ahora)
import Navbar from '@/components/shared/Navbar';

// Páginas — se irán completando en pasos siguientes
// Admin
import AllComplaintsPage from '@/pages/admin/AllComplaintsPage';
import ComplaintDetailAdminPage from '@/pages/admin/ComplaintDetailAdminPage';
// Resident
const MyComplaintsPage = () => <div>MyComplaints — próximamente</div>;
const CreateComplaintPage = () => <div>CreateComplaint — próximamente</div>;
const ComplaintDetailPage = () => <div>ComplaintDetail — próximamente</div>;
const ProfilePage = () => <div>Profile — próximamente</div>;
// Shared
const NoAutorizado = () => <div className="p-8 text-red-500 font-semibold">403 — No autorizado</div>;

// Layout con Navbar envuelve las rutas protegidas
const LayoutConNavbar = () => (
  <div className="min-h-screen bg-surface flex flex-col">
    <Navbar />
    <main className="flex-1 p-6">
      <Routes>
        {/* ── Admin + SuperAdmin ── */}
        <Route element={<RoleRoute roles={[ROLES.ADMIN, ROLES.SUPERADMIN]} />}>
          <Route path="/denuncias" element={<AllComplaintsPage />} />
          <Route path="/denuncias/:id" element={<ComplaintDetailAdminPage />} />
        </Route>

        {/* ── Solo SuperAdmin ── */}
        <Route element={<RoleRoute roles={[ROLES.SUPERADMIN]} />}>
          <Route path="/administradores" element={<div>AdminsPage — próximamente</div>} />
        </Route>

        {/* ── Resident ── */}
        <Route element={<RoleRoute roles={[ROLES.RESIDENT]} />}>
          <Route path="/mis-denuncias" element={<MyComplaintsPage />} />
          <Route path="/mis-denuncias/:id" element={<ComplaintDetailPage />} />
          <Route path="/crear-denuncia" element={<CreateComplaintPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
        </Route>

        {/* ── Compartidas (cualquier rol autenticado) ── */}
        <Route path="/no-autorizado" element={<NoAutorizado />} />
        <Route path="*" element={<Navigate to="/no-autorizado" replace />} />
      </Routes>
    </main>
  </div>
);

const App = () => {
  return (
    <Routes>
      {/* Ruta pública */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rutas protegidas — requieren token válido */}
      <Route element={<PrivateRoute />}>
        <Route path="/*" element={<LayoutConNavbar />} />
      </Route>

      {/* Raíz redirige a login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;