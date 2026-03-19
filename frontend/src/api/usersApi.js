import axiosInstance from './axiosInstance';

// ── Residentes ──────────────────────────────────────────
// GET /api/residents?search=&isActive=
export const getResidents = (params) =>
  axiosInstance.get('/residents', { params });

// GET /api/residents/:id
export const getResidentById = (id) =>
  axiosInstance.get(`/residents/${id}`);

// POST /api/residents
export const createResident = (data) =>
  axiosInstance.post('/residents', data);

// PUT /api/residents/:id
export const updateResident = (id, data) =>
  axiosInstance.put(`/residents/${id}`, data);

// PATCH /api/residents/:id/status
export const toggleResidentStatus = (id, isActive) =>
  axiosInstance.patch(`/residents/${id}/status`, { isActive });

// ── Administradores ─────────────────────────────────────
// GET /api/admins
export const getAdmins = (params) =>
  axiosInstance.get('/admins', { params });

// GET /api/admins/:id
export const getAdminById = (id) =>
  axiosInstance.get(`/admins/${id}`);

// POST /api/admins
export const createAdmin = (data) =>
  axiosInstance.post('/admins', data);

// PUT /api/admins/:id
export const updateAdmin = (id, data) =>
  axiosInstance.put(`/admins/${id}`, data);

// PATCH /api/admins/:id/status
export const toggleAdminStatus = (id, isActive) =>
  axiosInstance.patch(`/admins/${id}/status`, { isActive });