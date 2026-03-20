import { useState, useEffect } from 'react';
import { getResidents, createResident } from '../../api/residentsApi';
import ResidentFormModal from '../../components/residents/ResidentFormModal';
import Swal from 'sweetalert2';

export default function ResidentsPage() {
  const [residents, setResidents] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

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
          className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg shadow hover:bg-gray-950 transition-colors"
        >
          <span className="text-lg leading-none">+</span>
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
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      r.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {r.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <ResidentFormModal
          onClose={() => setShowModal(false)}
          onSave={handleCreate}
        />
      )}
    </div>
  );
}
