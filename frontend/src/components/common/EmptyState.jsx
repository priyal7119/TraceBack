import React from 'react';
import { FolderSearch, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EmptyState = ({
  icon: Icon = FolderSearch,
  title = 'No records found',
  description = 'There are currently no items matching your criteria.',
  actionLabel,
  actionLink,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center bg-cream-50/70 border border-dashed border-sand-300 rounded-2xl my-4">
      <div className="w-14 h-14 rounded-full bg-sand-200 flex items-center justify-center text-olive mb-4">
        <Icon className="w-7 h-7 text-olive-light" />
      </div>
      <h3 className="text-lg font-semibold text-olive mb-1">{title}</h3>
      <p className="text-sm text-charcoal-muted max-w-md mb-6">{description}</p>
      
      {actionLabel && actionLink && (
        <Link
          to={actionLink}
          className="inline-flex items-center gap-2 px-4 py-2 bg-terracotta text-white font-medium rounded-lg hover:bg-terracotta-hover transition text-sm shadow-sm"
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </Link>
      )}

      {actionLabel && !actionLink && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 bg-terracotta text-white font-medium rounded-lg hover:bg-terracotta-hover transition text-sm shadow-sm"
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
};
