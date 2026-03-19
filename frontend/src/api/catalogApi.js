import axiosInstance from './axiosInstance';

// ── Tipos de Denuncia ────────────────────────────────────
// GET /api/complaint-types
export const getComplaintTypes = () =>
  axiosInstance.get('/complaint-types');

// GET /api/complaint-types/active  (solo para formularios)
export const getActiveComplaintTypes = () =>
  axiosInstance.get('/complaint-types/active');

// POST /api/complaint-types
export const createComplaintType = (data) =>
  axiosInstance.post('/complaint-types', data);

// PUT /api/complaint-types/:id
export const updateComplaintType = (id, data) =>
  axiosInstance.put(`/complaint-types/${id}`, data);

// PATCH /api/complaint-types/:id/status
export const toggleComplaintTypeStatus = (id, isActive) =>
  axiosInstance.patch(`/complaint-types/${id}/status`, { isActive });

// DELETE /api/complaint-types/:id  (solo si no tiene complaints asociadas)
export const deleteComplaintType = (id) =>
  axiosInstance.delete(`/complaint-types/${id}`);

// ── Estados de Denuncia ──────────────────────────────────
// GET /api/complaint-statuses
export const getComplaintStatuses = () =>
  axiosInstance.get('/complaint-statuses');

// GET /api/complaint-statuses/active
export const getActiveComplaintStatuses = () =>
  axiosInstance.get('/complaint-statuses/active');

// POST /api/complaint-statuses
export const createComplaintStatus = (data) =>
  axiosInstance.post('/complaint-statuses', data);

// PUT /api/complaint-statuses/:id
export const updateComplaintStatus = (id, data) =>
  axiosInstance.put(`/complaint-statuses/${id}`, data);

// PATCH /api/complaint-statuses/:id/status
export const toggleComplaintStatusActive = (id, isActive) =>
  axiosInstance.patch(`/complaint-statuses/${id}/status`, { isActive });

// DELETE /api/complaint-statuses/:id  (bloqueado si isDefault === true)
export const deleteComplaintStatus = (id) =>
  axiosInstance.delete(`/complaint-statuses/${id}`);