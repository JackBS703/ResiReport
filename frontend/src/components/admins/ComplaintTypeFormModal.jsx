import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

export default function ComplaintTypeFormModal({
  tipoInicial = null,
  onGuardar,
  onCerrar,
}) {
  const isEditing = !!tipoInicial;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    if (tipoInicial) {
      reset({
        name: tipoInicial.name || '',
        description: tipoInicial.description || '',
        isActive: tipoInicial.isActive ?? true,
      });
    } else {
      reset({
        name: '',
        description: '',
        isActive: true,
      });
    }
  }, [tipoInicial, reset]);

  const submitHandler = async (data) => {
    try {
      await onGuardar(data);
    } catch (err) {
      // 409 o 400 si el backend avisa de duplicado
      if (err?.response?.status === 409 || err?.response?.status === 400) {
        setError('name', {
          type: 'manual',
          message: 'Es posible que este tipo ya exista.',
        });
        return;
      }
      setError('root', {
        type: 'manual',
        message: 'Ocurrió un error. Intenta de nuevo.',
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg mx-4 p-6">

        <h2 className="text-lg font-bold text-primary mb-5">
          {isEditing ? 'Editar tipo de denuncia' : 'Crear tipo de denuncia'}
        </h2>

        <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-neutral mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              placeholder="Ej. Seguridad, Ruido, Aseo..."
              {...register('name', {
                required: 'El nombre es obligatorio',
                minLength: { value: 3, message: 'Mínimo 3 caracteres' },
                maxLength: { value: 50, message: 'Máximo 50 caracteres' },
              })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-neutral mb-1">
              Descripción <span className="text-gray-400 text-xs">(opcional)</span>
            </label>
            <textarea
              placeholder="Ej. Problemas relacionados con la seguridad de la unidad..."
              rows={3}
              {...register('description', {
                maxLength: { value: 250, message: 'Máximo 250 caracteres' },
              })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
            />
            {errors.description && (
              <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Estado — solo al crear */}
          {!isEditing && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                defaultChecked
                {...register('isActive')}
                className="w-4 h-4 accent-secondary"
              />
              <label htmlFor="isActive" className="text-sm text-neutral">
                Tipo activo
              </label>
            </div>
          )}

          {/* Error global */}
          {errors.root && (
            <p className="text-xs text-red-500">{errors.root.message}</p>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCerrar}
              className="px-4 py-2 text-sm text-neutral border border-gray-200 rounded-lg hover:bg-surface transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-950 transition-colors disabled:opacity-50"
            >
              {isSubmitting
                ? isEditing ? 'Guardando...' : 'Creando...'
                : isEditing ? 'Guardar cambios' : 'Crear tipo'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
