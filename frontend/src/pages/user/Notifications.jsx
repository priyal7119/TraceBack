import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bell, 
  Sparkles, 
  ShieldCheck, 
  Info, 
  CheckCheck, 
  Trash2, 
  ArrowRight,
  Clock
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { EmptyState } from '../../components/common/EmptyState';

export const Notifications = () => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useData();
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'match', 'claim'

  const safeNotifs = Array.isArray(notifications) ? notifications : [];

  const filteredNotifs = safeNotifs.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'match') return n.type === 'match';
    if (filter === 'claim') return n.type === 'claim';
    return true;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'match':
        return <Sparkles className="w-5 h-5 text-terracotta" />;
      case 'claim':
        return <ShieldCheck className="w-5 h-5 text-olive" />;
      default:
        return <Bell className="w-5 h-5 text-charcoal-muted" />;
    }
  };

  return (
    <div className="w-full space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-olive">
            Notifications & Alerts
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-light mt-1">
            Stay updated on new Rekognition visual matches and custodial claim statuses.
          </p>
        </div>

        <button
          onClick={markAllNotificationsRead}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-sand-300 bg-cream-50 text-xs font-semibold text-charcoal hover:bg-sand-200 transition"
        >
          <CheckCheck className="w-3.5 h-3.5 text-olive" />
          Mark All as Read
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="card-warm p-3 bg-cream-50 flex items-center gap-1 overflow-x-auto">
        {[
          { id: 'all', label: 'All Alerts', count: safeNotifs.length },
          { id: 'unread', label: 'Unread', count: safeNotifs.filter(n => !n.read).length },
          { id: 'match', label: 'AI Matches', count: safeNotifs.filter(n => n.type === 'match').length },
          { id: 'claim', label: 'Claims', count: safeNotifs.filter(n => n.type === 'claim').length },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 whitespace-nowrap ${
              filter === t.id
                ? 'bg-olive text-white font-semibold shadow-sm'
                : 'text-charcoal hover:bg-sand-200'
            }`}
          >
            <span>{t.label}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filter === t.id ? 'bg-white/20 text-white' : 'bg-sand-200 text-charcoal-light'}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Notifications Feed */}
      {filteredNotifs.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You're all caught up! New AI match events and custodial updates will appear here."
        />
      ) : (
        <div className="space-y-3">
          {filteredNotifs.map((n) => (
            <div
              key={n.id}
              onClick={() => markNotificationRead(n.id)}
              className={`card-warm p-4 sm:p-5 flex items-start gap-4 transition cursor-pointer ${
                !n.read 
                  ? 'bg-cream-50 border-l-4 border-l-terracotta border-sand-300' 
                  : 'bg-sand-100/60 opacity-80 border-sand-300'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-sand-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                {getIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-semibold text-olive text-sm truncate flex items-center gap-2">
                    {n.title}
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-terracotta flex-shrink-0" />
                    )}
                  </h4>
                  <span className="text-[11px] text-charcoal-muted flex items-center gap-1 flex-shrink-0">
                    <Clock className="w-3 h-3" />
                    {n.createdAt}
                  </span>
                </div>

                <p className="text-xs text-charcoal-light leading-relaxed">
                  {n.message}
                </p>

                {n.link && (
                  <div className="pt-1.5">
                    <Link
                      to={n.link}
                      className="text-xs font-semibold text-terracotta hover:underline inline-flex items-center gap-1"
                    >
                      View Details <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
