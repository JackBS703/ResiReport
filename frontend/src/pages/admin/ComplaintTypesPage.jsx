import { useState, useEffect } from 'react';
import {
  getComplaintTypes,
  createComplaintType,
  updateComplaintType,
  toggleComplaintTypeStatus,
  deleteComplaintType
} from '../../api/catalogApi';
import ComplaintTypeFormModal from '../../components/admins/ComplaintTypeFormModal';
import { parseApiError } from '../../utils/parseApiError';
import Swal from 'sweetalert2';

export default function ComplaintTypesPage() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeToEdit, setTypeToEdit] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchTypes = async () => {
    setLoading(true);
    try {
      const res = await getComplaintTypes();
      setTypes(res.data.data);
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
    fetchTypes();
  }, []);

  // Filtrado local case insensitive con search
  const filteredTypes = types.filter((t) => 
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  // ── Crear ──
  const handleCreate = async (data) => {
    try {
      const res = await createComplaintType(data);
      await Swal.fire({
        icon: 'success',
        title: '¡Tipo creado!',
        text: res.data.message || 'Tipo de denuncia creado exitosamente.',
        confirmButtonColor: '#2E6DA4',
        timer: 2000,
        showConfirmButton: false,
      });
      setShowModal(false);
      fetchTypes();
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
      await updateComplaintType(typeToEdit?._id, data);
      await Swal.fire({
        icon: 'success',
        title: 'Tipo actualizado',
        text: 'Los datos fueron guardados exitosamente.',
        timer: 2000,
        showConfirmButton: false,
      });
      setShowModal(false);
      setTypeToEdit(null);
      fetchTypes();
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

  // ── Toggle estado ──
  const handleToggleStatus = async (typeItem) => {
    const accion = typeItem.isActive ? 'desactivar' : 'activar';
    const accionPasado = typeItem.isActive ? 'desactivado' : 'activado';

    const confirm = await Swal.fire({
      icon: 'warning',
      title: `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} tipo de denuncia?`,
      html: `<p>Estás a punto de <strong>${accion}</strong> el tipo <strong>${typeItem.name}</strong>.</p> ${typeItem.isActive ? '<p class="mt-2 text-sm text-gray-500">Al desactivarlo, no aparecerá para nuevas denuncias, pero las denuncias existentes no se verán afectadas.</p>' : ''}`,
      showCancelButton: true,
      confirmButtonText: `Sí, ${accion}`,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: typeItem.isActive ? '#E74C3C' : '#27AE60',
      cancelButtonColor: '#4A5568',
    });

    if (!confirm.isConfirmed) return;

    try {
      await toggleComplaintTypeStatus(typeItem._id, !typeItem.isActive);
      await Swal.fire({
        icon: 'success',
        title: `Tipo ${accionPasado}`,
        text: `El tipo de denuncia fue ${accionPasado} exitosamente.`,
        timer: 2000,
        showConfirmButton: false,
      });
      fetchTypes();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error al cambiar estado',
        text: parseApiError(err),
        confirmButtonColor: '#E74C3C',
      });
    }
  };

  // ── Eliminar Físico ──
  const handleDelete = async (typeItem) => {
    const confirm = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar definitivamente?',
      html: `<p>Vas a eliminar permanentemente <strong>${typeItem.name}</strong>.</p><p class="mt-2 text-sm font-semibold text-red-600">¡Esta acción solo funcionará si nadie ha utilizado este tipo de denuncia antes!</p>`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#E74C3C',
      cancelButtonColor: '#4A5568',
    });

    if (!confirm.isConfirmed) return;

    try {
      await deleteComplaintType(typeItem._id);
      await Swal.fire({
        icon: 'success',
        title: 'Tipo eliminado',
        text: 'El tipo de denuncia ha sido borrado físicamente.',
        timer: 2000,
        showConfirmButton: false,
      });
      fetchTypes();
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
          <h1 className="text-2xl font-bold text-primary">Tipos de Denuncia</h1>
          <p className="text-sm text-neutral mt-0.5">
            {filteredTypes.length} tipo{filteredTypes.length !== 1 ? 's' : ''} registrado{filteredTypes.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => { setTypeToEdit(null); setShowModal(true); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-gray-950 active:scale-95 transition-all duration-150"
        >
          + Crear tipo
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
        ) : filteredTypes.length === 0 ? (
          <p className="text-neutral text-sm py-8 text-center">No se encontraron tipos de denuncia.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse min-w-[640px]">
              <thead>
                <tr className="bg-surface text-neutral text-left text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 border-b w-64">Nombre</th>
                  <th className="px-4 py-3 border-b">Descripción</th>
                  <th className="px-4 py-3 border-b w-28">Estado</th>
                  <th className="px-4 py-3 border-b w-64">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredTypes.map((t) => (
                  <tr key={t._id} className="hover:bg-surface border-b transition-colors">
                    <td className="px-4 py-3 font-medium text-primary">
                      {t.name}
                    </td>
                    <td className="px-4 py-3 text-neutral">
                      {t.description || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                        t.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {t.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setTypeToEdit(t); setShowModal(true); }}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-all duration-200"
                        >
                          Editar
                        </button>

                        <button
                          onClick={() => handleToggleStatus(t)}
                          className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full border transition-all duration-200 ${
                            t.isActive
                              ? 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 hover:border-orange-300'
                              : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300'
                          }`}
                        >
                          {t.isActive ? 'Desactivar' : 'Activar'}
                        </button>

                        <button
                          onClick={() => handleDelete(t)}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-300 transition-all duration-200"
                        >
                          Eliminar
                        </button>
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
        <ComplaintTypeFormModal
          tipoInicial={typeToEdit}
          onGuardar={typeToEdit ? handleEdit : handleCreate}
          onCerrar={() => { setShowModal(false); setTypeToEdit(null); }}
        />
      )}

    </div>
  );
}
