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
 * Call Zhipu GLM-4V API for image analysis
 * @param imageBase64 Base64 encoded image data (with data URL prefix)
 * @param scenario Analysis scenario (receipt or fridge)
 * @returns Analysis result from Zhipu API
 */
export const analyzeImageWithZhipuAI = async (imageBase64: string, scenario: string = 'receipt'): Promise<any> => {
  const ZHIPU_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
  const ZHIPU_API_KEY = '5f41881a249d43ada948ef287b72f0c9.HQNZjfXnADSoFFDX'; // Replace with your actual API key
  
  // Get user from localStorage
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const userId = user?.id;
  
  console.log('analyzeImageWithZhipuAI - userId:', userId);
  console.log('analyzeImageWithZhipuAI - scenario:', scenario);
  console.log('analyzeImageWithZhipuAI - imageBase64 length:', imageBase64.length);
  
  // Build prompt based on scenario
  const prompt = scenario === 'fridge'
    ? 'Please identify all food ingredients visible in this fridge image, ignore packaging and background.\nRules:\nReturn ONLY pure JSON array, no markdown, no ```json, no backticks, no extra words.\nFormat: ["ingredient1","ingredient2","ingredient3"]\nDo NOT add any explanation outside of JSON.'
    : 'Please identify all food ingredients in this receipt image.\nRules:\n1. Translate all ingredient names to English\n2. Return ONLY pure JSON array, no markdown, no ```json, no backticks, no extra words\n3. Format: ["ingredient1","ingredient2","ingredient3"]\n4. Do NOT add any explanation outside of JSON\n5. All ingredient names must be in English\n6. Do NOT include quantities, only ingredient names';
  
  // Build request body
  const requestBody = {
    model: 'glm-4v',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: imageBase64
            }
          },
          {
            type: 'text',
            text: prompt
          }
        ]
      }
    ],
    temperature: 0.7,
    max_tokens: 2048
  };
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ZHIPU_API_KEY}`
  };
  
  // Add X-User-Id header if user is logged in
  if (userId) {
    (headers as any)['X-User-Id'] = userId.toString();
    console.log('analyzeImageWithZhipuAI - Adding X-User-Id header:', userId);
  }
  
  console.log('analyzeImageWithZhipuAI - sending request to:', ZHIPU_API_URL);
  console.log('analyzeImageWithZhipuAI - request body:', JSON.stringify(requestBody, null, 2));
  
  try {
    const response = await fetch(ZHIPU_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });
    
    console.log('analyzeImageWithZhipuAI - response status:', response.status);
    console.log('analyzeImageWithZhipuAI - response ok:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Zhipu API Error: ${response.status} - ${errorText}`);
      
      // Handle specific error cases
      if (response.status === 401) {
        throw new Error('Invalid Zhipu API Key. Please check your API key configuration.');
      } else if (response.status === 429) {
        throw new Error('Zhipu API rate limit exceeded. Please try again later.');
      } else if (response.status === 500) {
        throw new Error('Zhipu API server error. Please try again later.');
      } else {
        throw new Error(`Zhipu API request failed: ${response.status} - ${errorText}`);
      }
    }
    
    const result = await response.json();
    console.log('analyzeImageWithZhipuAI - result:', result);
    
    // Extract content from response
    if (result.choices && result.choices.length > 0) {
      let content = result.choices[0].message.content;
      console.log('analyzeImageWithZhipuAI - raw content:', content);
      
      // Clean up markdown formatting if present
      content = content.trim();
      
      // Remove markdown code blocks if present
      if (content.startsWith('```json')) {
        content = content.replace(/^```json\s*/, '').replace(/```\s*$/, '');
      } else if (content.startsWith('```')) {
        content = content.replace(/^```\s*/, '').replace(/```\s*$/, '');
      }
      
      // Remove any remaining backticks
      content = content.replace(/`/g, '');
      
      content = content.trim();
      console.log('analyzeImageWithZhipuAI - cleaned content:', content);
      
      // Parse content based on scenario
      try {
        // Both scenarios now return the same format: ["ingredient1", "ingredient2"]
        const ingredients = JSON.parse(content);
        const detectedItems = ingredients.map((name: string, index: number) => ({
          id: index + 1,
          name: name
        }));
        return { detectedItems, scenario };
      } catch (parseError) {
        console.error('analyzeImageWithZhipuAI - parse error:', parseError);
        console.error('analyzeImageWithZhipuAI - content that failed to parse:', content);
        throw new Error('Failed to parse AI response. Please try again.');
      }
    } else {
      throw new Error('Invalid response from Zhipu API. Please try again.');
    }
  } catch (error) {
    console.error('analyzeImageWithZhipuAI - error:', error);
    
    if (error instanceof Error) {
      // Re-throw known errors
      if (error.message.includes('Zhipu API')) {
        throw error;
      }
      // Handle network errors
      if (error.message.includes('fetch') || error.message.includes('network')) {
        throw new Error('Network error. Please check your internet connection and try again.');
      }
    }
    
    throw new Error('Failed to analyze image. Please try again.');
  }
};
