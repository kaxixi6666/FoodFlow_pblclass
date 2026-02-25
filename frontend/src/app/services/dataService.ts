import { fetchAPI, API_ENDPOINTS } from '../config/api';

export const dataService = {
  // Fetch only essential data on login
  fetchEssentialData: async () => {
    try {
      // Only fetch user info, not all business data
      const userData = await fetchAPI(API_ENDPOINTS.USERS);
      return { userData };
    } catch (error) {
      console.error('Error fetching essential data:', error);
      return { userData: null };
    }
  },

  // Lazy load business data when needed
  fetchRecipesData: async () => {
    return Promise.all([
      fetchAPI(API_ENDPOINTS.RECIPES),
      fetchAPI(API_ENDPOINTS.INGREDIENTS)
    ]);
  },

  fetchInventoryData: async () => {
    return fetchAPI(API_ENDPOINTS.INVENTORY);
  }
};
