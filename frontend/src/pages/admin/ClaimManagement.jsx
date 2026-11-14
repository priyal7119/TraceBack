import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  User, 
  FileText, 
  ShieldCheck, 
  AlertCircle,
  Building2,
  Calendar
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';

export const ClaimManagement = () => {
  const { claims, updateClaimStatus, updateItemStatus } = useData();

  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');

  const filteredClaims = claims.filter(c => {
    if (selectedStatus !== 'All' && c.status !== selectedStatus) return false;
    if (searchTerm) {
      const text = (c.itemTitle + c.claimantName + c.claimantEmail + (c.proofDescription || '')).toLowerCase();
      if (!text.includes(searchTerm.toLowerCase())) return false;
    }
    return true;
  });

  const openReview = (claim) => {
    setSelectedClaim(claim);
    setAdminNotes(claim.adminNotes || '');
    setReviewModalOpen(true);
  };

  const handleApprove = () => {
    if (selectedClaim) {
      updateClaimStatus(selectedClaim.id, 'approved', adminNotes || 'Approved by Custody Officer. Proof verified.');
      updateItemStatus(selectedClaim.itemId, 'resolved');
      setReviewModalOpen(false);
    }
  };

  const handleReject = () => {
    if (selectedClaim) {
      updateClaimStatus(selectedClaim.id, 'rejected', adminNotes || 'Rejected: Proof of ownership did not match undisclosed item traits.');
      updateItemStatus(selectedClaim.itemId, 'active');
      setReviewModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-terracotta uppercase tracking-wider mb-1">
            <ClipboardCheck className="w-3.5 h-3.5" />
            <span>Ownership Verification Queue</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-olive">
            Claim Management
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-light">
            Review proof of ownership, inspect receipts and undisclosed marks, and authorize release handoffs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-sand-200 px-3 py-1.5 rounded-lg border border-sand-300 text-xs font-semibold text-charcoal">
            Total Claims: <strong className="text-olive">{claims.length}</strong>
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
            placeholder="Search by claimant, item, email..."
            className="w-full bg-sand-100 pl-9 pr-3 py-2 rounded-xl border border-sand-300 text-xs text-charcoal focus:outline-none focus:border-terracotta"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-sand-100 border border-sand-300 rounded-xl px-3 py-2 text-xs text-charcoal font-medium focus:outline-none w-full sm:w-auto"
        >
          <option value="All">All Claim Statuses</option>
          <option value="pending">Pending Review</option>
          <option value="under_review">Under Review</option>
          <option value="approved">Approved & Returned</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Claims Table */}
      {filteredClaims.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="No claims match criteria"
          description="Try broadening your search or filter options."
        />
      ) : (
        <div className="card-warm overflow-hidden bg-cream-50 border-sand-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-sand-200/80 text-olive uppercase tracking-wider text-[10px] font-bold border-b border-sand-300">
                <tr>
                  <th className="py-3 px-4">Claim ID & Item</th>
                  <th className="py-3 px-4">Claimant Information</th>
                  <th className="py-3 px-4">Submitted Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Custody Notes</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-200/80">
                {filteredClaims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-sand-100/60 transition">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-olive truncate max-w-[200px]">{claim.itemTitle}</p>
                      <span className="text-[10px] text-charcoal-muted font-mono">{claim.id} (Item #{claim.itemId})</span>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-medium text-charcoal">{claim.claimantName}</p>
                      <p className="text-[10px] text-charcoal-muted truncate max-w-[150px]">{claim.claimantEmail}</p>
                    </td>

                    <td className="py-3 px-4 text-charcoal font-medium">
                      {claim.submittedAt ? new Date(claim.submittedAt).toLocaleDateString() : 'Recent'}
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={claim.status} />
                    </td>

                    <td className="py-3 px-4 text-charcoal-light truncate max-w-[180px]">
                      {claim.adminNotes || 'Awaiting initial inspection'}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => openReview(claim)}
                        className="btn-terracotta px-3 py-1.5 text-xs font-semibold shadow-sm inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Examine
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {selectedClaim && (
        <Modal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          title={`Ownership Claim Verification: #${selectedClaim.id}`}
        >
          <div className="space-y-4">
            
            <div className="p-3 bg-sand-100 rounded-xl space-y-1 text-xs">
              <span className="font-bold text-olive block">Item Claimed:</span>
              <p className="font-semibold text-charcoal">{selectedClaim.itemTitle}</p>
              <span className="text-[11px] text-charcoal-muted">Case #{selectedClaim.itemId}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs p-3 bg-cream-50 border border-sand-300 rounded-xl">
              <div>
                <span className="text-charcoal-muted block">Claimant:</span>
                <span className="font-semibold text-olive">{selectedClaim.claimantName}</span>
                <p className="text-[11px] text-charcoal-muted">{selectedClaim.claimantEmail}</p>
              </div>
              <div>
                <span className="text-charcoal-muted block">Phone:</span>
                <span className="font-semibold">{selectedClaim.claimantPhone || 'Not provided'}</span>
              </div>
            </div>

            <div className="p-3 bg-terracotta-subtle border border-terracotta/30 rounded-xl space-y-1 text-xs">
              <span className="font-bold text-terracotta flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Submitted Proof of Ownership:
              </span>
              <p className="text-charcoal leading-relaxed">{selectedClaim.proofDescription}</p>
            </div>

            {selectedClaim.proofImages && selectedClaim.proofImages.length > 0 && (
              <div>
                <span className="text-xs font-bold text-olive block mb-1">Attached Proof Document:</span>
                <img
                  src={selectedClaim.proofImages[0]}
                  alt="Proof document"
                  className="w-32 h-32 rounded-xl object-cover border border-sand-300"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-olive mb-1">
                Custody Reviewer Notes & Decision Rationale
              </label>
              <textarea
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Log physical inspection notes, ID verification details, or reason for denial..."
                className="w-full bg-sand-50 border border-sand-300 rounded-xl p-2.5 text-xs text-charcoal focus:outline-none focus:border-terracotta"
              />
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-sand-200">
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-sand-300 text-xs font-semibold text-charcoal hover:bg-sand-200"
              >
                Close
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleReject}
                  className="px-4 py-2 rounded-lg border border-rose-300 bg-rose-50 text-rose-800 text-xs font-semibold hover:bg-rose-100"
                >
                  Deny Claim
                </button>
                <button
                  type="button"
                  onClick={handleApprove}
                  className="btn-olive px-5 py-2 text-xs font-semibold shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Approve & Release
                </button>
              </div>
            </div>

          </div>
        </Modal>
      )}

    </div>
  );
};
