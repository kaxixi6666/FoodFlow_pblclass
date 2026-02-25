import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// API基础URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://foodflow-pblclass.onrender.com/api';

// 接口响应类型
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 请求缓存接口
interface RequestCache {
  [key: string]: {
    data: any;
    timestamp: number;
  };
}

// 正在进行的请求
interface PendingRequests {
  [key: string]: Promise<any>;
}

class ApiClient {
  private instance: AxiosInstance;
  private cache: RequestCache = {};
  private pendingRequests: PendingRequests = {};
  private cacheExpiryTime = 5 * 60 * 1000; // 缓存过期时间：5分钟

  constructor() {
    // 创建axios实例
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => this.handleRequest(config),
      (error) => this.handleRequestError(error)
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response) => this.handleResponse(response),
      (error) => this.handleResponseError(error)
    );
  }

  /**
   * 生成请求缓存键
   */
  private generateCacheKey(config: AxiosRequestConfig): string {
    const { url, method, params, data } = config;
    const key = `${method || 'GET'}-${url}-${JSON.stringify(params || {})}-${JSON.stringify(data || {})}`;
    return key;
  }

  /**
   * 处理请求
   */
  private handleRequest(config: AxiosRequestConfig): AxiosRequestConfig {
    // 获取用户信息
    const user = this.getUserFromLocalStorage();
    
    // 添加用户ID到请求头
    if (user?.id && config.headers) {
      config.headers['X-User-Id'] = user.id.toString();
    }

    // 检查缓存
    if (config.method === 'get' && config.cache !== false) {
      const cacheKey = this.generateCacheKey(config);
      const cachedData = this.cache[cacheKey];
      
      if (cachedData && Date.now() - cachedData.timestamp < this.cacheExpiryTime) {
        // 返回缓存数据
        return { ...config, _cachedResponse: cachedData.data };
      }
    }

    return config;
  }

  /**
   * 处理请求错误
   */
  private handleRequestError(error: AxiosError): Promise<AxiosError> {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }

  /**
   * 处理响应
   */
  private handleResponse(response: AxiosResponse): AxiosResponse {
    const { config, data } = response;

    // 缓存GET请求的响应
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
   * 处理响应错误
   */
  private handleResponseError(error: AxiosError): Promise<never> {
    console.error('Response Error:', error);

    // 处理不同类型的错误
    if (error.response) {
      // 服务器返回错误状态码
      const status = error.response.status;
      
      switch (status) {
        case 401:
          // 未授权，清除用户信息
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
      // 请求已发送但未收到响应
      console.error('No response received');
    } else {
      // 请求配置错误
      console.error('Request error:', error.message);
    }

    return Promise.reject(error);
  }

  /**
   * 从本地存储获取用户信息
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
   * 清除用户会话
   */
  private clearUserSession(): void {
    localStorage.removeItem('user');
    // 可以添加重定向到登录页的逻辑
  }

  /**
   * 发送请求（带请求去重）
   */
  async request<T = any>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    // 生成请求键
    const requestKey = this.generateCacheKey(config);

    // 检查是否有相同请求正在进行
    if (this.pendingRequests[requestKey]) {
      return this.pendingRequests[requestKey];
    }

    // 创建请求Promise
    const requestPromise = this.instance.request<ApiResponse<T>>(config)
      .then(response => {
        // 请求成功，从pending中移除
        delete this.pendingRequests[requestKey];
        return response.data;
      })
      .catch(error => {
        // 请求失败，从pending中移除
        delete this.pendingRequests[requestKey];
        throw error;
      });

    // 添加到pending请求
    this.pendingRequests[requestKey] = requestPromise;

    return requestPromise;
  }

  /**
   * GET请求
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'get',
      url,
      ...config,
    });
  }

  /**
   * POST请求
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'post',
      url,
      data,
      ...config,
    });
  }

  /**
   * PUT请求
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'put',
      url,
      data,
      ...config,
    });
  }

  /**
   * DELETE请求
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'delete',
      url,
      ...config,
    });
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache = {};
  }

  /**
   * 清除特定URL的缓存
   */
  clearCacheForUrl(url: string): void {
    Object.keys(this.cache).forEach(key => {
      if (key.includes(url)) {
        delete this.cache[key];
      }
    });
  }
}

// 导出单例实例
export const apiClient = new ApiClient();

// 导出API端点
export const API_ENDPOINTS = {
  INVENTORY: '/inventory',
  INGREDIENTS: '/ingredients',
  RECIPES: '/recipes',
  PUBLIC_RECIPES: '/recipes/public',
  RECIPE_INGREDIENTS: '/recipe-ingredients',
  USERS_REGISTER: '/users/register',
  USERS_LOGIN: '/users/login',
  USERS: '/users',
  MEAL_PLANS: '/meal-plans',
  SHOPPING_LIST: '/shopping-list',
  NOTIFICATIONS: '/notifications',
  NOTES_LIKE: '/notes/{id}/like',
};
