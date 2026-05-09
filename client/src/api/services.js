import api from './axiosInstance'

export const cropService = {
  getAll: (params) => api.get('/api/buyer/crops', { params }),
  getById: (id) => api.get(`/api/buyer/crop/${id}`),
  create: (data) => api.post('/api/farmer/crop', data),
  update: (id, data) => api.put(`/api/farmer/crop/${id}`, data),
  delete: (id) => api.delete(`/api/farmer/crop/${id}`)
}

export const contractService = {
  create: (data) => api.post('/api/contract/create', data),
  getMy: () => api.get('/api/contract/my-contracts'),
  getStats: () => api.get('/api/contract/stats'),
  getById: (id) => api.get(`/api/contract/${id}`),
  accept: (id) => api.put(`/api/contract/${id}/accept`),
  reject: (id) => api.put(`/api/contract/${id}/reject`)
}

export const cartService = {
  add: (data) => api.post('/api/buyer/cart', data),
  get: () => api.get('/api/buyer/cart'),
  update: (cropId, qty) => api.put(`/api/buyer/cart/${cropId}`, { quantity: qty }),
  remove: (cropId) => api.delete(`/api/buyer/cart/${cropId}`)
}