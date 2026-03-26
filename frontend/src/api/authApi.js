import axiosInstance from './axiosInstance';

// POST /api/auth/login
export const login = (correo, password) =>
  axiosInstance.post('/auth/login', { correo, password });

// GET /api/auth/profile
export const getProfile = () =>
  axiosInstance.get('/auth/profile');