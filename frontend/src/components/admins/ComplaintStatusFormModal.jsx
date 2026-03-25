import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

export default function ComplaintStatusFormModal({
  estadoInicial = null,
  onGuardar,
  onCerrar,
}) {
  const isEditing = !!estadoInicial;
  const isDefault = estadoInicial?.isDefault;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    if (estadoInicial) {
      reset({
        name: estadoInicial.name || '',
        color: estadoInicial.color || '#3B82F6',
        isActive: estadoInicial.isActive ?? true,
      });
    } else {
      reset({
        name: '',
        color: '#3B82F6', // Un azul por defecto
        isActive: true,
      });
    }
  }, [estadoInicial, reset]);

  const submitHandler = async (data) => {
    try {
      await onGuardar(data);
    } catch (err) {
      if (err?.response?.status === 409 || err?.response?.status === 400) {
        setError('name', {
          type: 'manual',
          message: 'Es posible que este estado ya exista.',
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
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm mx-4 p-6">

        <h2 className="text-lg font-bold text-primary mb-5">
          {isEditing ? 'Editar estado' : 'Crear estado'}
        </h2>

        <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-neutral mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              placeholder="Ej. En Revisión, Completado..."
              disabled={isDefault}
              title={isDefault ? "No puedes cambiar el nombre de un estado por defecto" : ""}
              {...register('name', {
                required: 'El nombre es obligatorio',
                minLength: { value: 3, message: 'Mínimo 3 caracteres' },
                maxLength: { value: 30, message: 'Máximo 30 caracteres' },
              })}
              className={`w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary ${isDefault ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
            )}
            {isDefault && (
              <p className="text-xs text-gray-500 mt-1">El nombre de un estado Core es inmutable.</p>
            )}
          </div>

          {/* Color del Badge */}
          <div>
            <label className="block text-sm font-medium text-neutral mb-1">
              Color del identificar (Badge)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                {...register('color')}
                className="w-10 h-10 border-0 p-0 cursor-pointer rounded overflow-hidden"
              />
              <span className="text-sm text-gray-500">Selecciona el color base</span>
            </div>
          </div>

          {/* Estado — solo al crear o si no es default (aunque el srs permite desactivar default con advertencia) */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActive"
              {...register('isActive')}
              className="w-4 h-4 accent-secondary"
            />
            <label htmlFor="isActive" className="text-sm text-neutral">
              Estado activo
            </label>
          </div>

          {/* Error global */}
          {errors.root && (
            <p className="text-xs text-red-500">{errors.root.message}</p>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4">
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
                : isEditing ? 'Guardar cambios' : 'Crear estado'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
