// Export API client from axiosInstance.ts
export { apiClient, API_ENDPOINTS } from './axiosInstance';

// Cache for user data
let cachedUser: any = null;

// Function to clear user cache
export const clearUserCache = () => {
  cachedUser = null;
};

// Legacy fetchAPI function for backward compatibility
export const fetchAPI = async (endpoint: string, options?: RequestInit) => {
  // Extract relative path from endpoint
  const relativePath = endpoint.replace(/^https?:\/\/.+?\/api/, '');
  
  try {
    // Use apiClient for requests
    const method = options?.method || 'GET';
    const data = options?.body ? JSON.parse(options.body as string) : undefined;
    
    let response;
    switch (method) {
      case 'GET':
        response = await apiClient.get(relativePath);
        break;
      case 'POST':
        response = await apiClient.post(relativePath, data);
        break;
      case 'PUT':
        response = await apiClient.put(relativePath, data);
        break;
      case 'DELETE':
        response = await apiClient.delete(relativePath);
        break;
      default:
        response = await apiClient.get(relativePath);
    }
    
    return response;
  } catch (error) {
    console.error('fetchAPI error:', error);
    throw error;
  }
};

// New function to fetch and return Response object
export const fetchAPIWithResponse = async (endpoint: string, options?: RequestInit) => {
  // This function is maintained for backward compatibility
  // but internally uses the new apiClient
  const relativePath = endpoint.replace(/^https?:\/\/.+?\/api/, '');
  
  try {
    const method = options?.method || 'GET';
    const data = options?.body ? JSON.parse(options.body as string) : undefined;
    
    let response;
    switch (method) {
      case 'GET':
        response = await apiClient.get(relativePath);
        break;
      case 'POST':
        response = await apiClient.post(relativePath, data);
        break;
      case 'PUT':
        response = await apiClient.put(relativePath, data);
        break;
      case 'DELETE':
        response = await apiClient.delete(relativePath);
        break;
      default:
        response = await apiClient.get(relativePath);
    }
    
    return { data: response };
  } catch (error) {
    console.error('fetchAPIWithResponse error:', error);
    throw error;
  }
};

/**
 * Convert image file to Base64 encoding
 * @param file Image file to convert
 * @returns Base64 encoded string with data URL prefix
 */
export const convertImageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Call backend API for image analysis
 * @param file Image file to analyze
 * @param scenario Analysis scenario (receipt or fridge)
 * @returns Analysis result from backend
 */
export const analyzeImageWithBackend = async (file: File, scenario: string = 'receipt'): Promise<any> => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('scenario', scenario);

  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://foodflow-pblclass.onrender.com/api'}/inventory/detect`, {
      method: 'POST',
      headers: {
        // Don't set Content-Type header, let browser set it with boundary
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Backend API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('analyzeImageWithBackend - error:', error);
    throw error;
  }
};
