import axios from 'axios';

const API_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Send cookies with requests
});

// Add token to Authorization header if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if we're not already on login/register page
      // and not doing the initial auth check
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

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
    
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
    }
    
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/jwt/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },

  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  },
};

export const pathwayAPI = {
  getAllPathways: async () => {
    const response = await api.get('/pathways/');
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

  getPathwayById: async (pathwayId) => {
    const response = await api.get(`/pathways/${pathwayId}`);
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
