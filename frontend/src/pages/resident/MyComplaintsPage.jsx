import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getMyComplaints, createComplaint, updateComplaint } from '@/api/complaintsApi';
import { getActiveComplaintStatuses, getActiveComplaintTypes } from '@/api/catalogApi';
import useDebounce from '@/hooks/useDebounce';
import SearchInput from '@/components/shared/SearchInput';
import StatusBadge from '@/components/shared/StatusBadge';
import PriorityBadge from '@/components/shared/PriorityBadge';
import TotalCount from '@/components/shared/TotalCount';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import { formatDateShort } from '@/utils/formatDate';
import { Button } from '@/components/ui/button';
import { parseApiError } from '@/utils/parseApiError';

const MyComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [estados, setEstados] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroPrioridad, setFiltroPrioridad] = useState('');

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const [form, setForm] = useState({ titulo: '', descripcion: '', ubicacion: '', tipo: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const searchDebounced = useDebounce(search, 400);

  useEffect(() => setPage(1), [searchDebounced, filtroEstado, filtroPrioridad]);

  const loadComplaints = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = { page, limit: 10 };
      if (searchDebounced) params.search = searchDebounced;
      if (filtroEstado) params.estado = filtroEstado;
      if (filtroPrioridad) params.prioridad = filtroPrioridad;

      const res = await getMyComplaints(params);
      setComplaints(res.data.data);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [page, searchDebounced, filtroEstado, filtroPrioridad]);

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [resEstados, resTipos] = await Promise.all([
          getActiveComplaintStatuses(),
          getActiveComplaintTypes(),
        ]);
        setEstados(resEstados.data.data);
        setTipos(resTipos.data.data);
      } catch (err) {
        console.error(err);
      }
    };

    loadMetadata();
  }, []);

  useEffect(() => { loadComplaints(); }, [loadComplaints]);

  const limpiarFiltros = () => {
    setSearch('');
    setFiltroEstado('');
    setFiltroPrioridad('');
  };

  const resetForm = () => {
    setForm({ titulo: '', descripcion: '', ubicacion: '', tipo: '' });
    setErrors({});
    setApiError('');
  };

  const validate = () => {
    const validation = {};
    if (!form.titulo.trim()) validation.titulo = 'El título es obligatorio';
    else if (form.titulo.trim().length < 5) validation.titulo = 'El título debe tener al menos 5 caracteres';

    if (!form.descripcion.trim()) validation.descripcion = 'La descripción es obligatoria';
    else if (form.descripcion.trim().length < 10) validation.descripcion = 'La descripción debe tener al menos 10 caracteres';

    if (!form.ubicacion.trim()) validation.ubicacion = 'La ubicación es obligatoria';
    else if (form.ubicacion.trim().length < 5) validation.ubicacion = 'La ubicación debe tener al menos 5 caracteres';

    if (!form.tipo) validation.tipo = 'El tipo de denuncia es obligatorio';

    setErrors(validation);
    return Object.keys(validation).length === 0;
  };

  const handleCreate = async () => {
    setApiError('');
    if (!validate()) return;
    setActionLoading(true);

    try {
      await createComplaint(form);
      setShowCreateModal(false);
      resetForm();
      loadComplaints();
    } catch (err) {
      if (err.response?.data?.errors) setErrors(err.response.data.errors);
      else setApiError(parseApiError(err));
    } finally { setActionLoading(false); }
  };

  const handleStartEdit = (complaint) => {
    setSelectedComplaint(complaint);
    setForm({
      titulo: complaint.titulo,
      descripcion: complaint.descripcion,
      ubicacion: complaint.ubicacion,
      tipo: complaint.tipo?._id || '',
    });
    setErrors({});
    setApiError('');
    setShowEditModal(true);
  };

  const handleEdit = async () => {
    setApiError('');
    if (!validate()) return;
    if (!selectedComplaint) return;
    setActionLoading(true);

    try {
      await updateComplaint(selectedComplaint._id, form);
      setShowEditModal(false);
      setSelectedComplaint(null);
      resetForm();
      loadComplaints();
    } catch (err) {
      if (err.response?.data?.errors) setErrors(err.response.data.errors);
      else setApiError(parseApiError(err));
    } finally { setActionLoading(false); }
  };

  const openDetail = (complaint) => {
    setSelectedComplaint(complaint);
    setShowDetailModal(true);
  };

  const prioridadOptions = [
    { value: 'sinasignar', label: 'Sin asignar' },
    { value: 'baja', label: 'Baja' },
    { value: 'media', label: 'Media' },
    { value: 'alta', label: 'Alta' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">Mis denuncias</h1>
        <div className="flex items-center gap-2">
          <TotalCount total={total} label="denuncia(s)" />
          <Dialog open={showCreateModal} onOpenChange={(open) => { setShowCreateModal(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button>Crear denuncia</Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Crear denuncia</DialogTitle>
                <DialogDescription>Completa los datos para registrar una nueva denuncia.</DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Título</label>
                  <input
                    className="h-8 w-full rounded-lg border border-input px-2.5 text-sm"
                    value={form.titulo}
                    onChange={(e) => setForm((prev) => ({ ...prev, titulo: e.target.value }))}
                  />
                  {errors.titulo && <p className="text-xs text-red-600 mt-1">{errors.titulo}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Descripción</label>
                  <textarea
                    className="w-full rounded-lg border border-input p-2.5 text-sm"
                    rows={4}
                    value={form.descripcion}
                    onChange={(e) => setForm((prev) => ({ ...prev, descripcion: e.target.value }))}
                  />
                  {errors.descripcion && <p className="text-xs text-red-600 mt-1">{errors.descripcion}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Ubicación</label>
                  <input
                    className="h-8 w-full rounded-lg border border-input px-2.5 text-sm"
                    value={form.ubicacion}
                    onChange={(e) => setForm((prev) => ({ ...prev, ubicacion: e.target.value }))}
                  />
                  {errors.ubicacion && <p className="text-xs text-red-600 mt-1">{errors.ubicacion}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Tipo</label>
                  <select
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                    value={form.tipo}
                    onChange={(e) => setForm((prev) => ({ ...prev, tipo: e.target.value }))}
                  >
                    <option value="">Selecciona un tipo</option>
                    {tipos.map((tipo) => (
                      <option key={tipo._id} value={tipo._id}>{tipo.nombre}</option>
                    ))}
                  </select>
                  {errors.tipo && <p className="text-xs text-red-600 mt-1">{errors.tipo}</p>}
                </div>

                {apiError && <p className="text-sm text-red-600">{apiError}</p>}
              </div>

              <DialogFooter>
                <Button onClick={handleCreate} disabled={actionLoading}>{actionLoading ? 'Guardando...' : 'Crear'}</Button>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <SearchInput placeholder="Buscar por título o ubicación..." onSearch={setSearch} />
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
        >
          <option value="">Todos los estados</option>
          {estados.map((e) => <option key={e._id} value={e._id}>{e.nombre}</option>)}
        </select>

        <select
          value={filtroPrioridad}
          onChange={(e) => setFiltroPrioridad(e.target.value)}
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
        >
          <option value="">Todas las prioridades</option>
          {prioridadOptions.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>

        {(search || filtroEstado || filtroPrioridad) && (
          <button onClick={limpiarFiltros} className="text-sm text-slate-500 hover:text-slate-700 underline">Limpiar filtros</button>
        )}
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : complaints.length === 0 ? (
        <EmptyState titulo="No hay denuncias" descripcion="Aquí aparecerán tus denuncias. Pulsa 'Crear denuncia' para comenzar." />
      ) : (
        <>
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 font-medium">
                <tr>
                  <th className="text-left px-4 py-3">Título</th>
                  <th className="text-left px-4 py-3">Tipo</th>
                  <th className="text-left px-4 py-3">Estado</th>
                  <th className="text-left px-4 py-3">Prioridad</th>
                  <th className="text-left px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {complaints.map((comp) => (
                  <tr key={comp._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800 truncate max-w-[220px]">{comp.titulo}</td>
                    <td className="px-4 py-3 text-slate-600">{comp.tipo?.nombre}</td>
                    <td className="px-4 py-3"><StatusBadge estado={comp.estado} /></td>
                    <td className="px-4 py-3"><PriorityBadge prioridad={comp.prioridad} /></td>
                    <td className="px-4 py-3 text-slate-500">{formatDateShort(comp.createdAt)}</td>
                    <td className="px-4 py-3 space-x-2">
                      <Button size="xs" variant="outline" onClick={() => openDetail(comp)}>Detalle</Button>
                      <Button size="xs" onClick={() => handleStartEdit(comp)} disabled={comp.estado?.nombre !== 'Registrada'}>Editar</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Página {page} de {pages}</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setPage((cur) => Math.max(1, cur - 1))} disabled={page <= 1}>← Anterior</Button>
              <Button size="sm" variant="outline" onClick={() => setPage((cur) => Math.min(pages, cur + 1))} disabled={page >= pages}>Siguiente →</Button>
            </div>
          </div>
        </>
      )}

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Editar denuncia</DialogTitle>
            <DialogDescription>Solo se permite editar cuando el estado es Registrada.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">Título</label>
              <input
                className="h-8 w-full rounded-lg border border-input px-2.5 text-sm"
                value={form.titulo}
                onChange={(e) => setForm((prev) => ({ ...prev, titulo: e.target.value }))}
              />
              {errors.titulo && <p className="text-xs text-red-600 mt-1">{errors.titulo}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Descripción</label>
              <textarea
                className="w-full rounded-lg border border-input p-2.5 text-sm"
                rows={4}
                value={form.descripcion}
                onChange={(e) => setForm((prev) => ({ ...prev, descripcion: e.target.value }))}
              />
              {errors.descripcion && <p className="text-xs text-red-600 mt-1">{errors.descripcion}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Ubicación</label>
              <input
                className="h-8 w-full rounded-lg border border-input px-2.5 text-sm"
                value={form.ubicacion}
                onChange={(e) => setForm((prev) => ({ ...prev, ubicacion: e.target.value }))}
              />
              {errors.ubicacion && <p className="text-xs text-red-600 mt-1">{errors.ubicacion}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Tipo</label>
              <select
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                value={form.tipo}
                onChange={(e) => setForm((prev) => ({ ...prev, tipo: e.target.value }))}
              >
                <option value="">Selecciona un tipo</option>
                {tipos.map((tipo) => <option key={tipo._id} value={tipo._id}>{tipo.nombre}</option>)}
              </select>
              {errors.tipo && <p className="text-xs text-red-600 mt-1">{errors.tipo}</p>}
            </div>
            {apiError && <p className="text-sm text-red-600">{apiError}</p>}
          </div>

          <DialogFooter>
            <Button onClick={handleEdit} disabled={actionLoading}>{actionLoading ? 'Guardando...' : 'Guardar'}</Button>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancelar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Detalle de denuncia</DialogTitle>
          </DialogHeader>

          {selectedComplaint ? (
            <div className="space-y-3">
              <p><strong>Título:</strong> {selectedComplaint.titulo}</p>
              <p><strong>Descripción:</strong> {selectedComplaint.descripcion}</p>
              <p><strong>Ubicación:</strong> {selectedComplaint.ubicacion}</p>
              <p><strong>Tipo:</strong> {selectedComplaint.tipo?.nombre}</p>
              <p><strong>Estado:</strong> <StatusBadge estado={selectedComplaint.estado} /></p>
              <p><strong>Prioridad:</strong> <PriorityBadge prioridad={selectedComplaint.prioridad} /></p>

              <div>
                <h3 className="text-sm font-semibold text-slate-700">Historial de estados</h3>
                {selectedComplaint.statusHistory?.length ? (
                  <ul className="mt-2 space-y-2 max-h-48 overflow-y-auto pr-1">
                    {[...selectedComplaint.statusHistory].reverse().map((h, index) => (
                      <li key={`${h.fecha}-${index}`} className=" rounded-lg border border-slate-200 p-2">
                        <div className="text-xs text-slate-500">{new Date(h.fecha).toLocaleString()}</div>
                        <div className="text-sm text-slate-700">
                          {h.estadoAnterior?.nombre || 'Ninguno'} → <strong>{h.estadoNuevo?.nombre || 'N/A'}</strong> por {h.cambiadoPor?.nombre || 'Sistema'}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">No hay historial registrado.</p>
                )}
              </div>
            </div>
          ) : (
            <p>Cargando detalle...</p>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailModal(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyComplaintsPage;
