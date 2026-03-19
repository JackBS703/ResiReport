import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getComplaints } from '@/api/complaintsApi';
import { getActiveComplaintStatuses } from '@/api/catalogApi';
import useDebounce from '@/hooks/useDebounce';
import SearchInput from '@/components/shared/SearchInput';
import StatusBadge from '@/components/shared/StatusBadge';
import PriorityBadge from '@/components/shared/PriorityBadge';
import TotalCount from '@/components/shared/TotalCount';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import { formatDateShort } from '@/utils/formatDate';
import { PRIORIDADES, PRIORIDAD_LABELS } from '@/utils/constants';

const AllComplaintsPage = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [estados, setEstados] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filtros
  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroPrioridad, setFiltroPrioridad] = useState('');

  const searchDebounced = useDebounce(search, 400);

  const cargarComplaints = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (searchDebounced)  params.search    = searchDebounced;
      if (filtroEstado)     params.estado    = filtroEstado;
      if (filtroPrioridad)  params.prioridad = filtroPrioridad;

      const res = await getComplaints(params);
      setComplaints(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [searchDebounced, filtroEstado, filtroPrioridad]);

  // Carga estados para el filtro
  useEffect(() => {
    getActiveComplaintStatuses()
      .then((res) => setEstados(res.data.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    cargarComplaints();
  }, [cargarComplaints]);

  const limpiarFiltros = () => {
    setSearch('');
    setFiltroEstado('');
    setFiltroPrioridad('');
  };

  return (
    <div className="flex flex-col gap-6">

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">Denuncias</h1>
        <TotalCount total={complaints.length} label="denuncia(s)" />
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 items-center">
        <SearchInput
          placeholder="Buscar por título o ubicación..."
          onSearch={setSearch}
        />

        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
        >
          <option value="">Todos los estados</option>
          {estados.map((e) => (
            <option key={e._id} value={e._id}>{e.nombre}</option>
          ))}
        </select>

        <select
          value={filtroPrioridad}
          onChange={(e) => setFiltroPrioridad(e.target.value)}
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
        >
          <option value="">Todas las prioridades</option>
          {Object.values(PRIORIDADES).map((p) => (
            <option key={p} value={p}>{PRIORIDAD_LABELS[p]}</option>
          ))}
        </select>

        {(search || filtroEstado || filtroPrioridad) && (
          <button
            onClick={limpiarFiltros}
            className="text-sm text-slate-500 hover:text-slate-700 underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Tabla */}
      {isLoading ? (
        <LoadingSpinner />
      ) : complaints.length === 0 ? (
        <EmptyState
          titulo="Sin denuncias"
          descripcion="No hay denuncias que coincidan con los filtros aplicados."
        />
      ) : (
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 font-medium">
              <tr>
                <th className="text-left px-4 py-3">Título</th>
                <th className="text-left px-4 py-3">Residente</th>
                <th className="text-left px-4 py-3">Tipo</th>
                <th className="text-left px-4 py-3">Estado</th>
                <th className="text-left px-4 py-3">Prioridad</th>
                <th className="text-left px-4 py-3">Fecha</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {complaints.map((c) => (
                <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800 max-w-[200px] truncate">
                    {c.titulo}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{c.residente?.nombre}</td>
                  <td className="px-4 py-3 text-slate-600">{c.tipo?.nombre}</td>
                  <td className="px-4 py-3">
                    <StatusBadge estado={c.estado?.nombre} />
                  </td>
                  <td className="px-4 py-3">
                    <PriorityBadge prioridad={c.prioridad} />
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatDateShort(c.createdAt)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigate(`/denuncias/${c._id}`)}
                      className="text-sm text-blue-600 hover:underline font-medium"
                    >
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AllComplaintsPage;