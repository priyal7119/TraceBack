import api from './api';

export const matchService = {
  getMatches: async (params = {}) => {
    try {
      const res = await api.get('/matches', { params });
      return res.data;
    } catch {
      return null;
    }
  },

  getMatchById: async (id) => {
    try {
      const res = await api.get(`/matches/${id}`);
      return res.data;
    } catch {
      return null;
    }
  },

  updateStatus: async (id, status) => {
    try {
      const res = await api.patch(`/matches/${id}/status`, { status });
      return res.data;
    } catch {
      return null;
    }
  }
};

export const claimService = {
  submitClaim: async (claimData) => {
    try {
      const res = await api.post('/claims', claimData);
      return res.data;
    } catch {
      return null;
    }
  },

  getClaims: async (params = {}) => {
    try {
      const res = await api.get('/claims', { params });
      return res.data;
    } catch {
      return null;
    }
  },

  updateClaimStatus: async (id, status, notes) => {
    try {
      const res = await api.patch(`/claims/${id}`, { status, notes });
      return res.data;
    } catch {
      return null;
    }
  }
};

export const adminService = {
  getOverviewMetrics: async () => {
    try {
      const res = await api.get('/admin/metrics');
      return res.data;
    } catch {
      return null;
    }
  },

  getDisputes: async () => {
    try {
      const res = await api.get('/admin/disputes');
      return res.data;
    } catch {
      return null;
    }
  },

  resolveDispute: async (id, decision) => {
    try {
      const res = await api.post(`/admin/disputes/${id}/resolve`, { decision });
      return res.data;
    } catch {
      return null;
    }
  },

  getUsers: async () => {
    try {
      const res = await api.get('/admin/users');
      return res.data;
    } catch {
      return null;
    }
  },

  updateUser: async (id, data) => {
    try {
      const res = await api.patch(`/admin/users/${id}`, data);
      return res.data;
    } catch {
      return null;
    }
  }
};

export const authService = {
  login: async (credentials) => {
    try {
      const res = await api.post('/auth/login', credentials);
      return res.data;
    } catch {
      return null;
    }
  },

  register: async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      return res.data;
    } catch {
      return null;
    }
  },

  forgotPassword: async (email) => {
    try {
      const res = await api.post('/auth/forgot-password', { email });
      return res.data;
    } catch {
      return { success: true };
    }
  },

  resetPassword: async (token, newPassword) => {
    try {
      const res = await api.post('/auth/reset-password', { token, newPassword });
      return res.data;
    } catch {
      return { success: true };
    }
  }
};
