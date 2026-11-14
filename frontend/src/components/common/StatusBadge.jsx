import React from 'react';

export const StatusBadge = ({ status, className = '' }) => {
  const getBadgeStyle = () => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-sage-100 text-olive border-sage-300';
      case 'under_review':
      case 'pending':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'matched':
        return 'bg-terracotta-subtle text-terracotta border-terracotta/30 font-semibold';
      case 'claimed':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'resolved':
      case 'approved':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'rejected':
      case 'suspended':
      case 'dismissed':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'archived':
      case 'closed':
        return 'bg-sand-200 text-charcoal-muted border-sand-300';
      default:
        return 'bg-sand-100 text-charcoal border-sand-200';
    }
  };

  const formatText = (txt) => {
    if (!txt) return '';
    return txt
      .split('_')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeStyle()} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {formatText(status)}
    </span>
  );
};
