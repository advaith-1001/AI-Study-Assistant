import axios from 'axios';

const API_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Send HttpOnly cookies with requests (JWT stored in secure cookie)
});

// Token refresh state
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Response interceptor: Handle token expiration and refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            // After refresh completes, retry original request
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to refresh the token using the api instance with cookies
        const response = await api.post('/auth/refresh-token', {});

        // Update refresh timestamp
        localStorage.setItem('refresh_timestamp', new Date().getTime().toString());

        processQueue(null);
        isRefreshing = false;

        // Retry the original request
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        isRefreshing = false;

        // Clear auth state before redirecting
        const currentPath = window.location.pathname;
        if (!['/login', '/register', '/'].includes(currentPath)) {
          // Import authStore and clear user
          import('../store/authStore.js').then(module => {
            module.default.setState({ 
              user: null, 
              isAuthenticated: false,
              isInitialCheckDone: true 
            });
          });
          
          localStorage.removeItem('user');
          localStorage.removeItem('refresh_timestamp');
          
          // Redirect to login with session expired message
          window.location.href = '/login?session_expired=true';
        }

        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

// Request interceptor: Check if token needs refresh before making request
api.interceptors.request.use((config) => {
  // Check if we should refresh token proactively
  const lastRefresh = localStorage.getItem('refresh_timestamp');
  if (lastRefresh) {
    const timeSinceRefresh = (new Date().getTime() - parseInt(lastRefresh)) / 1000;
    // If more than 12 minutes have passed since last refresh, refresh now (before 15 min expiry)
    if (timeSinceRefresh > 720) {  // 720 seconds = 12 minutes (3 min buffer before 15 min expiry)
      // Silently refresh token in background
      api.post('/auth/refresh-token', {})
        .then(() => {
          localStorage.setItem('refresh_timestamp', new Date().getTime().toString());
          console.log('[Auth] Token refreshed proactively');
        })
        .catch(err => {
          console.error('[Auth] Silent token refresh failed:', err);
          // Let the response interceptor handle the 401
        });
    }
  }
  return config;
}, (error) => Promise.reject(error));

export const authAPI = {
  register: async (email, password, username) => {
    const response = await api.post('/auth/register', {
      email,
      password,
      username,
    });
    return response.data;
  },

  login: async (email, password) => {
    const formData = new FormData();
    formData.append('username', email); // fastapi-users uses 'username' for email login
    formData.append('password', password);

    const response = await api.post('/auth/jwt/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // Token is now in HttpOnly cookie (secure, httpOnly set by backend)
    // Track refresh time for preemptive refresh
    localStorage.setItem('refresh_timestamp', new Date().getTime().toString());
    
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/jwt/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    // Clear local user data (backend clears HttpOnly cookie)
    localStorage.removeItem('user');
    localStorage.removeItem('refresh_timestamp');
  },

  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  },

  verifyToken: async () => {
    const response = await api.post('/auth/verify-token');
    return response.data;
  },

  refreshToken: async () => {
    const response = await api.post('/auth/refresh-token');
    localStorage.setItem('refresh_timestamp', new Date().getTime().toString());
    return response.data;
  },

  requestPasswordReset: async (email) => {
    const response = await api.post('/auth/request-password-reset', {
      email,
    });
    return response.data;
  },

  verifyResetToken: async (token) => {
    const response = await api.post('/auth/verify-reset-token', {
      token,
    });
    return response.data;
  },

  resetPassword: async (token, newPassword) => {
    const response = await api.post('/auth/reset-password', {
      token,
      new_password: newPassword,
    });
    return response.data;
  },
};

export const pathwayAPI = {
  getAllPathways: async () => {
    const response = await api.get('/pathways/');
    return response.data;
  },

  getPathwayById: async (pathwayId) => {
    const response = await api.get(`/pathways/${pathwayId}`);
    return response.data;
  },

  createPathway: async (name, topics) => {
    const response = await api.post('/pathways/', {
      name,
      topics: topics.map((topic, index) => ({
        name: topic,
        order_number: index + 1,
        keywords: [],
        status: 'PENDING',
      })),
    });
    return response.data;
  },

  chatWithPathway: async (pathwayId, message, history) => {
    // history should be the array of past messages
    // URL must match @router.post("/{pathway_id}/chat")
    const response = await api.post(`/pathways/${pathwayId}/chat`, {
      message: message,
      history: history 
    });
    return response.data;
  },

  generatePathway: async (topicsList, pathwayName) => {
    const response = await api.post('/pathways/generate', null, {
      params: {
        user_topics: topicsList,
        pathway_name: pathwayName,
      },
    });
    return response.data;
  },

  uploadPDFs: async (pathwayId, files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    const response = await api.post(
      `/pathways/${pathwayId}/upload-pdfs`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  getPathwayStatus: async (pathwayId) => {
    const response = await api.get(`/pathways/${pathwayId}/status`);
    return response.data;
  },
};

export const topicAPI = {
  getTopicSummary: async (topicId) => {
    const response = await api.get(`/topics/${topicId}/summary`);
    return response.data;
  },

  markTopicComplete: async (topicId) => {
    const response = await api.post(`/topics/${topicId}/complete`);
    return response.data;
  },

  getCurrentTopic: async (pathwayId) => {
    const response = await api.get(`/topics/${pathwayId}/current-topic`);
    return response.data;
  },
};

export const quizAPI = {
  generateQuiz: async (topicId, difficulty = 'medium', numQuestions = 5) => {
    const response = await api.post('/pathways/generate-quiz', {
      topic_id: topicId,
      difficulty,
      num_questions: numQuestions,
    });
    return response.data;
  },
};

export default api;
