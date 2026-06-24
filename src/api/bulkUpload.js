import axios from 'axios';

const API_BASE = 'http://localhost:6060/api/bulk-upload';

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

export const uploadFile = (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  return axios.post(`${API_BASE}/upload`, formData, {
    headers: { ...getAuthHeader(), 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress) onProgress(Math.round((e.loaded * 100) / e.total));
    },
  });
};

export const getAllJobs = (limit = 20, offset = 0) =>
  axios.get(`${API_BASE}/jobs?limit=${limit}&offset=${offset}`, { headers: getAuthHeader() });

export const getJobStatus = (jobId) =>
  axios.get(`${API_BASE}/jobs/${jobId}`, { headers: getAuthHeader() });

export const deleteJob = (jobId) =>
  axios.delete(`${API_BASE}/jobs/${jobId}`, { headers: getAuthHeader() });

export const downloadTemplate = () =>
  axios.get(`${API_BASE}/template`, {
    headers: getAuthHeader(),
    responseType: 'blob',
  });

export const getRestaurants = () =>
  axios.get(`${API_BASE}/restaurants`, { headers: getAuthHeader() });

export const getMenuItems = (restaurantId, search = '') =>
  axios.get(`${API_BASE}/menu-items`, {
    headers: getAuthHeader(),
    params: { restaurant_id: restaurantId || undefined, search: search || undefined },
  });

export const uploadFileWithRestaurant = (file, restaurantId, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('restaurant_id', restaurantId);
  return axios.post(`${API_BASE}/upload`, formData, {
    headers: { ...getAuthHeader(), 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress) onProgress(Math.round((e.loaded * 100) / e.total));
    },
  });
};
