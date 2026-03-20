import { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import useDebounce from '../../hooks/useDebounce';
import {
  listarAdmins,
  crearAdmin,
  actualizarAdmin,
  toggleEstadoAdmin,
} from '../../api/adminsApi';

import SearchInput from '../../components/shared/SearchInput';
import TotalCount from '../../components/shared/TotalCount';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import EmptyState from '../../components/shared/EmptyState';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import AdminFormModal from '../../components/admins/AdminFormModal';

export default function AdminsPage() {
  const { user } = useAuth();

  const [admins, setAdmins] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal de formulario
  const [modalOpen, setModalOpen] = useState(false);
  const [adminSeleccionado, setAdminSeleccionado] = useState(null);

  // Modal de confirmación toggle estado
  const [confirmData, setConfirmData] = useState(null);

  const searchDebounced = useDebounce(search, 400);

  const cargarAdmins = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listarAdmins(searchDebounced);
      setAdmins(res.data.data);
      setTotal(res.data.total);
    } catch {
      setError('No se pudieron cargar los administradores.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarAdmins();
  }, [searchDebounced]);

  // Abrir modal para crear
  const handleCrear = () => {
    setAdminSeleccionado(null);
    setModalOpen(true);
  };

  // Abrir modal para editar
  const handleEditar = (admin) => {
    setAdminSeleccionado(admin);
    setModalOpen(true);
  };

  // Guardar (crear o editar)
  const handleGuardar = async (formData) => {
    if (adminSeleccionado) {
      await actualizarAdmin(adminSeleccionado._id, formData);
    } else {
      await crearAdmin(formData);
    }
    setModalOpen(false);
    cargarAdmins();
  };

  // Solicitar confirmación de toggle
  const handleToggle = (admin) => {
    // HU-06: no mostrar opción para la propia cuenta del superadmin
    if (admin._id === user?.id) return;

    const accion = admin.isActive ? 'desactivar' : 'activar';
    setConfirmData({
      message: `¿Deseas ${accion} la cuenta de ${admin.nombre}?`,
      onConfirm: async () => {
        await toggleEstadoAdmin(admin._id, !admin.isActive);
        setConfirmData(null);
        cargarAdmins();
      },
      onCancel: () => setConfirmData(null),
    });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* Encabezado */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary">Administradores</h1>
        <button
          onClick={handleCrear}
          className="bg-secondary text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
        >
          + Crear administrador
        </button>
      </div>

      {/* Buscador y total */}
      <div className="flex items-center gap-4 mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por nombre o correo..."
        />
        <TotalCount total={total} label="administrador(es)" />
      </div>

      {/* Contenido */}
      {loading && <LoadingSpinner />}

      {!loading && error && (
        <p className="text-danger text-sm">{error}</p>
      )}

      {!loading && !error && admins.length === 0 && (
        <EmptyState message="No hay administradores registrados." />
      )}

      {!loading && !error && admins.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface text-neutral uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Correo</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {admins.map((admin) => (
                <tr key={admin._id} className="hover:bg-surface transition">
                  <td className="px-4 py-3 font-medium text-neutral">
                    {admin.nombre}
                  </td>
                  <td className="px-4 py-3 text-neutral">{admin.correo}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      admin.rol === 'superadmin'
                        ? 'bg-primary text-white'
                        : 'bg-secondary text-white'
                    }`}>
                      {admin.rol}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      admin.isActive
                        ? 'bg-success text-white'
                        : 'bg-danger text-white'
                    }`}>
                      {admin.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => handleEditar(admin)}
                      className="text-secondary hover:underline text-xs"
                    >
                      Editar
                    </button>

                    {/* HU-06: ocultar botón de desactivar en cuenta propia */}
                    {admin._id !== user?.id && (
                      <button
                        onClick={() => handleToggle(admin)}
                        className={`text-xs hover:underline ${
                          admin.isActive ? 'text-danger' : 'text-success'
                        }`}
                      >
                        {admin.isActive ? 'Desactivar' : 'Activar'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal crear / editar */}
      {modalOpen && (
        <AdminFormModal
          adminInicial={adminSeleccionado}
          onGuardar={handleGuardar}
          onCerrar={() => setModalOpen(false)}
          esSuperAdmin={user?.rol === 'superadmin'}
        />
      )}

      {/* Modal de confirmación */}
      {confirmData && (
        <ConfirmDialog
          message={confirmData.message}
          onConfirm={confirmData.onConfirm}
          onCancel={confirmData.onCancel}
        />
      )}
    </div>
  );
}
