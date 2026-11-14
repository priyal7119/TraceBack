import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { normalizeItems, normalizeMatches } from '../utils/safeData';
import { useAuth } from './AuthContext';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const { user } = useAuth();

  // All state is initialized empty for multi-user isolation (never seeded with mock users)
  const [items, setItems] = useState([]);
  const [myReports, setMyReports] = useState([]);
  const [matches, setMatches] = useState([]);
  const [claims, setClaims] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    totalReports: 0,
    lostReportsCount: 0,
    foundReportsCount: 0,
    resolvedCount: 0,
    activeClaimsCount: 0,
    openDisputesCount: 0,
    totalUsers: 0,
    systemUptime: '99.9%',
    rekognitionAccuracy: 98.4,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  // When user identity changes or logs out, immediately reset all account-specific data
  useEffect(() => {
    setMyReports([]);
    setMatches([]);
    setClaims([]);
    setDisputes([]);
    setNotifications([]);
    if (!user) {
      setUsers([]);
    }
  }, [user?.id]);

  // Initial load from backend APIs
  const refreshDataFromBackend = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch public browse items (lost + found)
      const [lostRes, foundRes] = await Promise.allSettled([
        api.get('/reports/lost'),
        api.get('/reports/found'),
      ]);

      let combinedReports = [];
      if (lostRes.status === 'fulfilled' && lostRes.value.data?.reports) {
        combinedReports.push(...lostRes.value.data.reports);
      }
      if (foundRes.status === 'fulfilled' && foundRes.value.data?.reports) {
        combinedReports.push(...foundRes.value.data.reports);
      }

      setItems(normalizeItems(combinedReports));
      setIsBackendConnected(true);

      // If an authenticated user session is active, fetch user-scoped data
      if (user?.id) {
        // 2. Fetch authenticated user's own reports (/reports/my-reports)
        try {
          const myReportsRes = await api.get('/reports/my-reports');
          if (myReportsRes.data?.reports) {
            setMyReports(normalizeItems(myReportsRes.data.reports));
          }
        } catch (err) {
          console.warn('Could not fetch user reports:', err.message);
        }

        // 3. Fetch authenticated user's matches
        try {
          const matchesRes = await api.get('/matches');
          if (matchesRes.data?.matches) {
            setMatches(normalizeMatches(matchesRes.data.matches));
          }
        } catch (err) {
          console.warn('Could not fetch matches:', err.message);
        }

        // 4. Fetch authenticated user's notifications
        try {
          const notifsRes = await api.get('/notifications');
          if (notifsRes.data?.notifications) {
            setNotifications(notifsRes.data.notifications);
          }
        } catch (err) {
          console.warn('Could not fetch notifications:', err.message);
        }

        // 5. Fetch claims (user's claims or all if admin)
        try {
          const claimsRes = await api.get(user.role === 'admin' ? '/claims' : '/claims/my-claims');
          if (claimsRes.data?.claims) {
            setClaims(claimsRes.data.claims);
          }
        } catch (err) {
          console.warn('Could not fetch claims:', err.message);
        }

        // 6. Fetch disputes (user's disputes or all if admin)
        try {
          const disputesRes = await api.get('/disputes');
          if (disputesRes.data?.disputes) {
            setDisputes(disputesRes.data.disputes);
          }
        } catch (err) {
          console.warn('Could not fetch disputes:', err.message);
        }

        // 7. Fetch users (admin only)
        if (user.role === 'admin') {
          try {
            const usersRes = await api.get('/admin/users');
            if (usersRes.data?.users) {
              setUsers(usersRes.data.users);
            }
          } catch {}
        }
      }

      // 8. Fetch campus stats (public stats first)
      try {
        const statsRes = await api.get('/reports/stats');
        if (statsRes.data?.stats) {
          setStats(statsRes.data.stats);
        }
      } catch {
        if (user?.role === 'admin') {
          try {
            const adminStats = await api.get('/admin/overview');
            if (adminStats.data?.stats) setStats(adminStats.data.stats);
          } catch {}
        }
      }
    } catch (err) {
      console.warn('Backend synchronization notice:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.role]);

  useEffect(() => {
    refreshDataFromBackend();
  }, [refreshDataFromBackend, user?.id]);

  // Actions connected to Backend APIs
  const addReport = async (newReport) => {
    try {
      const endpoint = newReport.type === 'found' ? '/reports/found' : '/reports/lost';
      const response = await api.post(endpoint, newReport);
      const reportData = response.data?.report || response.data?.data;
      if (reportData) {
        const saved = normalizeItems([reportData])[0] || reportData;
        setItems(prev => [saved, ...prev]);
        setMyReports(prev => [saved, ...prev]);
        // Refresh matches as backend auto-evaluates
        refreshDataFromBackend();
        return saved;
      }
      return response.data;
    } catch (error) {
      console.warn('Backend report submission error.', error.message);
      throw error;
    }
  };

  const updateItemStatus = async (id, newStatus) => {
    try {
      await api.patch(`/admin/reports/${id}/status`, { status: newStatus });
    } catch {}
    setItems(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
    setMyReports(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
  };

  const deleteItem = async (id) => {
    try {
      await api.delete(`/reports/${id}`);
    } catch {}
    setItems(prev => prev.filter(item => item.id !== id));
    setMyReports(prev => prev.filter(item => item.id !== id));
  };

  const archiveItem = async (id) => {
    try {
      await api.patch(`/admin/reports/${id}/status`, { status: 'archived' });
    } catch {}
    setItems(prev => prev.map(item => item.id === id ? { ...item, status: 'archived' } : item));
    setMyReports(prev => prev.map(item => item.id === id ? { ...item, status: 'archived' } : item));
  };

  const submitClaim = async (claimData) => {
    try {
      const response = await api.post('/claims', claimData);
      if (response.data?.claim) {
        const saved = response.data.claim;
        setClaims(prev => [saved, ...prev]);
        updateItemStatus(claimData.itemId, 'under_review');
        return saved;
      }
    } catch (err) {
      console.warn('Backend claim error.', err.message);
      throw err;
    }
  };

  const updateClaimStatus = async (id, newStatus, adminNotes) => {
    try {
      await api.patch(`/claims/${id}`, { status: newStatus, adminNotes });
    } catch {}
    setClaims(prev => prev.map(claim => {
      if (claim.id === id) {
        return {
          ...claim,
          status: newStatus,
          adminNotes: adminNotes || claim.adminNotes
        };
      }
      return claim;
    }));
  };

  const updateDisputeStatus = async (id, newStatus, decision) => {
    try {
      await api.post(`/disputes/${id}/resolve`, { decision, status: newStatus });
    } catch {}
    setDisputes(prev => prev.map(d => {
      if (d.id === id) {
        return {
          ...d,
          status: newStatus,
          arbitrationDecision: decision || d.arbitrationDecision,
          lastUpdated: new Date().toISOString()
        };
      }
      return d;
    }));
  };

  const updateMatchStatus = async (id, newStatus) => {
    try {
      await api.patch(`/matches/${id}/status`, { status: newStatus });
    } catch {}
    setMatches(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m));
  };

  const recordMatchDecision = async (id, decision) => {
    try {
      const response = await api.post(`/matches/${id}/decision`, { decision });
      if (response.data?.match) {
        const updated = normalizeMatches([response.data.match])[0];
        setMatches(prev => prev.map(m => m.id === id ? { ...m, ...updated } : m));
        return updated;
      }
    } catch (err) {
      console.warn('Backend match decision error:', err.message);
      throw err;
    }
  };

  const markNotificationRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
    } catch {}
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
    } catch {}
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const updateUserStatus = async (id, newStatus) => {
    try {
      await api.patch(`/admin/users/${id}`, { status: newStatus });
    } catch {}
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));
  };

  const updateUserRole = async (id, newRole) => {
    try {
      await api.patch(`/admin/users/${id}`, { role: newRole });
    } catch {}
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
  };

  return (
    <DataContext.Provider
      value={{
        items,
        myReports,
        matches,
        claims,
        disputes,
        users,
        notifications,
        stats,
        isLoading,
        isBackendConnected,
        refreshDataFromBackend,
        addReport,
        updateItemStatus,
        deleteItem,
        archiveItem,
        submitClaim,
        updateClaimStatus,
        updateDisputeStatus,
        updateMatchStatus,
        recordMatchDecision,
        markNotificationRead,
        markAllNotificationsRead,
        updateUserStatus,
        updateUserRole,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};
