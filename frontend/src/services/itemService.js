import api from './api';

export const itemService = {
  // Get all items with optional query params (type, category, search, city, status)
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/items', { params });
      return response.data;
    } catch (error) {
      // In local mode or mock environment, fallback to null to let DataContext provide data
      return null;
    }
  },

  // Get item by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/items/${id}`);
      return response.data;
    } catch (error) {
      return null;
    }
  },

  // Create a new report (Lost or Found)
  create: async (itemData) => {
    try {
      const endpoint = itemData.type === 'found' ? '/reports/found' : '/reports/lost';
      const response = await api.post(endpoint, itemData);
      return response.data?.report || response.data;
    } catch (error) {
      return null;
    }
  },

  // Update item details or status
  update: async (id, updateData) => {
    try {
      const response = await api.put(`/items/${id}`, updateData);
      return response.data;
    } catch (error) {
      return null;
    }
  },

  // Delete item
  delete: async (id) => {
    try {
      const response = await api.delete(`/items/${id}`);
      return response.data;
    } catch (error) {
      return null;
    }
  },

  // Simulate AWS Rekognition visual scan
  analyzeImageWithRekognition: async (imageBase64OrUrl) => {
    try {
      const response = await api.post('/rekognition/detect-labels', { image: imageBase64OrUrl });
      return response.data;
    } catch (error) {
      // Prototype fallback Rekognition simulation
      return {
        confidence: 96.8,
        labels: ['Personal Belonging', 'Identifiable Object', 'Accessories'],
        primaryColor: 'Neutral',
      };
    }
  }
};
