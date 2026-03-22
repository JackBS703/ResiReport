import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

export default function AdminFormModal({
  adminInicial = null,
  onGuardar,
  onCerrar,
  esSuperAdmin = false,
  usuarioActualId = null,
}) {
  const isEditing = !!adminInicial;
  const isOwnAccount = isEditing && adminInicial?._id === usuarioActualId;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    if (adminInicial) {
      reset({
        nombre:   adminInicial.nombre   || '',
        correo:   adminInicial.correo   || '',
        telefono: adminInicial.telefono || '',
        rol:      adminInicial.rol      || 'admin',
        isActive: adminInicial.isActive ?? true,
        password: '',
      });
    } else {
      reset({
        nombre:   '',
        correo:   '',
        telefono: '',
        rol:      'admin',
        isActive: true,
        password: '',
      });
    }
  }, [adminInicial, reset]);

  const submitHandler = async (data) => {
    if (isEditing && !data.password?.trim()) {
      delete data.password;
    }

    try {
      await onGuardar(data);
    } catch (err) {
      if (err?.response?.status === 409) {
        setError('correo', {
          type: 'manual',
          message: 'Este correo ya está registrado en el sistema',
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
          {isEditing ? 'Editar administrador' : 'Crear administrador'}
        </h2>

        <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-neutral mb-1">
              Nombre completo <span className="text-red-500">*</span>
            </label>
            <input
              placeholder="Ej. Carlos Rodríguez Pérez"
              {...register('nombre', {
                required:  'El nombre es obligatorio',
                minLength: { value: 3, message: 'Mínimo 3 caracteres' },
                maxLength: { value: 80, message: 'Máximo 80 caracteres' },
                pattern: {
                  value:   /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/,
                  message: 'Solo letras y espacios',
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
              placeholder="Ej. carlos.rodriguez@resireport.com"
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

          {/* Contraseña */}
          <div>
            <label className="block text-sm font-medium text-neutral mb-1">
              {isEditing
                ? 'Contraseña'
                : <> Contraseña <span className="text-red-500">*</span> </>}
            </label>
            <input
              type="password"
              disabled={isEditing && !esSuperAdmin}
              placeholder={
                isEditing && !esSuperAdmin
                  ? '••••••••'
                  : isEditing
                  ? 'Dejar vacío para no cambiar'
                  : 'Mínimo 6 caracteres'
              }
              {...register('password', {
                required: isEditing ? false : 'La contraseña es obligatoria',
                validate: (value) => {
                  if (!isEditing && value.length < 6) return 'Mínimo 6 caracteres';
                  if (isEditing && value.length > 0 && value.length < 6)
                    return 'Si cambias la contraseña debe tener al menos 6 caracteres';
                  return true;
                },
              })}
              className={`w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary ${
                isEditing && !esSuperAdmin
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : ''
              }`}
            />
            {isEditing && !esSuperAdmin && (
              <p className="text-xs text-gray-400 mt-1">
                Solo el superadmin puede cambiar la contraseña
              </p>
            )}
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Rol — oculto si está editando su propia cuenta */}
          {!isOwnAccount && (
            <div>
              <label className="block text-sm font-medium text-neutral mb-1">
                Rol <span className="text-red-500">*</span>
              </label>
              <select
                {...register('rol', { required: 'El rol es obligatorio' })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <option value="admin">Admin</option>
                {esSuperAdmin && (
                  <option value="superadmin">Super Admin</option>
                )}
              </select>
              {errors.rol && (
                <p className="text-xs text-red-500 mt-1">{errors.rol.message}</p>
              )}
            </div>
          )}

          {/* Teléfono — opcional */}
          <div>
            <label className="block text-sm font-medium text-neutral mb-1">
              Teléfono <span className="text-gray-400 text-xs">(opcional)</span>
            </label>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="Ej. 3001234567"
              onKeyDown={(e) => {
                const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', '+', '-'];
                if (!allowed.includes(e.key) && !/^\d$/.test(e.key)) e.preventDefault();
              }}
              {...register('telefono', {
                pattern: {
                  value:   /^[0-9+-]{7,15}$/,
                  message: 'Teléfono inválido (7 a 15 dígitos)',
                },
              })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
            />
            {errors.telefono && (
              <p className="text-xs text-red-500 mt-1">{errors.telefono.message}</p>
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
                Cuenta activa
              </label>
            </div>
          )}

          {/* Error global (500) */}
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
                : isEditing ? 'Guardar cambios' : 'Crear administrador'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
