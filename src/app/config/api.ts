export const API_BASE_URL = 'https://foodflow-pblclass.onrender.com/api';
export const DETECT_API_BASE_URL = 'https://163.221.152.191:8080';
export const NEW_DETECT_API_URL = 'https://pbl.florentin.online/api/inventory/detect';

console.log('API_BASE_URL:', API_BASE_URL);
console.log('DETECT_API_BASE_URL:', DETECT_API_BASE_URL);
console.log('NEW_DETECT_API_URL:', NEW_DETECT_API_URL);

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
  DETECT_INVENTORY: `${DETECT_API_BASE_URL}/api/inventory/detect`,
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

export const uploadReceiptImageNew = async (file: File): Promise<any> => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const userId = user?.id;
  
  console.log('uploadReceiptImageNew - userId:', userId);
  console.log('uploadReceiptImageNew - file:', file.name, file.type);
  
  const formData = new FormData();
  formData.append('image', file);
  
  const headers: HeadersInit = {};
  
  // Add X-User-Id header if user is logged in
  if (userId) {
    (headers as any)['X-User-Id'] = userId.toString();
    console.log('uploadReceiptImageNew - Adding X-User-Id header:', userId);
  }
  
  console.log('uploadReceiptImageNew - sending request to:', NEW_DETECT_API_URL);
  
  let response;
  try {
    // Try new HTTPS API first
    response = await fetch(NEW_DETECT_API_URL, {
      method: 'POST',
      headers,
      body: formData,
    });
    console.log('uploadReceiptImageNew - new API response status:', response.status);
    console.log('uploadReceiptImageNew - new API response ok:', response.ok);
  } catch (error) {
    console.log('uploadReceiptImageNew - New HTTPS API failed, trying fallback to old API');
    console.log('uploadReceiptImageNew - fallback error:', error);
    
    // If new API fails, try old API as fallback
    try {
      response = await fetch(API_ENDPOINTS.DETECT_INVENTORY, {
        method: 'POST',
        headers,
        body: formData,
      });
      console.log('uploadReceiptImageNew - fallback API response status:', response.status);
      console.log('uploadReceiptImageNew - fallback API response ok:', response.ok);
    } catch (fallbackError) {
      console.log('uploadReceiptImageNew - Fallback API also failed:', fallbackError);
      throw new Error('All receipt detection APIs failed');
    }
  }

  console.log('uploadReceiptImageNew - final response status:', response.status);
  console.log('uploadReceiptImageNew - final response ok:', response.ok);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Detect API Error: ${response.status} - ${errorText}`);
    throw new Error(`Receipt detection failed: ${response.status}`);
  }

  return response.json();
};

export const uploadReceiptImage = async (file: File): Promise<any> => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const userId = user?.id;
  
  console.log('uploadReceiptImage - userId:', userId);
  console.log('uploadReceiptImage - file:', file.name, file.type);
  
  const formData = new FormData();
  formData.append('image', file);
  
  const headers: HeadersInit = {};
  
  // Add X-User-Id header if user is logged in
  if (userId) {
    (headers as any)['X-User-Id'] = userId.toString();
    console.log('uploadReceiptImage - Adding X-User-Id header:', userId);
  }
  
  console.log('uploadReceiptImage - sending request to:', API_ENDPOINTS.DETECT_INVENTORY);
  
  let response;
  try {
    // Try HTTPS first
    response = await fetch(API_ENDPOINTS.DETECT_INVENTORY, {
      method: 'POST',
      headers,
      body: formData,
    });
  } catch (error) {
    console.log('uploadReceiptImage - HTTPS request failed, trying HTTP fallback');
    // If HTTPS fails, try HTTP as fallback
    const httpUrl = API_ENDPOINTS.DETECT_INVENTORY.replace('https://', 'http://');
    console.log('uploadReceiptImage - fallback URL:', httpUrl);
    
    response = await fetch(httpUrl, {
      method: 'POST',
      headers,
      body: formData,
    });
  }

  console.log('uploadReceiptImage - response status:', response.status);
  console.log('uploadReceiptImage - response ok:', response.ok);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Detect API Error: ${response.status} - ${errorText}`);
    throw new Error(`Receipt detection failed: ${response.status}`);
  }

  return response.json();
};