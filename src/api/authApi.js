import { authApi } from './axiosInstance';

export const authEndpoints = {
  /**
   * POST /api/auth/login
   * @param {{ email: string, password: string }} credentials
   * @returns {{ token: string, user: UserDto }}
   */
  login: (credentials) =>
    authApi.post('/api/auth/login', credentials).then(r => r.data),

  /**
   * POST /api/auth/refresh
   */
  refresh: (refreshToken) =>
    authApi.post('/api/auth/refresh', { refreshToken }).then(r => r.data),

  /**
   * POST /api/auth/logout
   */
  logout: () =>
    authApi.post('/api/auth/logout').then(r => r.data),
};
