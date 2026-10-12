const API_BASE_URL = 'http://localhost:5000';

const getHeaders = (isMultipart = false) => {
  const token = localStorage.getItem('token');
  const headers = {};
  
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  
  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }
  
  return data;
};

export const api = {
  // Auth API
  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  async register(name, email, password) {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, email, password }),
    });
    return handleResponse(response);
  },

  async logout() {
    try {
      const response = await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: getHeaders(),
      });
      return await handleResponse(response);
    } catch (e) {
      console.warn('Backend logout failed or offline:', e);
      return { success: true };
    }
  },

  // Quiz Generation API
  async generateFromTopic(topic, difficulty, count) {
    const response = await fetch(`${API_BASE_URL}/generate-topic`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ topic, difficulty, count }),
    });
    return handleResponse(response);
  },

  async generateFromText(text, difficulty, count) {
    const response = await fetch(`${API_BASE_URL}/generate-text`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ text, difficulty, count }),
    });
    return handleResponse(response);
  },

  async generateFromPDF(file, difficulty, count) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('difficulty', difficulty);
    formData.append('count', count);

    const response = await fetch(`${API_BASE_URL}/upload-pdf`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData,
    });
    return handleResponse(response);
  },

  async generateFromDOCX(file, difficulty, count) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('difficulty', difficulty);
    formData.append('count', count);

    const response = await fetch(`${API_BASE_URL}/upload-docx`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData,
    });
    return handleResponse(response);
  },

  // Quiz Attempt & Results API
  async submitQuiz(quiz_id, answers, time_taken) {
    const response = await fetch(`${API_BASE_URL}/submit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ quiz_id, answers, time_taken }),
    });
    return handleResponse(response);
  },

  async getHistory(search = '', difficulty = '') {
    const queryParams = new URLSearchParams();
    if (search) queryParams.append('search', search);
    if (difficulty) queryParams.append('difficulty', difficulty);
    
    const response = await fetch(`${API_BASE_URL}/history?${queryParams.toString()}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async getQuizDetails(quiz_id) {
    const response = await fetch(`${API_BASE_URL}/history/${quiz_id}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async deleteQuiz(quiz_id) {
    const response = await fetch(`${API_BASE_URL}/history/${quiz_id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Dashboard & Profile API
  async getDashboard() {
    const response = await fetch(`${API_BASE_URL}/dashboard`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async getProfile() {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Admin Panel API
  async getAdminAnalytics() {
    const response = await fetch(`${API_BASE_URL}/admin/analytics`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async getAdminUsers() {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async deleteAdminUser(user_id) {
    const response = await fetch(`${API_BASE_URL}/admin/users/${user_id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async getAdminQuizzes() {
    const response = await fetch(`${API_BASE_URL}/admin/quizzes`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async deleteAdminQuiz(quiz_id) {
    const response = await fetch(`${API_BASE_URL}/admin/quizzes/${quiz_id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  }
};
