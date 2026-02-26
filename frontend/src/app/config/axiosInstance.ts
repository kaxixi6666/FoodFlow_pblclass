import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Extend AxiosRequestConfig to include _cachedResponse
interface ExtendedAxiosRequestConfig<T = any> extends AxiosRequestConfig<T> {
  _cachedResponse?: any;
  cache?: boolean;
}

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://foodflow-pblclass.onrender.com/api';

// API response type
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  user?: T;
  message?: string;
  error?: string;
}

// Request cache interface
interface RequestCache {
  [key: string]: {
    data: any;
    timestamp: number;
  };
}

// Pending requests
interface PendingRequests {
  [key: string]: Promise<any>;
}

class ApiClient {
  private instance: AxiosInstance;
  private cache: RequestCache = {};
  private pendingRequests: PendingRequests = {};
  private cacheExpiryTime = 5 * 60 * 1000; // Cache expiry time: 5 minutes

  constructor() {
    // Create axios instance
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => this.handleRequest(config),
      (error) => this.handleRequestError(error)
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => this.handleResponse(response),
      (error) => this.handleResponseError(error)
    );
  }

  /**
   * Generate request cache key
   */
  private generateCacheKey(config: ExtendedAxiosRequestConfig): string {
    const { url, method, params, data } = config;
    const key = `${method || 'GET'}-${url}-${JSON.stringify(params || {})}-${JSON.stringify(data || {})}`;
    return key;
  }

  /**
   * Handle request
   */
  private handleRequest(config: ExtendedAxiosRequestConfig): ExtendedAxiosRequestConfig {
    // Get user information
    const user = this.getUserFromLocalStorage();
    
    // Add user ID to request headers
    if (user?.id && config.headers) {
      config.headers['X-User-Id'] = user.id.toString();
    }

    // Check cache
    if (config.method === 'get' && config.cache !== false) {
      const cacheKey = this.generateCacheKey(config);
      const cachedData = this.cache[cacheKey];
      
      if (cachedData && Date.now() - cachedData.timestamp < this.cacheExpiryTime) {
        // Return cached data
        return { ...config, _cachedResponse: cachedData.data };
      }
    }

    return config;
  }

  /**
   * Handle request error
   */
  private handleRequestError(error: AxiosError): Promise<AxiosError> {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }

  /**
   * Handle response
   */
  private handleResponse(response: AxiosResponse): AxiosResponse {
    const { config, data } = response;

    // Cache GET request responses
    if (config.method === 'get' && config.cache !== false) {
      const cacheKey = this.generateCacheKey(config);
      this.cache[cacheKey] = {
        data,
        timestamp: Date.now(),
      };
    }

    return response;
  }

  /**
   * Handle response error
   */
  private handleResponseError(error: AxiosError): Promise<never> {
    console.error('Response Error:', error);

    // Handle different types of errors
    if (error.response) {
      // Server returned error status code
      const status = error.response.status;
      
      switch (status) {
        case 401:
          // Unauthorized, clear user information
          this.clearUserSession();
          break;
        case 403:
          console.error('Access forbidden');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error');
          break;
        default:
          console.error(`Error: ${status}`);
      }
    } else if (error.request) {
      // Request sent but no response received
      console.error('No response received');
    } else {
      // Request configuration error
      console.error('Request error:', error.message);
    }

    return Promise.reject(error);
  }

  /**
   * Get user information from local storage
   */
  private getUserFromLocalStorage(): any {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  }

  /**
   * Clear user session
   */
  private clearUserSession(): void {
    localStorage.removeItem('user');
    // Can add logic to redirect to login page
  }

  /**
   * Send request (with request deduplication)
   */
  async request<T = any>(config: ExtendedAxiosRequestConfig): Promise<ApiResponse<T>> {
    // Check if there is a cached response
    if ('_cachedResponse' in config) {
      return config._cachedResponse as ApiResponse<T>;
    }

    // Generate request key
    const requestKey = this.generateCacheKey(config);

    // Check if there is a same request in progress
    if (this.pendingRequests[requestKey]) {
      return this.pendingRequests[requestKey];
    }

    // Create request Promise
    const requestPromise = this.instance.request<ApiResponse<T>>(config)
      .then(response => {
        // Request successful, remove from pending
        delete this.pendingRequests[requestKey];
        return response.data;
      })
      .catch(error => {
        // Request failed, remove from pending
        delete this.pendingRequests[requestKey];
        throw error;
      });

    // Add to pending requests
    this.pendingRequests[requestKey] = requestPromise;

    return requestPromise;
  }

  /**
   * GET request
   */
  async get<T = any>(url: string, config?: ExtendedAxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'get',
      url,
      ...config,
    });
  }

  /**
   * POST request
   */
  async post<T = any>(url: string, data?: any, config?: ExtendedAxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'post',
      url,
      data,
      ...config,
    });
  }

  /**
   * PUT request
   */
  async put<T = any>(url: string, data?: any, config?: ExtendedAxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'put',
      url,
      data,
      ...config,
    });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(url: string, config?: ExtendedAxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'delete',
      url,
      ...config,
    });
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache = {};
  }

  /**
   * Clear cache for specific URL
   */
  clearCacheForUrl(url: string): void {
    Object.keys(this.cache).forEach(key => {
      if (key.includes(url)) {
        delete this.cache[key];
      }
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export API endpoints
export const API_ENDPOINTS = {
  INVENTORY: '/inventory',
  INGREDIENTS: '/ingredients',
  RECIPES: '/recipes',
  PUBLIC_RECIPES: '/recipes/public',
  RECIPE_INGREDIENTS: '/recipe-ingredients',
  RECIPES_LIKE: (id: number) => `/recipes/${id}/like`,
  USERS_REGISTER: '/users/register',
  USERS_LOGIN: '/users/login',
  USERS: '/users',
  MEAL_PLANS: '/meal-plans',
  SHOPPING_LIST: '/shopping-list',
  NOTIFICATIONS: '/notifications',
  NOTIFICATIONS_READ: (id: number) => `/notifications/${id}/read`,
  NOTIFICATIONS_READ_ALL: '/notifications/read-all',
};
