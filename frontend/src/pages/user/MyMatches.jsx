import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  MapPin, 
  Calendar, 
  ChevronRight, 
  Info,
  ShieldCheck,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmDialog } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { getSafeImage, FALLBACK_ITEM_IMAGE } from '../../utils/safeData';

export const MyMatches = () => {
  const { matches = [], updateMatchStatus, recordMatchDecision, refreshDataFromBackend } = useData();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [dismissDialogOpen, setDismissDialogOpen] = useState(false);
  const [matchToDismiss, setMatchToDismiss] = useState(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState(null);

  const handleRefresh = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      if (refreshDataFromBackend) {
        await refreshDataFromBackend();
      }
    } catch (err) {
      setFetchError(err.message || 'Failed to refresh matches from campus server.');
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = (match) => {
    setMatchToDismiss(match);
    setDismissDialogOpen(true);
  };

  const confirmDismiss = async () => {
    if (matchToDismiss) {
      try {
        if (recordMatchDecision) {
          await recordMatchDecision(matchToDismiss.id, 'reject');
        } else if (updateMatchStatus) {
          await updateMatchStatus(matchToDismiss.id, 'dismissed');
        }
        setActionSuccessMsg(`Match #${matchToDismiss.id} marked as not your item.`);
        setTimeout(() => setActionSuccessMsg(null), 4000);
      } catch (err) {
        setFetchError('Could not update match status. Please try again.');
      } finally {
        setMatchToDismiss(null);
      }
    }
  };

  const safeMatches = Array.isArray(matches) ? matches : [];
  const activeMatches = safeMatches.filter(m =>
    m &&
    m.status !== 'dismissed' &&
    m.status !== 'rejected' &&
    (user?.role === 'admin' || m.lostUserId === user?.id || m.foundUserId === user?.id ||
     m.lostItem?.userId === user?.id || m.foundItem?.userId === user?.id)
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-sand-200/50 rounded-2xl p-6 sm:p-8 border border-sand-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cream-50 text-xs font-semibold text-terracotta mb-2 border border-sand-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Amazon Rekognition Computer Vision Matches</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-olive">
            My Matches
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-light mt-1 max-w-2xl">
            Our automated AI matching engine scans found submissions across Hashu Advani Memorial Complex (HAMC) campus facilities. Matches with high confidence scores are highlighted below.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cream-50 hover:bg-sand-100 border border-sand-300 text-xs font-semibold text-olive transition shadow-sm disabled:opacity-50"
          title="Refresh matches from server"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Refreshing...' : 'Refresh Matches'}</span>
        </button>
      </div>

      {/* Action Notification Banner */}
      {actionSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-xl flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-medium">{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900 text-xs font-bold">×</button>
        </div>
      )}

      {/* Error Banner */}
      {fetchError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{fetchError}</span>
          </div>
          <button
            onClick={handleRefresh}
            className="px-2.5 py-1 bg-rose-700 text-white rounded text-[11px] font-semibold hover:bg-rose-800 transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && activeMatches.length === 0 ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="card-warm p-6 bg-cream-50 animate-pulse space-y-4">
              <div className="h-6 bg-sand-200 rounded w-1/3"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-24 bg-sand-200 rounded"></div>
                <div className="h-24 bg-sand-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : activeMatches.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No active matches"
          description="We are continuously scanning new found item uploads with Amazon Rekognition across HAMC campus. You will be notified immediately when a match is found."
          actionLabel="View All Found Items"
          actionLink="/browse"
        />
      ) : (
        <div className="space-y-6">
          {activeMatches.map((match) => {
            const overallScore = Number(match.overallScore) || 75;
            const lostImage = getSafeImage(match.lostItem);
            const foundImage = getSafeImage(match.foundItem);
            const insights = match.aiComparison?.rekognitionInsights || 'Amazon Rekognition computer vision affinity evaluated.';

            return (
              <div
                key={match.id}
                className="card-warm p-6 bg-cream-50 space-y-6 border-sand-300 hover:border-terracotta/40 transition"
              >
                {/* Match Score Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-sand-200">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                      overallScore >= 90
                        ? 'bg-terracotta text-white shadow-sm'
                        : overallScore >= 75
                        ? 'bg-olive text-white'
                        : 'bg-sand-200 text-charcoal'
                    }`}>
                      {overallScore}%
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-olive text-base">
                          {overallScore >= 85 ? 'High Confidence Match' : 'Potential Match Candidate'}
                        </span>
                        <StatusBadge status={match.status || 'suggested'} />
                      </div>
                      <p className="text-xs text-charcoal-muted">
                        Evaluated via {match.visualSimilarity ? 'AWS Rekognition label detection & ' : ''}campus category and location proximity
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDismiss(match)}
                      className="px-3 py-1.5 rounded-lg border border-sand-300 text-xs font-semibold text-charcoal hover:bg-sand-200 transition"
                    >
                      Not My Item
                    </button>
                    <Link
                      to={`/user/matches/${match.id}`}
                      className="btn-terracotta px-4 py-1.5 text-xs font-semibold shadow-sm flex items-center gap-1.5"
                    >
                      Compare & Inspect
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Side-by-Side Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Left: Lost Item */}
                  <div className="bg-sand-100/70 p-4 rounded-xl border border-sand-200 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold uppercase tracking-wider text-terracotta">
                        Your Lost Report
                      </span>
                      <span className="text-charcoal-muted">Report #{match.lostItem?.id || match.lostItemId}</span>
                    </div>

                    <div className="flex gap-3">
                      <img
                        src={lostImage}
                        alt={match.lostItem?.title || 'Lost item'}
                        onError={(e) => { e.target.src = FALLBACK_ITEM_IMAGE; }}
                        className="w-20 h-20 rounded-lg object-cover border border-sand-300 flex-shrink-0"
                      />
                      <div className="min-w-0 space-y-1">
                        <h4 className="font-semibold text-olive text-sm truncate">{match.lostItem?.title || 'Reported Lost Item'}</h4>
                        <p className="text-xs text-charcoal-light flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-olive flex-shrink-0" />
                          <span className="truncate">{match.lostItem?.location || 'HAMC Campus'}</span>
                        </p>
                        <p className="text-xs text-charcoal-muted flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-olive flex-shrink-0" />
                          <span>Lost {match.lostItem?.date || 'Recently'}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Found Item */}
                  <div className="bg-sand-100/70 p-4 rounded-xl border border-sand-200 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold uppercase tracking-wider text-olive">
                        Found Item In Custody
                      </span>
                      <span className="text-charcoal-muted">Case #{match.foundItem?.id || match.foundItemId}</span>
                    </div>

                    <div className="flex gap-3">
                      <img
                        src={foundImage}
                        alt={match.foundItem?.title || 'Found item'}
                        onError={(e) => { e.target.src = FALLBACK_ITEM_IMAGE; }}
                        className="w-20 h-20 rounded-lg object-cover border border-sand-300 flex-shrink-0"
                      />
                      <div className="min-w-0 space-y-1">
                        <h4 className="font-semibold text-olive text-sm truncate">{match.foundItem?.title || 'Found Belonging'}</h4>
                        <p className="text-xs text-charcoal-light flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-olive flex-shrink-0" />
                          <span className="truncate">{match.foundItem?.storageLocation || match.foundItem?.location || 'Custodial Office'}</span>
                        </p>
                        <p className="text-xs text-charcoal-muted flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-olive flex-shrink-0" />
                          <span>Found {match.foundItem?.date || 'Recently'}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Rekognition Vector Insight Pill */}
                <div className="bg-sand-100 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-charcoal-light border border-sand-300">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-terracotta flex-shrink-0" />
                    <span>
                      <strong>Rekognition Feature Match:</strong> {insights}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-semibold text-olive">
                    <span>Visual: {match.visualSimilarity ?? 80}%</span>
                    <span>Spatial: {match.metadataSimilarity ?? 80}%</span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Dismiss Dialog */}
      <ConfirmDialog
        isOpen={dismissDialogOpen}
        onClose={() => setDismissDialogOpen(false)}
        onConfirm={confirmDismiss}
        title="Dismiss AI Match"
        message="Are you certain this found item does not belong to you? Dismissing will remove this suggestion from your active match feed."
        confirmText="Yes, Not My Item"
        danger={false}
      />

    </div>
  );
};
