import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  FileText, 
  PlusCircle, 
  Search, 
  MapPin, 
  Calendar, 
  Trash2, 
  CheckCircle, 
  Eye, 
  Sparkles,
  ExternalLink,
  Filter
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmDialog } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { getSafeImage, FALLBACK_ITEM_IMAGE } from '../../utils/safeData';

export const MyReports = () => {
  const { items, myReports = [], updateItemStatus, deleteItem } = useData();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState(searchParams.get('type') || 'all'); // 'all', 'lost', 'found', 'active', 'resolved'
  const [searchTerm, setSearchTerm] = useState('');
  
  // Confirmation dialogs
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [resolveConfirmOpen, setResolveConfirmOpen] = useState(false);
  const [itemToResolve, setItemToResolve] = useState(null);

  // Authenticated user's items strictly scoped to user.id
  const userItems = useMemo(() => {
    if (!user?.id) return [];
    if (Array.isArray(myReports) && myReports.length > 0) {
      return myReports.filter(item => item.userId === user.id || item.reportedBy?.id === user.id);
    }
    return (items || []).filter(item => item.userId === user.id || item.reportedBy?.id === user.id);
  }, [myReports, items, user?.id]);

  const filteredReports = useMemo(() => {
    return userItems.filter(item => {
      // Tab filter
      if (activeTab === 'lost' && item.type !== 'lost') return false;
      if (activeTab === 'found' && item.type !== 'found') return false;
      if (activeTab === 'active' && (item.status === 'resolved' || item.status === 'archived')) return false;
      if (activeTab === 'resolved' && item.status !== 'resolved') return false;

      // Search term
      if (searchTerm) {
        const titleMatch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
        const locMatch = item.location.toLowerCase().includes(searchTerm.toLowerCase());
        const catMatch = item.category.toLowerCase().includes(searchTerm.toLowerCase());
        if (!titleMatch && !locMatch && !catMatch) return false;
      }

      return true;
    });
  }, [userItems, activeTab, searchTerm]);

  const handleDelete = (item) => {
    setItemToDelete(item);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteItem(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  const handleResolve = (item) => {
    setItemToResolve(item);
    setResolveConfirmOpen(true);
  };

  const confirmResolve = () => {
    if (itemToResolve) {
      updateItemStatus(itemToResolve.id, 'resolved');
      setItemToResolve(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-olive">
            My Reports
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-light mt-1">
            Manage your filed lost items and found property submissions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/user/report-lost"
            className="btn-terracotta px-4 py-2 text-xs font-semibold shadow-sm flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Report Lost
          </Link>
          <Link
            to="/user/report-found"
            className="btn-olive px-4 py-2 text-xs font-semibold shadow-sm flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Report Found
          </Link>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="card-warm p-4 bg-cream-50 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-2 sm:pb-0">
            {[
              { id: 'all', label: 'All Reports', count: userItems.length },
              { id: 'lost', label: 'Lost', count: userItems.filter(i => i.type === 'lost').length },
              { id: 'found', label: 'Found', count: userItems.filter(i => i.type === 'found').length },
              { id: 'active', label: 'Active', count: userItems.filter(i => i.status !== 'resolved').length },
              { id: 'resolved', label: 'Resolved', count: userItems.filter(i => i.status === 'resolved').length },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-olive text-white font-semibold shadow-sm'
                    : 'text-charcoal hover:bg-sand-200'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-sand-200 text-charcoal-light'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-charcoal-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search my reports..."
              className="w-full bg-sand-100 pl-9 pr-3 py-1.5 rounded-lg border border-sand-300 text-xs text-charcoal focus:outline-none focus:border-terracotta"
            />
          </div>

        </div>
      </div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <EmptyState
          title="No reports in this view"
          description="You haven't filed any reports matching this filter."
          actionLabel="File a New Report"
          actionLink="/user/report-lost"
        />
      ) : (
        <div className="space-y-3">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="card-warm p-4 sm:p-5 bg-cream-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-sand-400 transition"
            >
              <div className="flex items-start sm:items-center gap-4 min-w-0">
                <img
                  src={getSafeImage(report)}
                  alt={report.title || 'Item image'}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-sand-300 flex-shrink-0"
                  onError={(e) => {
                    e.target.src = FALLBACK_ITEM_IMAGE;
                  }}
                />

                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${report.type === 'lost' ? 'bg-terracotta-subtle text-terracotta' : 'bg-sage-100 text-olive'}`}>
                      {report.type}
                    </span>
                    <StatusBadge status={report.status} />
                    <span className="text-xs text-charcoal-muted uppercase">{report.category}</span>
                  </div>

                  <h3 className="font-semibold text-olive text-base truncate">
                    {report.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-charcoal-muted">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-olive" />
                      {report.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-olive" />
                      {report.date}
                    </span>
                    <span className="flex items-center gap-1 text-terracotta font-medium">
                      <Sparkles className="w-3 h-3" />
                      Rekognition Active
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-sand-200 w-full sm:w-auto justify-end">
                {report.type === 'found' ? (
                  <Link
                    to={`/items/${report.id}`}
                    className="p-2 rounded-lg border border-sand-300 text-charcoal hover:bg-sand-200 transition text-xs font-semibold flex items-center gap-1"
                    title="View Public Listing"
                  >
                    <Eye className="w-3.5 h-3.5 text-olive" />
                    <span className="hidden sm:inline">Listing</span>
                  </Link>
                ) : (
                  <Link
                    to="/user/matches"
                    className="p-2 rounded-lg bg-terracotta-subtle border border-terracotta/30 text-terracotta hover:bg-terracotta hover:text-white transition text-xs font-semibold flex items-center gap-1"
                    title="View Matches"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Matches</span>
                  </Link>
                )}

                {report.status !== 'resolved' && (
                  <button
                    onClick={() => handleResolve(report)}
                    className="p-2 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition text-xs font-semibold flex items-center gap-1"
                    title="Mark as Returned / Resolved"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Resolve</span>
                  </button>
                )}

                <button
                  onClick={() => handleDelete(report)}
                  className="p-2 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 transition"
                  title="Delete Report"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Report"
        message={`Are you sure you want to delete "${itemToDelete?.title}"? This will cancel any active Amazon Rekognition match algorithms.`}
        confirmText="Delete Report"
        danger={true}
      />

      {/* Resolve Confirmation Dialog */}
      <ConfirmDialog
        isOpen={resolveConfirmOpen}
        onClose={() => setResolveConfirmOpen(false)}
        onConfirm={confirmResolve}
        title="Mark Item as Resolved"
        message={`Has "${itemToResolve?.title}" been successfully returned? Marking it resolved will archive the case and celebrate a successful reunion!`}
        confirmText="Confirm Reunited"
        danger={false}
      />

    </div>
  );
};
