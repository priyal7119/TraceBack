import React, { useState, useMemo } from 'react';
import { 
  PackageCheck, 
  Search, 
  Filter, 
  Eye, 
  Trash2, 
  Building2, 
  Sparkles, 
  MapPin, 
  Calendar,
  CheckCircle,
  Archive
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal, ConfirmDialog } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { getSafeImage, FALLBACK_ITEM_IMAGE } from '../../utils/safeData';

export const ManageFoundReports = () => {
  const { items, updateItemStatus, deleteItem } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Inspect modal
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [inspectItem, setInspectItem] = useState(null);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const foundItems = useMemo(() => {
    return items.filter(i => i.type === 'found');
  }, [items]);

  const filteredItems = useMemo(() => {
    return foundItems.filter(item => {
      if (searchTerm) {
        const text = (item.title + item.description + item.location + (item.storageLocation || '')).toLowerCase();
        if (!text.includes(searchTerm.toLowerCase())) return false;
      }
      if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
      if (selectedStatus !== 'All' && item.status !== selectedStatus) return false;
      return true;
    });
  }, [foundItems, searchTerm, selectedCategory, selectedStatus]);

  const openInspect = (item) => {
    setInspectItem(item);
    setInspectModalOpen(true);
  };

  const openDelete = (item) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteItem(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  const handleStatusChange = (id, newStatus) => {
    updateItemStatus(id, newStatus);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-olive uppercase tracking-wider mb-1">
            <PackageCheck className="w-3.5 h-3.5 text-terracotta" />
            <span>Custody Vault Repository</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-olive">
            Manage Found Reports
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-light">
            Track physical storage vaults, verify custodian handoffs, and manage public status visibility.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-charcoal">
          <span className="bg-sand-200 px-3 py-1.5 rounded-lg border border-sand-300">
            Total In Custody: <strong className="text-olive">{foundItems.length}</strong>
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card-warm p-4 bg-cream-50 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-charcoal-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, storage vault, location..."
            className="w-full bg-sand-100 pl-9 pr-3 py-2 rounded-xl border border-sand-300 text-xs text-charcoal focus:outline-none focus:border-terracotta"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-sand-100 border border-sand-300 rounded-xl px-3 py-2 text-xs text-charcoal font-medium focus:outline-none flex-1 sm:flex-initial"
          >
            <option value="All">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Bags & Wallets">Bags & Wallets</option>
            <option value="Jewelry & Watches">Jewelry & Watches</option>
            <option value="Keys & Cards">Keys & Cards</option>
            <option value="Other">Other</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-sand-100 border border-sand-300 rounded-xl px-3 py-2 text-xs text-charcoal font-medium focus:outline-none flex-1 sm:flex-initial"
          >
            <option value="All">All Statuses</option>
            <option value="active">Active (Unclaimed)</option>
            <option value="matched">Matched</option>
            <option value="under_review">Claim Under Review</option>
            <option value="claimed">Claimed</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {filteredItems.length === 0 ? (
        <EmptyState
          icon={PackageCheck}
          title="No found reports match criteria"
          description="Try broadening your search or filter options."
        />
      ) : (
        <div className="card-warm overflow-hidden bg-cream-50 border-sand-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-sand-200/80 text-olive uppercase tracking-wider text-[10px] font-bold border-b border-sand-300">
                <tr>
                  <th className="py-3 px-4">Item & Case ID</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Custody / Storage Vault</th>
                  <th className="py-3 px-4">Found Location & Date</th>
                  <th className="py-3 px-4">AI Score</th>
                  <th className="py-3 px-4">Custody Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-200/80">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-sand-100/60 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={getSafeImage(item)}
                          alt={item.title}
                          onError={(e) => {
                            if (e.target.src !== FALLBACK_ITEM_IMAGE) {
                              e.target.src = FALLBACK_ITEM_IMAGE;
                            }
                          }}
                          className="w-10 h-10 rounded-lg object-cover border border-sand-300 flex-shrink-0"
                        />
                        <div>
                          <p className="font-semibold text-olive truncate max-w-[170px]">{item.title}</p>
                          <span className="text-[10px] text-charcoal-muted font-mono">{item.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-charcoal-light font-medium">
                      {item.category}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-medium text-olive truncate max-w-[170px]">
                        <Building2 className="w-3.5 h-3.5 text-terracotta flex-shrink-0" />
                        <span className="truncate">{item.storageLocation || 'Vault #1'}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <p className="text-charcoal font-medium">{item.date}</p>
                      <p className="text-[10px] text-charcoal-muted truncate max-w-[150px]">{item.location}</p>
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-terracotta bg-terracotta-subtle px-2 py-0.5 rounded text-[11px]">
                        <Sparkles className="w-3 h-3" />
                        {item.rekognitionConfidence}%
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <select
                        value={item.status}
                        onChange={(e) => handleStatusChange(item.id, e.target.value)}
                        className="bg-sand-100 border border-sand-300 rounded-lg px-2 py-1 text-[11px] font-semibold text-charcoal focus:outline-none"
                      >
                        <option value="active">Active</option>
                        <option value="matched">Matched</option>
                        <option value="under_review">Under Review</option>
                        <option value="claimed">Claimed</option>
                        <option value="resolved">Resolved</option>
                        <option value="archived">Archived</option>
                      </select>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openInspect(item)}
                          className="p-1.5 rounded-lg border border-sand-300 text-charcoal hover:bg-sand-200 transition"
                          title="Inspect Details"
                        >
                          <Eye className="w-3.5 h-3.5 text-olive" />
                        </button>
                        <button
                          onClick={() => openDelete(item)}
                          className="p-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 transition"
                          title="Delete Found Item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inspect Modal */}
      {inspectItem && (
        <Modal
          isOpen={inspectModalOpen}
          onClose={() => setInspectModalOpen(false)}
          title={`Found Item Custody Record: ${inspectItem.title}`}
        >
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <img
                src={getSafeImage(inspectItem)}
                alt={inspectItem.title}
                onError={(e) => {
                  if (e.target.src !== FALLBACK_ITEM_IMAGE) {
                    e.target.src = FALLBACK_ITEM_IMAGE;
                  }
                }}
                className="w-24 h-24 rounded-xl object-cover border border-sand-300"
              />
              <div className="space-y-1">
                <StatusBadge status={inspectItem.status} />
                <h4 className="text-lg font-bold text-olive">{inspectItem.title}</h4>
                <p className="text-xs text-charcoal-muted">Case ID: {inspectItem.id} • Category: {inspectItem.category}</p>
              </div>
            </div>

            <div className="p-3 bg-sand-100 rounded-xl space-y-1 text-xs">
              <span className="font-bold text-olive block">Public Description:</span>
              <p className="text-charcoal-light">{inspectItem.description}</p>
            </div>

            <div className="p-3 bg-sage-100 rounded-xl space-y-1 text-xs border border-sage-300">
              <span className="font-bold text-olive block">Physical Safekeeping Vault:</span>
              <p className="text-olive font-semibold">{inspectItem.storageLocation}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <span className="text-charcoal-muted block">Recovered At:</span>
                <span className="font-semibold">{inspectItem.location} ({inspectItem.date})</span>
              </div>
              <div>
                <span className="text-charcoal-muted block">Intake Officer / Finder:</span>
                <span className="font-semibold">{inspectItem.reportedBy?.name || 'Staff'}</span>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-sand-200">
              <button
                onClick={() => setInspectModalOpen(false)}
                className="btn-terracotta px-4 py-2 text-xs font-semibold"
              >
                Close Record
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Found Record"
        message={`Are you sure you want to permanently delete found record "${itemToDelete?.title}" from custody?`}
        confirmText="Confirm Delete"
        danger={true}
      />

    </div>
  );
};
