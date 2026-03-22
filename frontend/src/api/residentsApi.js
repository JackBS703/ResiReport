import axiosInstance from './axiosInstance';

export const getResidents = (params) =>
  axiosInstance.get('/residents', { params });

export const getResidentById = (id) =>
  axiosInstance.get(`/residents/${id}`);

export const createResident = (data) =>
  axiosInstance.post('/residents', data);

export const updateResident = (id, data) =>
  axiosInstance.put(`/residents/${id}`, data);

export const toggleResidentStatus = (id, isActive) =>
  axiosInstance.patch(`/residents/${id}/status`, { isActive });
