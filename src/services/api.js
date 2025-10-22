import axios from 'axios';

const API_URL = process.env.REACT_APP_STRAPI_API_URL || 'http://localhost:1337';
const API_TOKEN = process.env.REACT_APP_STRAPI_API_TOKEN;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    ...(API_TOKEN && { 'Authorization': `Bearer ${API_TOKEN}` })
  },
});

const handleRequest = async (request) => {
  try {
    const response = await request();
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const strapiService = {
  getHomePage: () => handleRequest(() => api.get('/api/home?populate=*')),
  getInfo: () => handleRequest(() => api.get('/api/infos?populate=*')),
  getAwards: () => handleRequest(() => api.get('/api/award?populate=*')),
  getWorks: () => handleRequest(() => api.get('/api/works?populate=*')),
  getWork: (id) => handleRequest(() => api.get(`/api/works/${id}?populate=*`)),
  getSettings: () => handleRequest(() => api.get(`/api/setting?populate=*`)),
};

export default api;