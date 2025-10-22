// Date formatting utilities
export const formatDate = (dateString, options = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', options);
};

// Image handling utilities
export const getImageUrl = (image) => {
  if (!image) return '';
  const baseUrl = process.env.REACT_APP_STRAPI_API_URL?.trim();
  return image.startsWith('http') ? image : `${baseUrl}${image}`;
};

// Performance utilities
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// DOM utilities
export const lockScroll = () => {
  document.body.style.overflow = 'hidden';
};

export const unlockScroll = () => {
  document.body.style.overflow = '';
};

// String utilities
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

// Array utilities
export const sortByDate = (array, dateKey = 'createdAt', ascending = false) => {
  return [...array].sort((a, b) => {
    const dateA = new Date(a[dateKey]);
    const dateB = new Date(b[dateKey]);
    return ascending ? dateA - dateB : dateB - dateA;
  });
};

// Validation utilities
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Error handling
export const handleApiError = (error) => {
  const message = error.response?.data?.error?.message || 
                 error.message || 
                 'An unexpected error occurred';
  console.error('API Error:', message);
  return message;
};