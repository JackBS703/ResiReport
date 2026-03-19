// Formatea una fecha ISO a "19 mar. 2026, 3:45 p.m."
export const formatDate = (fecha) => {
  if (!fecha) return '—';
  return new Date(fecha).toLocaleString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Formatea solo la fecha sin hora — "19 mar. 2026"
export const formatDateShort = (fecha) => {
  if (!fecha) return '—';
  return new Date(fecha).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};