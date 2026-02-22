import axios from 'axios';

const API_BASE = "https://foodflow-pblclass.onrender.com/api";

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data:`, error.response.data);
    } else if (error.request) {
      console.error('No response received');
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export const inventoryAPI = {
  getAll: () => api.get('/inventory'),
  getById: (id) => api.get(`/inventory/${id}`),
  create: (data) => api.post('/inventory', data),
  update: (id, data) => api.put(`/inventory/${id}`, data),
  delete: (id) => api.delete(`/inventory/${id}`),
};

export const ingredientsAPI = {
  getAll: () => api.get('/ingredients'),
  getById: (id) => api.get(`/ingredients/${id}`),
  create: (data) => api.post('/ingredients', data),
  update: (id, data) => api.put(`/ingredients/${id}`, data),
  delete: (id) => api.delete(`/ingredients/${id}`),
  recognize: (formData) => api.post('/ingredients/recognition', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

export const recipesAPI = {
  getAll: () => api.get('/recipes'),
  getById: (id) => api.get(`/recipes/${id}`),
  create: (data) => api.post('/recipes', data),
  update: (id, data) => api.put(`/recipes/${id}`, data),
  delete: (id) => api.delete(`/recipes/${id}`),
  getPublic: () => api.get('/recipes/public'),
  getDrafts: () => api.get('/recipes/draft'),
};

export const recipeIngredientsAPI = {
  getAll: () => api.get('/recipe-ingredients'),
  getById: (id) => api.get(`/recipe-ingredients/${id}`),
  create: (data) => api.post('/recipe-ingredients', data),
  update: (id, data) => api.put(`/recipe-ingredients/${id}`, data),
  delete: (id) => api.delete(`/recipe-ingredients/${id}`),
};

export default api;
