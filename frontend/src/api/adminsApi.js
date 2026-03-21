import axiosInstance from './axiosInstance';

export const listarAdmins = (search = '') =>
  axiosInstance.get(`/admins?search=${encodeURIComponent(search)}`);

export const crearAdmin = (data) =>
  axiosInstance.post('/admins', data);

export const actualizarAdmin = (id, data) =>
  axiosInstance.put(`/admins/${id}`, data);

export const toggleEstadoAdmin = (id, isActive) =>
  axiosInstance.patch(`/admins/${id}/status`, { isActive });
