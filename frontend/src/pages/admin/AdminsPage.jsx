import { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import {
  listarAdmins,
  crearAdmin,
  actualizarAdmin,
  toggleEstadoAdmin,
} from '../../api/adminsApi';
import AdminFormModal from '../../components/admins/AdminFormModal';
import { parseApiError } from '../../utils/parseApiError';
import Swal from 'sweetalert2';

export default function AdminsPage() {
  const { user } = useAuth();

  const [admins, setAdmins] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [adminToEdit, setAdminToEdit] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchAdmins = async (q = '') => {
    setLoading(true);
    try {
      const res = await listarAdmins(q);
      setAdmins(res.data.data);
      setTotal(res.data.total);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: parseApiError(err),
        confirmButtonColor: '#E74C3C',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchAdmins(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // ── Crear ──
  const handleCreate = async (data) => {
    try {
      const res = await crearAdmin(data);
      await Swal.fire({
        icon: 'success',
        title: '¡Administrador creado!',
        text: res.data.message,
        confirmButtonColor: '#2E6DA4',
        timer: 2000,
        showConfirmButton: false,
      });
      setShowModal(false);
      fetchAdmins(search);
    } catch (err) {
      // 409 lo maneja AdminFormModal inline — relanza para que llegue al modal
      if (err?.response?.status === 409) throw err;
      Swal.fire({
        icon: 'error',
        title: 'Error al crear',
        text: parseApiError(err),
        confirmButtonColor: '#E74C3C',
      });
    }
  };

  // ── Editar ──
  const handleEdit = async (data) => {
    try {
      await actualizarAdmin(adminToEdit?._id, data);
      await Swal.fire({
        icon: 'success',
        title: 'Administrador actualizado',
        text: 'Los datos fueron guardados exitosamente.',
        timer: 2000,
        showConfirmButton: false,
      });
      setShowModal(false);
      setAdminToEdit(null);
      fetchAdmins(search);
    } catch (err) {
      // 409 lo maneja AdminFormModal inline — relanza para que llegue al modal
      if (err?.response?.status === 409) throw err;
      // 403: rol propio o último superadmin — mostrar Swal con mensaje del backend
      Swal.fire({
        icon: 'error',
        title: 'Acción no permitida',
        text: parseApiError(err),
        confirmButtonColor: '#E74C3C',
      });
    }
  };

  // ── Toggle estado ──
  const handleToggleStatus = async (admin) => {
    const accion = admin.isActive ? 'desactivar' : 'activar';
    const accionPasado = admin.isActive ? 'desactivado' : 'activado';

    const confirm = await Swal.fire({
      icon: 'warning',
      title: `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} administrador?`,
      html: `<p>Estás a punto de <strong>${accion}</strong> la cuenta de <strong>${admin.nombre}</strong>.</p>`,
      showCancelButton: true,
      confirmButtonText: `Sí, ${accion}`,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: admin.isActive ? '#E74C3C' : '#27AE60',
      cancelButtonColor: '#4A5568',
    });

    if (!confirm.isConfirmed) return;

    try {
      await toggleEstadoAdmin(admin._id, !admin.isActive);
      await Swal.fire({
        icon: 'success',
        title: `Administrador ${accionPasado}`,
        text: `La cuenta de ${admin.nombre} fue ${accionPasado} exitosamente.`,
        timer: 2000,
        showConfirmButton: false,
      });
      fetchAdmins(search);
    } catch (err) {
      // 403: último superadmin o cuenta propia — mensaje del backend
      Swal.fire({
        icon: 'error',
        title: 'Acción no permitida',
        text: parseApiError(err),
        confirmButtonColor: '#E74C3C',
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6 bg-white rounded-xl shadow-sm px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Administradores</h1>
          <p className="text-sm text-neutral mt-0.5">
            {total} administrador{total !== 1 ? 'es' : ''} encontrado{total !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => { setAdminToEdit(null); setShowModal(true); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-gray-950 active:scale-95 transition-all duration-150"
        >
          + Crear administrador
        </button>
      </div>

      {/* Buscador + Tabla */}
      <div className="bg-white rounded-xl shadow-sm px-6 py-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o correo..."
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-secondary"
        />

        {loading ? (
          <p className="text-neutral text-sm py-8 text-center">Cargando...</p>
        ) : admins.length === 0 ? (
          <p className="text-neutral text-sm py-8 text-center">No hay administradores registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse min-w-[640px]">
              <thead>
                <tr className="bg-surface text-neutral text-left text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 border-b w-44">Nombre</th>
                  <th className="px-4 py-3 border-b w-52">Correo</th>
                  <th className="px-4 py-3 border-b w-28">Rol</th>
                  <th className="px-4 py-3 border-b w-24">Estado</th>
                  <th className="px-4 py-3 border-b w-36">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin._id} className="hover:bg-surface border-b transition-colors">
                    <td className="px-4 py-3 font-medium text-primary whitespace-nowrap">
                      {admin.nombre}
                    </td>
                    <td className="px-4 py-3 text-neutral truncate max-w-[200px]" title={admin.correo}>
                      {admin.correo}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        admin.rol === 'superadmin'
                          ? 'bg-gray-900 text-white'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {admin.rol}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        admin.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {admin.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setAdminToEdit(admin); setShowModal(true); }}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-all duration-200"
                        >
                          Editar
                        </button>

                        {/* HU-06: oculto en cuenta propia */}
                        {admin._id !== user?.id && (
                          <button
                            onClick={() => handleToggleStatus(admin)}
                            className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full border transition-all duration-200 ${
                              admin.isActive
                                ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:border-red-300'
                                : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300'
                            }`}
                          >
                            {admin.isActive ? 'Desactivar' : 'Activar'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal único — crea si adminToEdit es null, edita si tiene valor */}
      {showModal && (
        <AdminFormModal
          adminInicial={adminToEdit}
          onGuardar={adminToEdit ? handleEdit : handleCreate}
          onCerrar={() => { setShowModal(false); setAdminToEdit(null); }}
          esSuperAdmin={user?.rol === 'superadmin'}
          usuarioActualId={user?.id}
        />
      )}

    </div>
  );
}
