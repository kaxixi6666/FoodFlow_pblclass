export const API_BASE_URL = 'https://foodflow-pblclass.onrender.com/api';

console.log('API_BASE_URL:', API_BASE_URL);

export const API_ENDPOINTS = {
  INVENTORY: `${API_BASE_URL}/inventory`,
  INGREDIENTS: `${API_BASE_URL}/ingredients`,
  RECIPES: `${API_BASE_URL}/recipes`,
  PUBLIC_RECIPES: `${API_BASE_URL}/recipes/public`,
  RECIPE_INGREDIENTS: `${API_BASE_URL}/recipe-ingredients`,
  USERS_REGISTER: `${API_BASE_URL}/users/register`,
  USERS_LOGIN: `${API_BASE_URL}/users/login`,
  USERS: `${API_BASE_URL}/users`,
  MEAL_PLANS: `${API_BASE_URL}/meal-plans`,
  SHOPPING_LIST: `${API_BASE_URL}/shopping-list`,
};

export const fetchAPI = async (endpoint: string, options?: RequestInit) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  // Get user from localStorage and add userId to headers
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const userId = user?.id;
  
  console.log('fetchAPI - endpoint:', endpoint);
  console.log('fetchAPI - user:', user);
  console.log('fetchAPI - userId:', userId);
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };
  
  // Add X-User-Id header if user is logged in
  if (userId) {
    (headers as any)['X-User-Id'] = userId.toString();
    console.log('fetchAPI - Adding X-User-Id header:', userId);
  } else {
    console.log('fetchAPI - No userId available, user not logged in');
  }
  
  console.log('fetchAPI - headers:', headers);
  
  const response = await fetch(url, {
    ...options,
    headers,
  });

  console.log('fetchAPI - response status:', response.status);
  console.log('fetchAPI - response ok:', response.ok);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`API Error: ${response.status} - ${errorText}`);
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
};