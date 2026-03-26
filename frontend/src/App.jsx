import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from '@/routes/PrivateRoute';
import RoleRoute from '@/routes/RoleRoute';
import { ROLES } from '@/utils/constants';

// Páginas auth
import LoginPage from '@/pages/auth/LoginPage';

// Layouts con Navbar
import Navbar from '@/components/shared/Navbar';

// Páginas Admin
import AllComplaintsPage from '@/pages/admin/AllComplaintsPage';
import ComplaintDetailAdminPage from '@/pages/admin/ComplaintDetailAdminPage';
import ResidentsPage from '@/pages/admin/ResidentsPage';
import AdminsPage from '@/pages/admin/AdminsPage'; // ← NUEVO
import ComplaintTypesPage from '@/pages/admin/ComplaintTypesPage';
import ComplaintStatusesPage from '@/pages/admin/ComplaintStatusesPage'; // ← NUEVO

// Páginas Resident
import MyComplaintsPage from '@/pages/resident/MyComplaintsPage';
import CreateComplaintPage from '@/pages/resident/CreateComplaintPage';
import ComplaintDetailPage from '@/pages/resident/ComplaintDetailPage';
import ProfilePage from '@/pages/resident/ProfilePage'; // we'll still use placeholder

// Shared
const NoAutorizado = () => <div className="p-8 text-red-500 font-semibold">403 — No autorizado</div>;

const LayoutConNavbar = () => (
  <div className="min-h-screen bg-surface flex flex-col">
    <Navbar />
    <main className="flex-1 p-6">
      <Routes>

        {/* ── Admin + SuperAdmin ── */}
        <Route element={<RoleRoute roles={[ROLES.ADMIN, ROLES.SUPERADMIN]} />}>
          <Route path="/denuncias" element={<AllComplaintsPage />} />
          <Route path="/denuncias/:id" element={<ComplaintDetailAdminPage />} />
          <Route path="/residentes" element={<ResidentsPage />} />
          <Route path="/tipos-denuncia" element={<ComplaintTypesPage />} />
          <Route path="/estados-denuncia" element={<ComplaintStatusesPage />} /> {/* ← NUEVO */}
        </Route>

        {/* ── Solo SuperAdmin ── */}
        <Route element={<RoleRoute roles={[ROLES.SUPERADMIN]} />}>
          <Route path="/administradores" element={<AdminsPage />} /> {/* ← NUEVO */}
        </Route>

        {/* ── Resident ── */}
        <Route element={<RoleRoute roles={[ROLES.RESIDENT]} />}>
          <Route path="/mis-denuncias" element={<MyComplaintsPage />} />
          <Route path="/mis-denuncias/:id" element={<ComplaintDetailPage />} />
          <Route path="/crear-denuncia" element={<CreateComplaintPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
        </Route>

        {/* ── Compartidas ── */}
        <Route path="/no-autorizado" element={<NoAutorizado />} />
        <Route path="*" element={<Navigate to="/no-autorizado" replace />} />

      </Routes>
    </main>
  </div>
);

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<PrivateRoute />}>
        <Route path="/*" element={<LayoutConNavbar />} />
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;
