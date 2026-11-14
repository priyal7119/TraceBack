import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  ArrowRight, 
  MapPin, 
  Calendar,
  Layers,
  Check
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { FALLBACK_ITEM_IMAGE } from '../../utils/safeData';

export const ManageMatches = () => {
  const { matches, updateMatchStatus } = useData();

  const [selectedConfidence, setSelectedConfidence] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [inspectMatch, setInspectMatch] = useState(null);

  const filteredMatches = matches.filter(m => {
    if (selectedConfidence !== 'All' && m.confidence !== selectedConfidence) return false;
    if (selectedStatus !== 'All' && m.status !== selectedStatus) return false;
    return true;
  });

  const handleConfirmMatch = (matchId) => {
    updateMatchStatus(matchId, 'confirmed');
  };

  const handleDismissMatch = (matchId) => {
    updateMatchStatus(matchId, 'dismissed');
  };

  const openInspect = (match) => {
    setInspectMatch(match);
    setInspectModalOpen(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-terracotta uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Rekognition Inference Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-olive">
            Manage Matches
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-light">
            Audit automatic computer vision pairings, override false positives, and verify custodial matches.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-sand-200 px-3 py-1.5 rounded-lg border border-sand-300 text-xs font-semibold text-charcoal">
            System Matches: <strong className="text-terracotta">{matches.length}</strong>
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card-warm p-4 bg-cream-50 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-olive">
          <Layers className="w-4 h-4 text-terracotta" />
          <span>Active Match Ledgers</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedConfidence}
            onChange={(e) => setSelectedConfidence(e.target.value)}
            className="bg-sand-100 border border-sand-300 rounded-xl px-3 py-2 text-xs text-charcoal font-medium focus:outline-none flex-1 sm:flex-initial"
          >
            <option value="All">All Confidence Tiers</option>
            <option value="High">High Confidence (&gt;90%)</option>
            <option value="Medium">Medium Confidence (75-89%)</option>
            <option value="Low">Low / Exploratory (&lt;75%)</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-sand-100 border border-sand-300 rounded-xl px-3 py-2 text-xs text-charcoal font-medium focus:outline-none flex-1 sm:flex-initial"
          >
            <option value="All">All Statuses</option>
            <option value="suggested">Suggested</option>
            <option value="reviewed">Reviewed</option>
            <option value="claim_submitted">Claim Submitted</option>
            <option value="confirmed">Confirmed</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>
      </div>

      {/* Match Cards List */}
      {filteredMatches.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No matches found"
          description="Try selecting a different confidence tier or status."
        />
      ) : (
        <div className="space-y-4">
          {filteredMatches.map((m) => (
            <div key={m.id} className="card-warm p-5 bg-cream-50 space-y-4 border-sand-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-sand-200">
                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1.5 rounded-xl font-bold text-sm ${
                    m.overallScore >= 90
                      ? 'bg-terracotta text-white'
                      : m.overallScore >= 75
                      ? 'bg-olive text-white'
                      : 'bg-sand-200 text-charcoal'
                  }`}>
                    {m.overallScore}% Similarity
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-olive text-sm">Match Record #{m.id}</span>
                      <StatusBadge status={m.status} />
                    </div>
                    <span className="text-[11px] text-charcoal-muted">
                      Visual Score: {m.visualSimilarity}% • Spatial Radius: {m.aiComparison?.locationDistanceKm || 0.4} km
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openInspect(m)}
                    className="p-1.5 rounded-lg border border-sand-300 text-charcoal hover:bg-sand-200 text-xs font-semibold flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5 text-olive" />
                    <span>Compare</span>
                  </button>

                  {m.status !== 'confirmed' && (
                    <button
                      onClick={() => handleConfirmMatch(m.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirm</span>
                    </button>
                  )}

                  {m.status !== 'dismissed' && (
                    <button
                      onClick={() => handleDismissMatch(m.id)}
                      className="px-2.5 py-1.5 rounded-lg border border-sand-300 text-charcoal hover:bg-rose-50 hover:text-rose-700 text-xs font-semibold transition"
                    >
                      Dismiss
                    </button>
                  )}
                </div>
              </div>

              {/* Pair Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-sand-100 rounded-xl flex items-center gap-3">
                  <img
                    src={m.lostItem?.images?.[0] || m.lostItem?.image || FALLBACK_ITEM_IMAGE}
                    alt={m.lostItem?.title || 'Lost item'}
                    onError={(e) => { e.target.src = FALLBACK_ITEM_IMAGE; }}
                    className="w-14 h-14 rounded-lg object-cover border border-sand-300 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-terracotta uppercase">Reported Lost</span>
                    <h4 className="font-semibold text-olive text-xs truncate">{m.lostItem?.title || 'Reported Lost'}</h4>
                    <p className="text-[11px] text-charcoal-muted truncate">{m.lostItem?.location || 'HAMC Campus'}</p>
                  </div>
                </div>

                <div className="p-3 bg-sand-100 rounded-xl flex items-center gap-3">
                  <img
                    src={m.foundItem?.images?.[0] || m.foundItem?.image || FALLBACK_ITEM_IMAGE}
                    alt={m.foundItem?.title || 'Found item'}
                    onError={(e) => { e.target.src = FALLBACK_ITEM_IMAGE; }}
                    className="w-14 h-14 rounded-lg object-cover border border-sand-300 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-olive uppercase">Found in Custody</span>
                    <h4 className="font-semibold text-olive text-xs truncate">{m.foundItem?.title || 'Found Custody Item'}</h4>
                    <p className="text-[11px] text-charcoal-muted truncate">{m.foundItem?.storageLocation || m.foundItem?.location || 'Custody'}</p>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-charcoal-muted flex items-center gap-1.5 pt-1">
                <Sparkles className="w-3.5 h-3.5 text-terracotta" />
                <span>{m.aiComparison?.rekognitionInsights || 'Amazon Rekognition matching analysis completed.'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inspect Modal */}
      {inspectMatch && (
        <Modal
          isOpen={inspectModalOpen}
          onClose={() => setInspectModalOpen(false)}
          title={`Detailed Match Comparison: #${inspectMatch.id}`}
        >
          <div className="space-y-4">
            <div className="p-3 bg-sand-100 rounded-xl flex justify-between items-center text-xs">
              <span className="font-bold text-olive">Overall Match: {inspectMatch.overallScore}%</span>
              <StatusBadge status={inspectMatch.status} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-xs font-bold text-terracotta uppercase">Lost Report</span>
                <img
                  src={inspectMatch.lostItem?.images?.[0] || inspectMatch.lostItem?.image || FALLBACK_ITEM_IMAGE}
                  alt="Lost"
                  onError={(e) => { e.target.src = FALLBACK_ITEM_IMAGE; }}
                  className="w-full aspect-square rounded-xl object-cover border border-sand-300"
                />
                <p className="font-semibold text-olive text-xs">{inspectMatch.lostItem?.title || 'Lost Item'}</p>
                <p className="text-[11px] text-charcoal-muted">{inspectMatch.lostItem?.description || 'No description'}</p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-olive uppercase">Found Report</span>
                <img
                  src={inspectMatch.foundItem?.images?.[0] || inspectMatch.foundItem?.image || FALLBACK_ITEM_IMAGE}
                  alt="Found"
                  onError={(e) => { e.target.src = FALLBACK_ITEM_IMAGE; }}
                  className="w-full aspect-square rounded-xl object-cover border border-sand-300"
                />
                <p className="font-semibold text-olive text-xs">{inspectMatch.foundItem?.title || 'Found Item'}</p>
                <p className="text-[11px] text-charcoal-muted">{inspectMatch.foundItem?.description || 'No description'}</p>
              </div>
            </div>

            <div className="p-3 bg-cream-50 border border-sand-300 rounded-xl text-xs space-y-1">
              <span className="font-bold text-olive block">Rekognition Model Overlap:</span>
              <p className="text-charcoal-light">{inspectMatch.aiComparison?.rekognitionInsights}</p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-sand-200">
              <button
                onClick={() => setInspectModalOpen(false)}
                className="btn-terracotta px-4 py-2 text-xs font-semibold"
              >
                Close Audit
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
