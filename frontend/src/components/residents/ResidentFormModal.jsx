import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import useAuth from '../../hooks/useAuth';

export default function ResidentFormModal({ onClose, onSave, residentToEdit = null }) {
  const { user } = useAuth();
  const isSuperAdmin = user?.rol === 'superadmin';
  const isEditing = !!residentToEdit;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    if (residentToEdit) {
      reset({
        nombre:        residentToEdit.nombre        || '',
        correo:        residentToEdit.correo         || '',
        telefono:      residentToEdit.telefono       || '',
        torre:         residentToEdit.torre          || '',
        apartamento:   residentToEdit.apartamento   || '',
        tipoResidente: residentToEdit.tipoResidente || '',
        password:      '',
      });
    } else {
      reset({
        nombre:        '',
        correo:        '',
        telefono:      '',
        torre:         '',
        apartamento:   '',
        tipoResidente: '',
        isActive:      true,
        password:      '',
      });
    }
  }, [residentToEdit, reset]);

  const submitHandler = (data) => {
    if (!data.tipoResidente) delete data.tipoResidente;
    if (!data.password)      delete data.password;
    onSave(data);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg mx-4 p-6">

        <h2 className="text-lg font-bold text-primary mb-5">
          {isEditing ? 'Editar residente' : 'Crear residente'}
        </h2>

        <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-neutral mb-1">
              Nombre completo <span className="text-red-500">*</span>
            </label>
            <input
              {...register('nombre', {
                required:  'El nombre es obligatorio',
                minLength: { value: 3, message: 'El nombre debe tener al menos 3 caracteres' },
                maxLength: { value: 80, message: 'El nombre no puede superar 80 caracteres' },
                pattern: {
                  value:   /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/,
                  message: 'El nombre solo puede contener letras y espacios',
                },
              })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
            />
            {errors.nombre && (
              <p className="text-xs text-red-500 mt-1">{errors.nombre.message}</p>
            )}
          </div>

          {/* Correo */}
          <div>
            <label className="block text-sm font-medium text-neutral mb-1">
              Correo electrónico <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              {...register('correo', {
                required: 'El correo es obligatorio',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Correo inválido' },
              })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
            />
            {errors.correo && (
              <p className="text-xs text-red-500 mt-1">{errors.correo.message}</p>
            )}
          </div>

          {/* Contraseña — solo visible para SuperAdmin */}
          {isSuperAdmin && (
            <div>
              <label className="block text-sm font-medium text-neutral mb-1">
                {isEditing
                  ? 'Nueva contraseña (dejar vacío para no cambiar)'
                  : <>Contraseña <span className="text-red-500">*</span></>}
              </label>
              <input
                type="password"
                {...register('password', {
                  required: isEditing ? false : 'La contraseña es obligatoria',
                  validate: (value) => {
                    if (!isEditing && value.length < 6) return 'Mínimo 6 caracteres';
                    if (isEditing && value.length > 0 && value.length < 6)
                      return 'Si vas a cambiar la contraseña, debe tener al menos 6 caracteres';
                    return true;
                  },
                })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
              />
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>
          )}

          {/* Torre y Apartamento */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-neutral mb-1">
                Torre <span className="text-red-500">*</span>
              </label>
              <input
                {...register('torre', { required: 'La torre es obligatoria' })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
              />
              {errors.torre && (
                <p className="text-xs text-red-500 mt-1">{errors.torre.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral mb-1">
                Apartamento <span className="text-red-500">*</span>
              </label>
              <input
                {...register('apartamento', { required: 'El apartamento es obligatorio' })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
              />
              {errors.apartamento && (
                <p className="text-xs text-red-500 mt-1">{errors.apartamento.message}</p>
              )}
            </div>
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-neutral mb-1">
              Teléfono <span className="text-gray-400 text-xs">(opcional)</span>
            </label>
            <input
              type="tel"
              inputMode="numeric"
              onKeyDown={(e) => {
                const allowed = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab','+','-'];
                if (!allowed.includes(e.key) && !/^\d$/.test(e.key)) e.preventDefault();
              }}
              {...register('telefono', {
                pattern: {
                  value:   /^[0-9+-]{7,15}$/,
                  message: 'Teléfono inválido (7 a 15 dígitos, puede incluir + y -)',
                },
              })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
            />
            {errors.telefono && (
              <p className="text-xs text-red-500 mt-1">{errors.telefono.message}</p>
            )}
          </div>

          {/* Tipo de residente — opcional */}
          <div>
            <label className="block text-sm font-medium text-neutral mb-1">
              Tipo de residente <span className="text-gray-400 text-xs">(opcional)</span>
            </label>
            <select
              {...register('tipoResidente')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
            >
              <option value="">Sin especificar</option>
              <option value="propietario">Propietario</option>
              <option value="arrendatario">Arrendatario</option>
            </select>
          </div>

          {/* Estado — solo visible al crear */}
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
                Cuenta activa
              </label>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
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
                : isEditing ? 'Guardar cambios' : 'Crear residente'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
