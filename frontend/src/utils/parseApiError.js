export function parseApiError(err) {
  const msg = err.response?.data?.message || '';
  const status = err.response?.status;

  if (!err.response) {
    return 'No se pudo conectar con el servidor. Verifica tu conexión.';
  }

  if (status === 401) return 'Tu sesión ha expirado. Vuelve a iniciar sesión.';
  if (status === 403) return 'No tienes permisos para realizar esta acción.';
  if (status === 404) return 'El residente no fue encontrado.';

  if (status === 409 || msg.includes('E11000') || msg.includes('dup key')) {
    const match = msg.match(/correo[^"]*"([^"]+)"/);
    const correo = match ? ` (${match[1]})` : '';
    return `El correo${correo} ya está registrado por otro usuario.`;
  }

  if (msg.includes('is not a valid enum value')) {
    if (msg.includes('tipoResidente')) return 'Selecciona un tipo de residente válido.';
    if (msg.includes('rol'))           return 'El rol seleccionado no es válido.';
    if (msg.includes('estado'))        return 'El estado ingresado no es válido.';
    return 'Uno de los campos tiene un valor no permitido.';
  }

  if (msg.includes('Validation failed')) {
    if (msg.includes('nombre'))      return 'El nombre es obligatorio.';
    if (msg.includes('correo'))      return 'El correo es obligatorio o tiene un formato inválido.';
    if (msg.includes('password'))    return 'La contraseña es obligatoria para nuevos residentes.';
    if (msg.includes('torre'))       return 'La torre es obligatoria.';
    if (msg.includes('apartamento')) return 'El apartamento es obligatorio.';
    return 'Algunos campos tienen valores inválidos. Revisa el formulario.';
  }

  if (msg.includes('Cast to ObjectId failed')) return 'El identificador del residente no es válido.';
  if (msg.includes('Path') && msg.includes('is required')) return 'Hay campos obligatorios sin completar.';

  if (msg.includes('password') || msg.includes('contraseña')) {
    if (msg.includes('minlength') || msg.includes('corta')) return 'La contraseña debe tener al menos 6 caracteres.';
    return 'La contraseña ingresada no es válida.';
  }

  if (msg.includes('correo') || msg.includes('email')) return 'El correo ingresado no es válido o ya está en uso.';
  if (msg.includes('isActive') || msg.includes('activar') || msg.includes('desactivar')) return 'No se pudo cambiar el estado del residente.';

  // 500 al final — si tiene mensaje del backend, se muestra ese
  if (status === 500) {
    return msg || 'Error interno del servidor. Intenta de nuevo más tarde.';
  }

  return msg || 'Ocurrió un error inesperado. Intenta de nuevo.';
}
