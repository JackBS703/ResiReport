import axiosInstance from './axiosInstance';

// ── Tipos de Denuncia ────────────────────────────────────
// GET /api/catalog/types
export const getComplaintTypes = () =>
  axiosInstance.get('/catalog/types');

// GET /api/catalog/types/active  (solo para formularios)
export const getActiveComplaintTypes = () =>
  axiosInstance.get('/catalog/types/active');

// POST /api/catalog/types
export const createComplaintType = (data) =>
  axiosInstance.post('/catalog/types', data);

// PUT /api/catalog/types/:id
export const updateComplaintType = (id, data) =>
  axiosInstance.put(`/catalog/types/${id}`, data);

// PATCH /api/catalog/types/:id/status
export const toggleComplaintTypeStatus = (id, isActive) =>
  axiosInstance.patch(`/catalog/types/${id}/status`, { isActive });

// DELETE /api/catalog/types/:id  (solo si no tiene complaints asociadas)
export const deleteComplaintType = (id) =>
  axiosInstance.delete(`/catalog/types/${id}`);

// ── Estados de Denuncia ──────────────────────────────────
// GET /api/catalog/statuses
export const getComplaintStatuses = () =>
  axiosInstance.get('/catalog/statuses');

// GET /api/catalog/statuses/active
export const getActiveComplaintStatuses = () =>
  axiosInstance.get('/catalog/statuses/active');

// POST /api/catalog/statuses
export const createComplaintStatus = (data) =>
  axiosInstance.post('/catalog/statuses', data);

// PUT /api/catalog/statuses/:id
export const updateComplaintStatus = (id, data) =>
  axiosInstance.put(`/catalog/statuses/${id}`, data);

// PATCH /api/catalog/statuses/:id/status
export const toggleComplaintStatusActive = (id, isActive) =>
  axiosInstance.patch(`/catalog/statuses/${id}/status`, { isActive });

// DELETE /api/catalog/statuses/:id  (bloqueado si isDefault === true)
export const deleteComplaintStatus = (id) =>
  axiosInstance.delete(`/catalog/statuses/${id}`);