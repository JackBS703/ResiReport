import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createComplaint } from '@/api/complaintsApi';
import { getActiveComplaintTypes } from '@/api/catalogApi';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { parseApiError } from '@/utils/parseApiError';

const CreateComplaintPage = () => {
  const navigate = useNavigate();
  const [tipos, setTipos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    ubicacion: '',
    tipo: '',
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getActiveComplaintTypes();
        setTipos(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validate()) return;

    setSubmitting(true);
    try {
      await createComplaint(form);
      navigate('/mis-denuncias');
    } catch (err) {
      console.error(err);
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setApiError(parseApiError(err));
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-slate-800 mb-4">Crear denuncia</h1>
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
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

        <div className="flex items-center gap-2">
          <Button type="submit" disabled={submitting}>{submitting ? 'Guardando...' : 'Crear denuncia'}</Button>
          <Button variant="outline" type="button" onClick={() => navigate('/mis-denuncias')}>Cancelar</Button>
        </div>
      </form>
    </div>
  );
};

export default CreateComplaintPage;
