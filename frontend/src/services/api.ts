import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (data: any) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
  
  updateProfile: async (data: any) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },
};

export const activityService = {
  getActivities: async (days?: number) => {
    const response = await api.get('/activities', { params: { days } });
    return response.data;
  },
  
  createActivity: async (data: any) => {
    const response = await api.post('/activities', data);
    return response.data;
  },
  
  updateActivity: async (id: number, data: any) => {
    const response = await api.put(`/activities/${id}`, data);
    return response.data;
  },
  
  deleteActivity: async (id: number) => {
    const response = await api.delete(`/activities/${id}`);
    return response.data;
  },
  
  getStats: async (days?: number) => {
    const response = await api.get('/activities/stats', { params: { days } });
    return response.data;
  },
};

export const nutritionService = {
  getNutritionLogs: async (days?: number) => {
    const response = await api.get('/nutrition', { params: { days } });
    return response.data;
  },
  
  createNutritionLog: async (data: any) => {
    const response = await api.post('/nutrition', data);
    return response.data;
  },
  
  updateNutritionLog: async (id: number, data: any) => {
    const response = await api.put(`/nutrition/${id}`, data);
    return response.data;
  },
  
  deleteNutritionLog: async (id: number) => {
    const response = await api.delete(`/nutrition/${id}`);
    return response.data;
  },
  
  getStats: async (days?: number) => {
    const response = await api.get('/nutrition/stats', { params: { days } });
    return response.data;
  },
};

export const goalService = {
  getGoals: async (status?: string) => {
    const response = await api.get('/goals', { params: { status } });
    return response.data;
  },
  
  createGoal: async (data: any) => {
    const response = await api.post('/goals', data);
    return response.data;
  },
  
  updateGoal: async (id: number, data: any) => {
    const response = await api.put(`/goals/${id}`, data);
    return response.data;
  },
  
  deleteGoal: async (id: number) => {
    const response = await api.delete(`/goals/${id}`);
    return response.data;
  },
  
  updateProgress: async (id: number, data: any) => {
    const response = await api.post(`/goals/${id}/progress`, data);
    return response.data;
  },
};

export const aiService = {
  chat: async (message: string, history?: any[]) => {
    const response = await api.post('/ai/chat', { message, history });
    return response.data;
  },
  
  getRecommendations: async () => {
    const response = await api.get('/ai/recommendations');
    return response.data;
  },
  
  getInsights: async () => {
    const response = await api.get('/ai/insights');
    return response.data;
  },
  
  getMealPlan: async (days?: number) => {
    const response = await api.get('/ai/meal-plan', { params: { days } });
    return response.data;
  },
  
  getWorkoutPlan: async (days?: number) => {
    const response = await api.get('/ai/workout-plan', { params: { days } });
    return response.data;
  },
  
  getMotivationalMessage: async () => {
    const response = await api.get('/ai/motivational-message');
    return response.data;
  },
};

export const communityService = {
  getPosts: async (type?: string, limit?: number) => {
    const response = await api.get('/community/posts', { params: { type, limit } });
    return response.data;
  },
  
  createPost: async (data: any) => {
    const response = await api.post('/community/posts', data);
    return response.data;
  },
  
  likePost: async (id: number) => {
    const response = await api.post(`/community/posts/${id}/like`);
    return response.data;
  },
  
  getChallenges: async (activeOnly?: boolean) => {
    const response = await api.get('/community/challenges', { params: { active: activeOnly } });
    return response.data;
  },
  
  createChallenge: async (data: any) => {
    const response = await api.post('/community/challenges', data);
    return response.data;
  },
  
  joinChallenge: async (id: number) => {
    const response = await api.post(`/community/challenges/${id}/join`);
    return response.data;
  },
};

export default api;



