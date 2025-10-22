export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_STRAPI_API_URL || 'http://localhost:1337',
  TOKEN: process.env.REACT_APP_STRAPI_API_TOKEN,
  CACHE_TIME: 30 * 60 * 1000,
  STALE_TIME: 5 * 60 * 1000
};

export const THEME = {
  colors: {
    primary: '#6366f1',
    text: {
      primary: '#000000',
      secondary: '#666666'
    }
  }
};