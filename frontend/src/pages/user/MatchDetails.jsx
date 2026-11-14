import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowLeft, 
  ShieldCheck, 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  Clock, 
  Tag, 
  Info, 
  Check, 
  XCircle,
  Building2,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { getSafeImage, FALLBACK_ITEM_IMAGE } from '../../utils/safeData';

export const MatchDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { matches = [], submitClaim, recordMatchDecision, updateMatchStatus } = useData();
  const { user } = useAuth();

  const safeMatches = Array.isArray(matches) ? matches : [];
  const match = safeMatches.find(m => m && m.id === id) || safeMatches[0];

  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [claimSubmitted, setClaimSubmitted] = useState(false);
  const [proofNote, setProofNote] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  if (!match) {
    return (
      <div className="card-warm p-10 text-center space-y-4 max-w-lg mx-auto my-12">
        <Sparkles className="w-12 h-12 text-terracotta mx-auto opacity-70" />
        <h2 className="text-xl font-bold text-olive">Match Not Found</h2>
        <p className="text-xs text-charcoal-muted">This match record might have been resolved or does not exist.</p>
        <Link to="/user/matches" className="btn-terracotta px-4 py-2 text-xs font-semibold inline-block">
          Return to My Matches
        </Link>
      </div>
    );
  }

  const lostItem = match.lostItem;
  const foundItem = match.foundItem;
  const aiComparison = match.aiComparison || {};

  const lostImage = getSafeImage(lostItem);
  const foundImage = getSafeImage(foundItem);
  const overallScore = Number(match.overallScore) || 75;

  const handleDecision = async (decision) => {
    try {
      if (recordMatchDecision) {
        await recordMatchDecision(match.id, decision);
      } else if (updateMatchStatus) {
        await updateMatchStatus(match.id, decision === 'accept' ? 'accepted' : 'rejected');
      }
      setFeedbackMsg(`Match successfully ${decision === 'accept' ? 'accepted' : 'declined'}.`);
      setTimeout(() => {
        navigate('/user/matches');
      }, 1500);
    } catch (err) {
      setFeedbackMsg('Action could not be completed. Please try again.');
    }
  };

  const handleClaimSubmit = (e) => {
    e.preventDefault();
    if (submitClaim) {
      submitClaim({
        itemId: foundItem?.id,
        itemTitle: foundItem?.title,
        claimantId: user?.id,
        claimantName: user?.name || 'Campus Student',
        claimantEmail: user?.email || '',
        claimantPhone: user?.phone || '',
        proofDescription: proofNote || 'Claim initiated from Match Comparison screen.',
        proofImages: []
      });
    }

    setClaimSubmitted(true);
    setTimeout(() => {
      setClaimSubmitted(false);
      setClaimModalOpen(false);
      navigate('/user/reports');
    }, 1500);
  };

  return (
    <div className="w-full space-y-8">
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/user/matches"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal hover:text-terracotta transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Matches
        </Link>

        <span className="text-xs font-semibold text-charcoal-muted">
          AI Analysis Case #{match.id}
        </span>
      </div>

      {feedbackMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-sand-200/60 rounded-3xl p-6 sm:p-8 border border-sand-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cream-50 text-xs font-semibold text-olive border border-sand-300">
            <Sparkles className="w-3.5 h-3.5 text-terracotta" />
            <span>Deep Visual Match Analysis</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-olive">
            Side-by-Side Verification
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-light max-w-xl">
            Amazon Rekognition evaluated geometric traits, color distribution, and loss radius across Hashu Advani Memorial Complex (HAMC) campus facilities.
          </p>
        </div>

        {/* Big Score Gauge */}
        <div className="bg-cream-50 px-6 py-4 rounded-2xl border border-sand-300 shadow-sm flex items-center gap-4">
          <div className={`w-16 h-16 rounded-full flex flex-col items-center justify-center font-bold text-xl shadow-sm text-white ${
            overallScore >= 90 ? 'bg-terracotta' : overallScore >= 75 ? 'bg-olive' : 'bg-sand-300 text-charcoal'
          }`}>
            <span>{overallScore}%</span>
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-olive block">
              Confidence Score
            </span>
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {overallScore >= 85 ? 'High Confidence Match' : 'Potential Match Candidate'}
            </span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left: Your Lost Report */}
        <div className="card-warm p-6 bg-cream-50 space-y-4 border-2 border-sand-300">
          <div className="flex items-center justify-between pb-3 border-b border-sand-200">
            <span className="text-xs font-bold uppercase tracking-wider text-terracotta">
              Your Lost Report
            </span>
            <span className="text-xs text-charcoal-muted">ID: {lostItem?.id || match.lostItemId}</span>
          </div>

          <div className="aspect-square rounded-2xl overflow-hidden bg-sand-200 border border-sand-300">
            <img
              src={lostImage}
              alt={lostItem?.title || 'Lost item'}
              onError={(e) => { e.target.src = FALLBACK_ITEM_IMAGE; }}
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <span className="text-[10px] font-bold text-charcoal-muted uppercase">{lostItem?.category || 'Category'}</span>
            <h3 className="text-xl font-bold text-olive">{lostItem?.title || 'Reported Lost Item'}</h3>
            <p className="text-xs text-charcoal-light mt-1">{lostItem?.description || 'No description provided.'}</p>
          </div>

          <div className="space-y-2 pt-3 border-t border-sand-200 text-xs">
            <div className="flex justify-between py-1 border-b border-sand-200/50">
              <span className="text-charcoal-muted">Location Lost:</span>
              <span className="font-semibold text-right">{lostItem?.location || 'HAMC Campus'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-sand-200/50">
              <span className="text-charcoal-muted">Date & Time:</span>
              <span className="font-semibold">{lostItem?.date || 'Recent'} at {lostItem?.time || '12:00'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-sand-200/50">
              <span className="text-charcoal-muted">Reported Brand:</span>
              <span className="font-semibold">{lostItem?.brand || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-charcoal-muted">Private Mark:</span>
              <span className="font-semibold text-terracotta">
                {lostItem?.serialOrDistinctiveFeature || lostItem?.distinctFeatures || 'No distinct marks'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Found Item in Custody */}
        <div className="card-warm p-6 bg-cream-50 space-y-4 border-2 border-terracotta/40 shadow-warm">
          <div className="flex items-center justify-between pb-3 border-b border-sand-200">
            <span className="text-xs font-bold uppercase tracking-wider text-olive">
              Found Item (Custody)
            </span>
            <StatusBadge status={foundItem?.status || 'active'} />
          </div>

          <div className="aspect-square rounded-2xl overflow-hidden bg-sand-200 border border-sand-300">
            <img
              src={foundImage}
              alt={foundItem?.title || 'Found item'}
              onError={(e) => { e.target.src = FALLBACK_ITEM_IMAGE; }}
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <span className="text-[10px] font-bold text-charcoal-muted uppercase">{foundItem?.category || 'Category'}</span>
            <h3 className="text-xl font-bold text-olive">{foundItem?.title || 'Found Item'}</h3>
            <p className="text-xs text-charcoal-light mt-1">{foundItem?.description || 'No description provided.'}</p>
          </div>

          <div className="space-y-2 pt-3 border-t border-sand-200 text-xs">
            <div className="flex justify-between py-1 border-b border-sand-200/50">
              <span className="text-charcoal-muted">Location Found:</span>
              <span className="font-semibold text-right">{foundItem?.location || 'HAMC Campus'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-sand-200/50">
              <span className="text-charcoal-muted">Date & Time:</span>
              <span className="font-semibold">{foundItem?.date || 'Recent'} at {foundItem?.time || '12:00'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-sand-200/50">
              <span className="text-charcoal-muted">Reported Brand:</span>
              <span className="font-semibold">{foundItem?.brand || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-charcoal-muted">Custody Storage:</span>
              <span className="font-semibold text-olive">
                {foundItem?.storageLocation || foundItem?.location || 'Security Cabin'}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* AI Alignment Breakdown Matrix */}
      <div className="card-warm p-6 bg-cream-50 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-olive border-b border-sand-200 pb-2">
          Match Alignment & Attribute Breakdown
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-sand-100 rounded-xl space-y-1">
            <span className="text-xs text-charcoal-muted">Visual Feature Similarity</span>
            <p className="text-2xl font-bold text-olive">
              {match.visualSimilarity !== null && match.visualSimilarity !== undefined ? `${match.visualSimilarity}%` : 'N/A'}
            </p>
            <span className="text-[11px] text-charcoal-muted font-medium">
              {match.visualSimilarity !== null && match.visualSimilarity !== undefined ? 'Rekognition Label Overlap' : 'Visual Scan Unavailable'}
            </span>
          </div>

          <div className="p-4 bg-sand-100 rounded-xl space-y-1">
            <span className="text-xs text-charcoal-muted">Location Proximity</span>
            <p className="text-2xl font-bold text-olive">{aiComparison.locationDistanceKm ?? 0.05} km</p>
            <span className="text-[11px] text-emerald-700 font-semibold">HAMC Campus Complex</span>
          </div>

          <div className="p-4 bg-sand-100 rounded-xl space-y-1">
            <span className="text-xs text-charcoal-muted">Time Delta</span>
            <p className="text-2xl font-bold text-olive">{Math.round((aiComparison.timeDifferenceHours ?? 0.5) * 60)} mins</p>
            <span className="text-[11px] text-emerald-700 font-semibold">Reported within window</span>
          </div>
        </div>

        <div className="p-4 bg-sand-100/70 rounded-xl space-y-2 text-xs text-charcoal-light">
          <span className="font-bold text-olive block">Detected Rekognition Common Attributes:</span>
          <div className="flex flex-wrap gap-2">
            {Array.isArray(aiComparison.matchedLabels) && aiComparison.matchedLabels.length > 0 ? (
              aiComparison.matchedLabels.map((l, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-cream-50 border border-sand-300 font-medium text-olive">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  {l}
                </span>
              ))
            ) : (
              <span className="text-charcoal-muted italic">No visual label overlap detected (Metadata Candidate)</span>
            )}
          </div>
        </div>

        <div className="p-3 bg-cream-50 border border-sand-200 rounded-xl text-xs text-charcoal-muted">
          <strong className="text-olive">Inference Note: </strong>
          {aiComparison.rekognitionInsights || 'Automated comparison completed.'}
        </div>
      </div>

      {/* Verification Action Bar */}
      <div className="bg-sand-200/80 rounded-2xl p-6 border border-sand-300 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="text-lg font-bold text-olive">Does this look like your item?</h4>
          <p className="text-xs text-charcoal-light">
            Accepting the match or submitting a claim alerts campus custody officers to arrange verification and safe handover.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            onClick={() => handleDecision('reject')}
            className="px-3.5 py-2.5 rounded-xl border border-sand-300 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition"
          >
            Not My Item
          </button>
          <button
            onClick={() => handleDecision('accept')}
            className="px-4 py-2.5 rounded-xl bg-olive text-white hover:bg-olive-dark text-xs font-semibold shadow-sm transition"
          >
            Accept Match
          </button>
          <button
            onClick={() => setClaimModalOpen(true)}
            className="btn-terracotta px-5 py-2.5 text-xs font-semibold shadow-md flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            Claim Ownership
          </button>
        </div>
      </div>

      {/* Claim Modal */}
      <Modal
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        title="Confirm Ownership & Submit Claim"
      >
        {claimSubmitted ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
            <h3 className="text-lg font-bold text-olive">Claim Logged Successfully!</h3>
            <p className="text-xs text-charcoal-light">Redirecting to My Reports...</p>
          </div>
        ) : (
          <form onSubmit={handleClaimSubmit} className="space-y-4">
            <p className="text-xs text-charcoal-light leading-relaxed">
              Based on the <strong>{overallScore}% AI match</strong>, our system will link your lost report <strong>#{lostItem?.id || match.lostItemId}</strong> with custodial item <strong>#{foundItem?.id || match.foundItemId}</strong>.
            </p>

            <div>
              <label className="block text-xs font-semibold text-olive mb-1">
                Additional Note or Handover Preference for Custodian
              </label>
              <textarea
                rows={3}
                value={proofNote}
                onChange={(e) => setProofNote(e.target.value)}
                placeholder="e.g. I can pick this up tomorrow at 3 PM from the HAMC Main Gate Security Cabin with my VES college ID."
                className="w-full bg-sand-50 border border-sand-300 rounded-lg p-2.5 text-xs text-charcoal focus:outline-none focus:border-terracotta"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-sand-200">
              <button
                type="button"
                onClick={() => setClaimModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-sand-300 text-xs font-semibold text-charcoal hover:bg-sand-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-terracotta px-5 py-2 text-xs font-semibold"
              >
                Submit Official Claim
              </button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
};
