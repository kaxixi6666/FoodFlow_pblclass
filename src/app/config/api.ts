export const API_BASE_URL = 'http://163.221.152.215:8080/api';

console.log('API_BASE_URL:', API_BASE_URL);

export const API_ENDPOINTS = {
  INVENTORY: `${API_BASE_URL}/inventory`,
  INGREDIENTS: `${API_BASE_URL}/ingredients`,
  RECIPES: `${API_BASE_URL}/recipes`,
  RECIPE_INGREDIENTS: `${API_BASE_URL}/recipe-ingredients`,
};

export const fetchAPI = async (endpoint: string, options?: RequestInit) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`API Error: ${response.status} - ${errorText}`);
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
};