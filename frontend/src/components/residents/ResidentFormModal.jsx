import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

export default function ResidentFormModal({ resident, onClose, onSave }) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm();

    // Si viene un residente, precarga el formulario para edición
    useEffect(() => {
        if (resident) {
            reset({
                nombre: resident.nombre,
                correo: resident.correo,
                torre: resident.torre,
                apartamento: resident.apartamento,
                telefono: resident.telefono || '',
                tipoResidente: resident.tipoResidente || '',
                isActive: resident.isActive,
            });
        } else {
            reset({ isActive: true });
        }
    }, [resident, reset]);

    const onSubmit = async (data) => {
        // Si es edición y el password está vacío, no lo mandamos
        if (!data.password) delete data.password;
        await onSave(data);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6">
                <h2 className="text-xl font-semibold text-primary mb-4">
                    {resident ? 'Editar residente' : 'Crear residente'}
                </h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                    {/* Nombre */}
                    <div>
                        <label className="block text-sm font-medium text-neutral mb-1">Nombre *</label>
                        <input
                            {...register('nombre', { required: 'El nombre es obligatorio' })}
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                            placeholder="Nombre completo"
                        />
                        {errors.nombre && <p className="text-danger text-xs mt-1">{errors.nombre.message}</p>}
                    </div>

                    {/* Correo */}
                    <div>
                        <label className="block text-sm font-medium text-neutral mb-1">Correo *</label>
                        <input
                            {...register('correo', {
                                required: 'El correo es obligatorio',
                                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Correo inválido' },
                            })}
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                            placeholder="correo@ejemplo.com"
                        />
                        {errors.correo && <p className="text-danger text-xs mt-1">{errors.correo.message}</p>}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-neutral mb-1">
                            Contraseña {resident ? '(dejar vacío para no cambiar)' : '*'}
                        </label>
                        <input
                            type="password"
                            {...register('password', {
                                required: !resident ? 'La contraseña es obligatoria' : false,
                                minLength: { value: 6, message: 'Mínimo 6 caracteres' },
                            })}
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                            placeholder={resident ? '••••••' : 'Contraseña'}
                        />
                        {errors.password && <p className="text-danger text-xs mt-1">{errors.password.message}</p>}
                    </div>

                    {/* Torre y Apartamento */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-neutral mb-1">Torre *</label>
                            <input
                                {...register('torre', { required: 'Obligatorio' })}
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                                placeholder="Ej: A"
                            />
                            {errors.torre && <p className="text-danger text-xs mt-1">{errors.torre.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral mb-1">Apartamento *</label>
                            <input
                                {...register('apartamento', { required: 'Obligatorio' })}
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                                placeholder="Ej: 101"
                            />
                            {errors.apartamento && <p className="text-danger text-xs mt-1">{errors.apartamento.message}</p>}
                        </div>
                    </div>

                    {/* Teléfono y Tipo */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-neutral mb-1">Teléfono</label>
                            <input
                                {...register('telefono')}
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                                placeholder="Opcional"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral mb-1">Tipo</label>
                            <select {...register('tipoResidente')} className="w-full border rounded-lg px-3 py-2 text-sm">
                                <option value="">Sin especificar</option>
                                <option value="propietario">Propietario</option>
                                <option value="arrendatario">Arrendatario</option>
                            </select>
                        </div>
                    </div>

                    {/* Estado */}
                    <div className="flex items-center gap-2">
                        <input type="checkbox" {...register('isActive')} id="isActive" className="w-4 h-4" />
                        <label htmlFor="isActive" className="text-sm text-neutral">Cuenta activa</label>
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-neutral bg-surface hover:bg-gray-200 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? 'Guardando...' : resident ? 'Guardar cambios' : 'Crear residente'}
                        </button>


                    </div>
                </form>
            </div>
        </div>
    );
}
