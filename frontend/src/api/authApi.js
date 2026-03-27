import axiosInstance from './axiosInstance';

// POST /api/auth/login
export const login = (correo, password) =>
  axiosInstance.post('/auth/login', { correo, password });