import { useState, useEffect } from 'react';
import {
  getComplaintStatuses,
  createComplaintStatus,
  updateComplaintStatus,
  toggleComplaintStatusActive,
  deleteComplaintStatus
} from '../../api/catalogApi';
import ComplaintStatusFormModal from '../../components/admins/ComplaintStatusFormModal';
import { parseApiError } from '../../utils/parseApiError';
import Swal from 'sweetalert2';
import StatusBadge from '../../components/shared/StatusBadge';
import useDebounce from '../../hooks/useDebounce';

export default function ComplaintStatusesPage() {
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusToEdit, setStatusToEdit] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const searchDebounced = useDebounce(search, 400);

  const fetchStatuses = async () => {
    setLoading(true);
    try {
      const res = await getComplaintStatuses();
      setStatuses(res.data.data);
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
    fetchStatuses();
  }, []);

  const filteredStatuses = statuses.filter((s) => 
    s.name.toLowerCase().includes(searchDebounced.toLowerCase())
  );

  // ── Crear ──
  const handleCreate = async (data) => {
    try {
      const res = await createComplaintStatus(data);
      await Swal.fire({
        icon: 'success',
        title: '¡Estado creado!',
        text: res.data.message || 'Estado de denuncia creado exitosamente.',
        confirmButtonColor: '#2E6DA4',
        timer: 2000,
        showConfirmButton: false,
      });
      setShowModal(false);
      fetchStatuses();
    } catch (err) {
      if (err?.response?.status === 409 || err?.response?.status === 400) throw err;
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
      await updateComplaintStatus(statusToEdit?._id, data);
      await Swal.fire({
        icon: 'success',
        title: 'Estado actualizado',
        text: 'Los datos fueron guardados exitosamente.',
        timer: 2000,
        showConfirmButton: false,
      });
      setShowModal(false);
      setStatusToEdit(null);
      fetchStatuses();
    } catch (err) {
      if (err?.response?.status === 409 || err?.response?.status === 400) throw err;
      Swal.fire({
        icon: 'error',
        title: 'Acción no permitida',
        text: parseApiError(err),
        confirmButtonColor: '#E74C3C',
      });
    }
  };

  // ── Toggle estado (Activar / Desactivar) ──
  const handleToggleStatus = async (statusItem) => {
    const accion = statusItem.isActive ? 'desactivar' : 'activar';
    const accionPasado = statusItem.isActive ? 'desactivado' : 'activado';

    let warningHtml = `<p>Estás a punto de <strong>${accion}</strong> el estado <strong>${statusItem.name}</strong>.</p>`;
    
    // Regla de Negocio (HU-09): Si isDefault y se desactiva, advertencia extra fuerte.
    if (statusItem.isDefault && statusItem.isActive) {
      if (statusItem.usageCount > 0) {
        warningHtml += `<p class="mt-2 text-sm text-red-600 font-semibold">¡Este estado tiene ${statusItem.usageCount} denuncia(s) asociada(s)!</p>`;
      }
      warningHtml += `<p class="mt-2 text-sm text-red-600 font-semibold">¡ATENCIÓN! Este es un estado por defecto (Core). Desactivarlo podría afectar el flujo normal de atención de nuevas denuncias, aunque sí lo permitimos temporalmente.</p>`;
    } else if (statusItem.isActive) {
      if (statusItem.usageCount > 0) {
        warningHtml += `<p class="mt-2 text-sm text-red-600 font-semibold">¡Este estado tiene ${statusItem.usageCount} denuncia(s) asociada(s)!</p>`;
      }
      warningHtml += `<p class="mt-2 text-sm text-gray-500">Al desactivarlo, ya no podrás mover nuevas denuncias hacia este estado.</p>`;
    }

    const confirm = await Swal.fire({
      icon: 'warning',
      title: `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} estado?`,
      html: warningHtml,
      showCancelButton: true,
      confirmButtonText: `Sí, ${accion}`,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: statusItem.isActive ? '#E74C3C' : '#27AE60',
      cancelButtonColor: '#4A5568',
    });

    if (!confirm.isConfirmed) return;

    try {
      await toggleComplaintStatusActive(statusItem._id, !statusItem.isActive);
      await Swal.fire({
        icon: 'success',
        title: `Estado ${accionPasado}`,
        text: `El estado fue ${accionPasado} exitosamente.`,
        timer: 2000,
        showConfirmButton: false,
      });
      fetchStatuses();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error al cambiar',
        text: parseApiError(err),
        confirmButtonColor: '#E74C3C',
      });
    }
  };

  // ── Eliminar Físico ──
  const handleDelete = async (statusItem) => {
    // Si isDefault es verdadero, el botón ni siquiera se va a mostrar, pero por si acaso lo bloqueamos aquí también.
    if (statusItem.isDefault) {
      return Swal.fire('Acción Bloqueada', 'Los estados por defecto no pueden ser eliminados en ninguna circunstancia.', 'error');
    }

    const confirm = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar definitivamente?',
      html: `<p>Vas a eliminar permanentemente el estado de denuncia <strong>${statusItem.name}</strong>.</p><p class="mt-2 text-sm font-semibold text-red-600">Esto solo tendrá éxito si el estado no está siendo usado por ninguna denuncia.</p>`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#E74C3C',
      cancelButtonColor: '#4A5568',
    });

    if (!confirm.isConfirmed) return;

    try {
      await deleteComplaintStatus(statusItem._id);
      await Swal.fire({
        icon: 'success',
        title: 'Estado eliminado',
        text: 'El estado ha sido borrado físicamente del servidor.',
        timer: 2000,
        showConfirmButton: false,
      });
      fetchStatuses();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'No se puede eliminar',
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
          <h1 className="text-2xl font-bold text-primary">Estados de Denuncia</h1>
          <p className="text-sm text-neutral mt-0.5">
            {filteredStatuses.length} estado{filteredStatuses.length !== 1 ? 's' : ''} registrado{filteredStatuses.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => { setStatusToEdit(null); setShowModal(true); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-gray-950 active:scale-95 transition-all duration-150"
        >
          + Crear estado
        </button>
      </div>

      {/* Buscador + Tabla */}
      <div className="bg-white rounded-xl shadow-sm px-6 py-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre..."
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-secondary"
        />

        {loading ? (
          <p className="text-neutral text-sm py-8 text-center">Cargando...</p>
        ) : filteredStatuses.length === 0 ? (
          <p className="text-neutral text-sm py-8 text-center">No se encontraron estados de denuncia.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse min-w-[640px]">
              <thead>
                <tr className="bg-surface text-neutral text-left text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 border-b w-48">Nombre</th>
                  <th className="px-4 py-3 border-b w-36">Color (Badge)</th>
                  <th className="px-4 py-3 border-b w-24">Core (Por Defecto)</th>
                  <th className="px-4 py-3 border-b w-28">Estado Activo</th>
                  <th className="px-4 py-3 border-b w-64">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredStatuses.map((s) => (
                  <tr key={s._id} className="hover:bg-surface border-b transition-colors">
                    <td className="px-4 py-3 font-medium text-primary">
                      {s.name}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {/* Círculo de color puro para verlo mejor */}
                        <span 
                          className="w-4 h-4 rounded-full shadow-sm border border-gray-200"
                          style={{ backgroundColor: s.color || '#9CA3AF' }}
                          title={s.color || '#9CA3AF'}
                        ></span>
                        {/* Texto como se vería en un badge */}
                        <span 
                          className="px-2 py-0.5 rounded text-xs font-semibold text-white shadow-sm"
                          style={{ backgroundColor: s.color || '#9CA3AF' }}
                        >
                           {s.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {s.isDefault ? (
                        <span className="flex items-center gap-1 text-xs text-orange-600 font-bold" title="No puede ser eliminado">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                          Por Defecto
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                        s.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {s.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setStatusToEdit(s); setShowModal(true); }}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-all duration-200"
                        >
                          Editar
                        </button>

                        <button
                          onClick={() => handleToggleStatus(s)}
                          className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full border transition-all duration-200 ${
                            s.isActive
                              ? 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 hover:border-orange-300'
                              : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300'
                          }`}
                        >
                          {s.isActive ? 'Desactivar' : 'Activar'}
                        </button>

                        {/* Botón Oculto si es default (RF-19) o si está en uso */}
                        {!s.isDefault && (!s.usageCount || s.usageCount === 0) && (
                          <button
                            onClick={() => handleDelete(s)}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-300 transition-all duration-200"
                          >
                            Eliminar
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

      {showModal && (
        <ComplaintStatusFormModal
          estadoInicial={statusToEdit}
          onGuardar={statusToEdit ? handleEdit : handleCreate}
          onCerrar={() => { setShowModal(false); setStatusToEdit(null); }}
        />
      )}

    </div>
  );
}
