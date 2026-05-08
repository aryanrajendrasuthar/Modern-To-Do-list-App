import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(err);
      }
      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  logout: (refreshToken: string) => api.post('/auth/logout', { refreshToken }),
  getMe: () => api.get('/auth/me'),
  updateMe: (data: { name?: string; email?: string; currentPassword?: string; newPassword?: string }) =>
    api.patch('/auth/me', data),
};

export const tasksApi = {
  getAll: (params?: Record<string, string>) => api.get('/tasks', { params }),
  create: (data: Partial<import('../types').Task>) => api.post('/tasks', data),
  update: (id: string, data: Partial<import('../types').Task>) => api.patch(`/tasks/${id}`, data),
  delete: (id: string) => api.delete(`/tasks/${id}`),
  reorder: (tasks: { id: string; order: number }[]) =>
    api.patch('/tasks/reorder/bulk', { tasks }),
  // Subtasks
  addSubtask: (taskId: string, title: string) =>
    api.post(`/tasks/${taskId}/subtasks`, { title }),
  updateSubtask: (taskId: string, subtaskId: string, data: { title?: string; completed?: boolean; order?: number }) =>
    api.patch(`/tasks/${taskId}/subtasks/${subtaskId}`, data),
  deleteSubtask: (taskId: string, subtaskId: string) =>
    api.delete(`/tasks/${taskId}/subtasks/${subtaskId}`),
};

export const commentsApi = {
  getAll: (taskId: string) => api.get(`/tasks/${taskId}/comments`),
  create: (taskId: string, content: string) =>
    api.post(`/tasks/${taskId}/comments`, { content }),
  update: (taskId: string, commentId: string, content: string) =>
    api.patch(`/tasks/${taskId}/comments/${commentId}`, { content }),
  delete: (taskId: string, commentId: string) =>
    api.delete(`/tasks/${taskId}/comments/${commentId}`),
};

export default api;
