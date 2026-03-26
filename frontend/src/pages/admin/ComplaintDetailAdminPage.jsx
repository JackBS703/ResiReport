import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getComplaintById,
  updateComplaintStatus,
  updateComplaintPriority,
} from '@/api/complaintsApi';
import { getActiveComplaintStatuses } from '@/api/catalogApi';
import StatusBadge from '@/components/shared/StatusBadge';
import PriorityBadge from '@/components/shared/PriorityBadge';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { formatDate } from '@/utils/formatDate';
import { PRIORIDADES, PRIORIDAD_LABELS } from '@/utils/constants';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const ComplaintDetailAdminPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [estados, setEstados] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estado para el cambio de estado
  const [nuevoEstadoId, setNuevoEstadoId] = useState('');
  const [confirmEstado, setConfirmEstado] = useState(false);

  // Estado para el cambio de prioridad
  const [nuevaPrioridad, setNuevaPrioridad] = useState('');

  useEffect(() => {
    const cargar = async () => {
      try {
        const [resComplaint, resEstados] = await Promise.all([
          getComplaintById(id),
          getActiveComplaintStatuses(),
        ]);
        setComplaint(resComplaint.data.data);
        setEstados(resEstados.data.data);
        setNuevaPrioridad(resComplaint.data.data.prioridad);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    cargar();
  }, [id]);

  const handleCambiarEstado = async () => {
    try {
      const res = await updateComplaintStatus(id, nuevoEstadoId);
      setComplaint(res.data.data);
      setNuevoEstadoId('');
    } catch (err) {
      console.error(err);
    } finally {
      setConfirmEstado(false);
    }
  };

  const handleCambiarPrioridad = async (prioridad) => {
    try {
      const res = await updateComplaintPriority(id, prioridad);
      setComplaint(res.data.data);
      setNuevaPrioridad(prioridad);
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (!complaint) return <p className="text-red-500 p-6">Denuncia no encontrada.</p>;

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">

      <button
        onClick={() => navigate('/denuncias')}
        className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="w-4 h-4" /> Volver a denuncias
      </button>

      {/* Encabezado */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">{complaint.titulo}</h1>
          <p className="text-sm text-slate-500 mt-1">
            {complaint.residente?.nombre} · {complaint.residente?.torre} · Apto {complaint.residente?.apartamento}
          </p>
        </div>
        <StatusBadge estado={complaint.estado} />
      </div>

      {/* Detalle */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-3">
        <div>
          <span className="text-xs text-slate-400 uppercase font-medium">Descripción</span>
          <p className="text-sm text-slate-700 mt-1">{complaint.descripcion}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-slate-400 uppercase font-medium">Tipo</span>
            <p className="text-sm text-slate-700 mt-1">{complaint.tipo?.nombre}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase font-medium">Ubicación</span>
            <p className="text-sm text-slate-700 mt-1">{complaint.ubicacion}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase font-medium">Fecha</span>
            <p className="text-sm text-slate-700 mt-1">{formatDate(complaint.createdAt)}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase font-medium">Prioridad</span>
            <div className="mt-1"><PriorityBadge prioridad={complaint.prioridad} /></div>
          </div>
        </div>
      </div>

      {/* Acciones admin */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-4">
        <h2 className="font-semibold text-slate-700">Acciones</h2>

        {/* Cambiar estado */}
        <div className="flex items-center gap-3">
          <select
            value={nuevoEstadoId}
            onChange={(e) => setNuevoEstadoId(e.target.value)}
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm flex-1"
          >
            <option value="">Seleccionar nuevo estado...</option>
            {estados.map((e) => (
              <option key={e._id} value={e._id}>{e.nombre}</option>
            ))}
          </select>
          <Button
            size="sm"
            disabled={!nuevoEstadoId}
            onClick={() => setConfirmEstado(true)}
          >
            Cambiar estado
          </Button>
        </div>

        {/* Cambiar prioridad — sin confirmDialog, acción directa RF-30 */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Prioridad:</span>
          {Object.values(PRIORIDADES).map((p) => (
            <button
              key={p}
              onClick={() => handleCambiarPrioridad(p)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors
                ${nuevaPrioridad === p
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
            >
              {PRIORIDAD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Historial de estados — RF-31 */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="font-semibold text-slate-700 mb-3">Historial de cambios</h2>
        {complaint.statusHistory.length === 0 ? (
          <p className="text-sm text-slate-400">Sin cambios registrados.</p>
        ) : (
          <ul className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
            {[...complaint.statusHistory].reverse().map((h, i) => (
              <li key={i} className="text-sm text-slate-600 flex items-center gap-2">
                <span className="text-slate-400">{formatDate(h.fecha)}</span>
                <span className="font-medium">{h.cambiadoPor?.nombre}</span>
                <span className="text-slate-400">cambió a</span>
                <StatusBadge estado={h.estadoNuevo} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ConfirmDialog para cambio de estado */}
      <ConfirmDialog
        open={confirmEstado}
        onClose={() => setConfirmEstado(false)}
        onConfirm={handleCambiarEstado}
        titulo="¿Cambiar estado?"
        descripcion="Esta acción quedará registrada en el historial de la denuncia."
        labelConfirmar="Sí, cambiar"
        variante="default"
      />

    </div>
  );
};

export default ComplaintDetailAdminPage;