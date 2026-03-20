import { useState, useEffect } from 'react';
import { updateResident, getResidents, createResident, toggleResidentStatus } from '../../api/residentsApi';
import ResidentFormModal from '../../components/residents/ResidentFormModal';
import Swal from 'sweetalert2';

export default function ResidentsPage() {
  const [residents, setResidents] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [residentToEdit, setResidentToEdit] = useState(null);


  const fetchResidents = async (q = '') => {
    setLoading(true);
    try {
      const res = await getResidents({ search: q });
      setResidents(res.data.data);
      setTotal(res.data.total);
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los residentes',
        confirmButtonColor: '#E74C3C',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResidents();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchResidents(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleCreate = async (data) => {
    try {
      const res = await createResident(data);

      if (res.data.warnings?.length > 0) {
        await Swal.fire({
          icon: 'warning',
          title: 'Residente creado con advertencia',
          text: res.data.warnings[0],
          confirmButtonColor: '#2E6DA4',
        });
      } else {
        await Swal.fire({
          icon: 'success',
          title: '¡Residente creado!',
          text: res.data.message,
          confirmButtonColor: '#2E6DA4',
          timer: 2000,
          showConfirmButton: false,
        });
      }

      setShowModal(false);
      fetchResidents(search);
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al crear el residente';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: msg,
        confirmButtonColor: '#E74C3C',
      });
    }
  };

  const handleEdit = async (data) => {
    try {
      await updateResident(residentToEdit._id, data);
      await Swal.fire({
        icon: 'success',
        title: 'Residente actualizado',
        text: 'Los datos fueron guardados exitosamente.',
        timer: 2000,
        showConfirmButton: false,
      });
      setResidentToEdit(null);
      fetchResidents(search);
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al actualizar el residente';
      Swal.fire({ icon: 'error', title: 'Error', text: msg, confirmButtonColor: '#E74C3C' });
    }
  };

  const handleToggleStatus = async (resident) => {
    const accion = resident.isActive ? 'desactivar' : 'activar';
    const accionPasado = resident.isActive ? 'desactivado' : 'activado';

    const confirm = await Swal.fire({
      icon: 'warning',
      title: `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} residente?`,
      html: `<p>Estás a punto de <strong>${accion}</strong> la cuenta de <strong>${resident.nombre}</strong>.</p>
             ${resident.isActive ? '<p class="text-sm text-gray-500 mt-1">Sus denuncias seguirán visibles en el sistema.</p>' : ''}`,
      showCancelButton: true,
      confirmButtonText: `Sí, ${accion}`,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: resident.isActive ? '#E74C3C' : '#27AE60',
      cancelButtonColor: '#4A5568',
    });

    if (!confirm.isConfirmed) return;

    try {
      await toggleResidentStatus(resident._id, !resident.isActive);
      await Swal.fire({
        icon: 'success',
        title: `Residente ${accionPasado}`,
        text: `La cuenta de ${resident.nombre} fue ${accionPasado} exitosamente.`,
        timer: 2000,
        showConfirmButton: false,
      });
      fetchResidents(search);
    } catch (err) {
      const msg = err.response?.data?.message || `Error al ${accion} el residente`;
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: msg,
        confirmButtonColor: '#E74C3C',
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6 bg-white rounded-xl shadow-sm px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Residentes</h1>
          <p className="text-sm text-neutral mt-0.5">
            {total} registro{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-gray-950 active:scale-95 transition-all duration-150"
        >
          Crear residente
        </button>

      </div>

      {/* Buscador + Tabla */}
      <div className="bg-white rounded-xl shadow-sm px-6 py-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, correo o apartamento..."
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-secondary"
        />

        {loading ? (
          <p className="text-neutral text-sm py-8 text-center">Cargando...</p>
        ) : residents.length === 0 ? (
          <p className="text-neutral text-sm py-8 text-center">No hay residentes registrados.</p>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-surface text-neutral text-left text-xs uppercase tracking-wide">
                <th className="px-4 py-3 border-b">Nombre</th>
                <th className="px-4 py-3 border-b">Correo</th>
                <th className="px-4 py-3 border-b">Torre</th>
                <th className="px-4 py-3 border-b">Apto</th>
                <th className="px-4 py-3 border-b">Tipo</th>
                <th className="px-4 py-3 border-b">Estado</th>
                <th className="px-4 py-3 border-b">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {residents.map((r) => (
                <tr key={r._id} className="hover:bg-surface border-b transition-colors">
                  <td className="px-4 py-3 font-medium text-primary">{r.nombre}</td>
                  <td className="px-4 py-3 text-neutral">{r.correo}</td>
                  <td className="px-4 py-3">{r.torre}</td>
                  <td className="px-4 py-3">{r.apartamento}</td>
                  <td className="px-4 py-3 capitalize">{r.tipoResidente || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${r.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-600'
                      }`}>
                      {r.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">

                      <button
                        onClick={() => setResidentToEdit(r)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-all duration-200"
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => handleToggleStatus(r)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border transition-all duration-200 ${r.isActive
                            ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:border-red-300'
                            : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300'
                          }`}
                      >
                        {r.isActive ? 'Desactivar' : 'Activar'}
                      </button>

                    </div>
                  </td>
                </tr>
              ))}

            </tbody>
          </table>
        )}
      </div>

      {/* Modal crear */}
      {showModal && (
        <ResidentFormModal
          onClose={() => setShowModal(false)}
          onSave={handleCreate}
        />
      )}

      {/* Modal editar */}
      {residentToEdit && (
        <ResidentFormModal
          residentToEdit={residentToEdit}
          onClose={() => setResidentToEdit(null)}
          onSave={handleEdit}
        />
      )}

    </div>
  );
}

