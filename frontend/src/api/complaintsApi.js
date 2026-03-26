import axiosInstance from './axiosInstance';

// GET /api/complaints?estado=&tipo=&prioridad=&fechaDesde=&fechaHasta=&search=
export const getComplaints = (params) =>
  axiosInstance.get('/complaints', { params });

// GET /api/complaints/mine?search=&tipo=&estado=&prioridad=
export const getMyComplaints = (params) =>
  axiosInstance.get('/complaints/mine', { params });

// GET /api/complaints/:id
export const getComplaintById = (id) =>
  axiosInstance.get(`/complaints/${id}`);

// POST /api/complaints
export const createComplaint = (data) =>
  axiosInstance.post('/complaints', data);

// PUT /api/complaints/:id  (solo si estado === 'Registrada')
export const updateComplaint = (id, data) =>
  axiosInstance.put(`/complaints/${id}`, data);

// PATCH /api/complaints/:id/status
export const updateComplaintStatus = (id, estadoId) =>
  axiosInstance.patch(`/complaints/${id}/status`, { estadoId });

// PATCH /api/complaints/:id/priority
export const updateComplaintPriority = (id, prioridad) =>
  axiosInstance.patch(`/complaints/${id}/priority`, { prioridad });