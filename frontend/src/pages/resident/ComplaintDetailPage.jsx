import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getComplaintById, updateComplaint } from '@/api/complaintsApi';
import { getActiveComplaintTypes } from '@/api/catalogApi';
import StatusBadge from '@/components/shared/StatusBadge';
import PriorityBadge from '@/components/shared/PriorityBadge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { formatDate } from '@/utils/formatDate';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { parseApiError } from '@/utils/parseApiError';

const ComplaintDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [tipos, setTipos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ titulo: '', descripcion: '', ubicacion: '', tipo: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    const loadComplaint = async () => {
      setIsLoading(true);
      try {
        const [resComplaint, resTipos] = await Promise.all([
          getComplaintById(id),
          getActiveComplaintTypes(),
        ]);

        const data = resComplaint.data.data;
        setComplaint(data);
        setTipos(resTipos.data.data);
        setForm({
          titulo: data.titulo || '',
          descripcion: data.descripcion || '',
          ubicacion: data.ubicacion || '',
          tipo: data.tipo?._id || '',
        });
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadComplaint();
  }, [id]);

  if (isLoading) return <LoadingSpinner />;
  if (!complaint) return <p className="text-red-500 p-6">Denuncia no encontrada.</p>;

  const isEditable = complaint.estado?.nombre === 'Registrada';

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

  const handleSave = async () => {
    setApiError('');
    if (!validate()) return;

    try {
      const res = await updateComplaint(id, {
        titulo: form.titulo,
        descripcion: form.descripcion,
        ubicacion: form.ubicacion,
        tipo: form.tipo,
      });
      setComplaint(res.data.data);
      setEditing(false);
    } catch (err) {
      console.error(err);
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setApiError(parseApiError(err));
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <button
        onClick={() => navigate('/mis-denuncias')}
        className="text-sm text-slate-500 hover:text-slate-700"
      >
        ← Volver a mis denuncias
      </button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">{complaint.titulo}</h1>
          <p className="text-sm text-slate-500 mt-1">Creada el {formatDate(complaint.createdAt)}</p>
        </div>
        <StatusBadge estado={complaint.estado?.nombre} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <span className="block text-xs text-slate-400 uppercase font-medium">Tipo</span>
          <p className="text-sm text-slate-700 mt-1">{complaint.tipo?.nombre}</p>
        </div>
        <div>
          <span className="block text-xs text-slate-400 uppercase font-medium">Ubicación</span>
          <p className="text-sm text-slate-700 mt-1">{complaint.ubicacion}</p>
        </div>
        <div>
          <span className="block text-xs text-slate-400 uppercase font-medium">Prioridad</span>
          <div className="mt-1"><PriorityBadge prioridad={complaint.prioridad} /></div>
        </div>
      </div>

      {editing && isEditable ? (
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">Editar denuncia</h2>

          <div>
            <label className="block text-sm font-medium text-slate-700">Título</label>
            <Input
              value={form.titulo}
              onChange={(e) => setForm((prev) => ({ ...prev, titulo: e.target.value }))}
            />
            {errors.titulo && <p className="text-xs text-red-600 mt-1">{errors.titulo}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Descripción</label>
            <Textarea
              value={form.descripcion}
              onChange={(e) => setForm((prev) => ({ ...prev, descripcion: e.target.value }))}
              className="h-24"
            />
            {errors.descripcion && <p className="text-xs text-red-600 mt-1">{errors.descripcion}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Ubicación</label>
            <Input
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

          <div className="flex gap-2">
            <Button onClick={handleSave}>Guardar</Button>
            <Button variant="outline" onClick={() => setEditing(false)}>Cancelar</Button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <h2 className="text-lg font-semibold text-slate-800">Descripción</h2>
          <p className="text-sm text-slate-700">{complaint.descripcion}</p>
          {isEditable ? (
            <Button onClick={() => setEditing(true)}>Editar (estado Registrada)</Button>
          ) : (
            <p className="text-sm text-slate-500">No puedes editar porque el estado no es Registrada.</p>
          )}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-800">Historial</h2>
        {complaint.statusHistory?.length ? (
          <ul className="space-y-2 mt-3">
            {[...complaint.statusHistory].reverse().map((h) => (
              <li key={h.fecha} className="text-sm text-slate-600 border border-slate-100 rounded-lg p-2">
                <p><span className="font-medium">{new Date(h.fecha).toLocaleString()}:</span> {h.cambiadoPor?.nombre || 'Sistema'}</p>
                <p>De <strong>{h.estadoAnterior?.nombre || 'N/A'}</strong> a <strong>{h.estadoNuevo?.nombre}</strong></p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500 mt-2">No hay historial registrado.</p>
        )}
      </div>
    </div>
  );
};

export default ComplaintDetailPage;
