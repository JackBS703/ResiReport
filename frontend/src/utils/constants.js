// Roles del sistema
export const ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  RESIDENT: 'resident',
};

// Prioridades de denuncia
export const PRIORIDADES = {
  SIN_ASIGNAR: 'sinasignar',
  BAJA: 'baja',
  MEDIA: 'media',
  ALTA: 'alta',
};

// Labels legibles para prioridades
export const PRIORIDAD_LABELS = {
  sinasignar: 'Sin asignar',
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
};

// Rutas por rol — a dónde redirigir después del login
export const HOME_BY_ROL = {
  superadmin: '/denuncias',
  admin: '/denuncias',
  resident: '/mis-denuncias',
};