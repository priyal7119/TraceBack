import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Share2, 
  Building2, 
  Tag, 
  Lock,
  UploadCloud
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { getSafeImage, FALLBACK_ITEM_IMAGE } from '../../utils/safeData';
import api from '../../services/api';

export const ItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { items, submitClaim } = useData();
  const { user } = useAuth();

  const [fetchedItem, setFetchedItem] = useState(null);

  useEffect(() => {
    if (id && !items.find(i => i.id === id)) {
      api.get(`/reports/${id}`)
        .then(res => {
          if (res.data?.report) {
            setFetchedItem(res.data.report);
          }
        })
        .catch(() => {});
    }
  }, [id, items]);

  const item = items.find(i => i.id === id) || fetchedItem || items[0];
  const itemImages = Array.isArray(item?.images) && item.images.length > 0 ? item.images : [getSafeImage(item)];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [claimSubmittedSuccess, setClaimSubmittedSuccess] = useState(false);

  // Claim Form State
  const [claimantName, setClaimantName] = useState(user?.name || '');
  const [claimantEmail, setClaimantEmail] = useState(user?.email || '');
  const [claimantPhone, setClaimantPhone] = useState(user?.phone || '');
  const [proofDescription, setProofDescription] = useState('');
  const [proofFileUploaded, setProofFileUploaded] = useState(false);

  const handleClaimSubmit = (e) => {
    e.preventDefault();
    submitClaim({
      itemId: item.id,
      itemTitle: item.title,
      claimantId: user?.id || 'usr_guest',
      claimantName,
      claimantEmail,
      claimantPhone,
      proofDescription,
      proofImages: proofFileUploaded 
        ? ['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=400&q=80'] 
        : []
    });

    setClaimSubmittedSuccess(true);
    setTimeout(() => {
      setClaimSubmittedSuccess(false);
      setClaimModalOpen(false);
      navigate('/user/reports');
    }, 2000);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  if (!item) {
    return (
      <div className="w-full px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-olive">Item Not Found</h2>
        <p className="text-sm text-charcoal-light">The item you are looking for may have been archived or removed from HAMC custody.</p>
        <Link to="/browse" className="btn-terracotta px-6 py-2.5 text-sm">Return to Browse</Link>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8 space-y-8 overflow-x-hidden">
      
      {/* Top Breadcrumb & Share */}
      <div className="flex items-center justify-between">
        <Link
          to="/browse"
          className="inline-flex items-center gap-2 text-sm font-semibold text-charcoal hover:text-terracotta transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Found Items
        </Link>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-sand-300 bg-cream-50 text-xs font-semibold text-charcoal hover:bg-sand-200 transition"
        >
          <Share2 className="w-3.5 h-3.5 text-olive" />
          Share Listing
        </button>
      </div>

      {/* Main Details Grid - Full width */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 w-full">
        
        {/* Left: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-square sm:aspect-[4/3] rounded-2xl overflow-hidden bg-sand-200 border border-sand-300 shadow-warm">
            <img
              src={itemImages[activeImageIndex] || itemImages[0]}
              alt={item.title || 'Campus item'}
              onError={(e) => {
                if (e.target.src !== FALLBACK_ITEM_IMAGE) {
                  e.target.src = FALLBACK_ITEM_IMAGE;
                }
              }}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <StatusBadge status={item.status} />
            </div>
            <div className="absolute bottom-4 right-4 bg-charcoal/80 backdrop-blur text-cream-100 text-xs px-3 py-1 rounded-lg flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-terracotta" />
              <span>Rekognition Confidence: {item.rekognitionConfidence}%</span>
            </div>
          </div>

          {/* Thumbnails */}
          {itemImages.length > 1 && (
            <div className="flex gap-3">
              {itemImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition ${
                    activeImageIndex === idx ? 'border-terracotta ring-2 ring-terracotta/30' : 'border-sand-300 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt="Thumb"
                    onError={(e) => {
                      if (e.target.src !== FALLBACK_ITEM_IMAGE) {
                        e.target.src = FALLBACK_ITEM_IMAGE;
                      }
                    }}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* AI Rekognition Visual Analysis Card */}
          <div className="card-warm p-5 bg-sand-100/70 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-sand-300">
              <span className="text-xs font-bold uppercase tracking-wider text-olive flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-terracotta" />
                Amazon Rekognition Vision Labels
              </span>
              <span className="text-[11px] text-charcoal-muted font-medium">AWS ML Pipeline v2.4</span>
            </div>
            <p className="text-xs text-charcoal-light">
              Visual traits extracted automatically by AWS Rekognition to assist campus matching:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {item.aiTags?.map((tag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-cream-50 border border-sand-300 text-xs font-semibold text-olive"
                >
                  <Tag className="w-3 h-3 text-terracotta" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Item Metadata & Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="card-warm p-6 sm:p-8 bg-cream-50 space-y-6">
            
            <div>
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-charcoal-muted mb-1">
                <span>{item.category}</span>
                <span className="text-olive">HAMC Case #{item.id}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-olive">
                {item.title}
              </h1>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-muted">
                Description & Condition
              </h4>
              <p className="text-sm text-charcoal-light leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Specs Table */}
            <div className="space-y-3 pt-3 border-t border-sand-200 text-xs text-charcoal">
              <div className="flex items-center justify-between py-1 border-b border-sand-200/60">
                <span className="text-charcoal-muted flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-olive" />
                  Found Spot:
                </span>
                <span className="font-semibold text-right">{item.location}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-sand-200/60">
                <span className="text-charcoal-muted flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-olive" />
                  Date Recovered:
                </span>
                <span className="font-semibold">{item.date}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-sand-200/60">
                <span className="text-charcoal-muted flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-olive" />
                  Time Recovered:
                </span>
                <span className="font-semibold">{item.time}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-sand-200/60">
                <span className="text-charcoal-muted">Brand / Model:</span>
                <span className="font-semibold">{item.brand || 'Unbranded / Unknown'}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-sand-200/60">
                <span className="text-charcoal-muted">Color Palette:</span>
                <span className="font-semibold">{item.primaryColor || 'Multi'}</span>
              </div>

              <div className="flex items-start justify-between py-1 border-b border-sand-200/60">
                <span className="text-charcoal-muted flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-olive" />
                  Custody Location:
                </span>
                <span className="font-semibold text-right max-w-[220px] text-olive">
                  {item.storageLocation || 'HAMC Main Gate Security Desk'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 space-y-3">
              <button
                onClick={() => setClaimModalOpen(true)}
                disabled={item.status === 'resolved'}
                className="w-full btn-terracotta py-3.5 text-sm font-semibold shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                {item.status === 'resolved' ? 'Item Already Returned to Owner' : 'This Belongs to Me — File Claim'}
              </button>

              <Link
                to="/user/report-lost"
                className="w-full btn-secondary py-3 text-xs font-semibold flex items-center justify-center"
              >
                Report Similar Lost Belonging at HAMC
              </Link>
            </div>

            {/* Security Guarantee Note */}
            <div className="p-3 bg-sand-100 rounded-xl flex items-start gap-2.5 text-xs text-charcoal-light border border-sand-300">
              <Lock className="w-4 h-4 text-terracotta flex-shrink-0 mt-0.5" />
              <span>
                To prevent fraud, items held at HAMC are released only after claimant provides undisclosed proof (e.g., student ID, roll number, matching wallpaper, or unique marks).
              </span>
            </div>

          </div>
        </div>

      </div>

      {/* Claim Submission Modal */}
      <Modal
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        title={`File Ownership Claim: ${item.title}`}
      >
        {claimSubmittedSuccess ? (
          <div className="text-center py-8 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
            <h3 className="text-lg font-bold text-olive">Claim Successfully Submitted!</h3>
            <p className="text-xs text-charcoal-light max-w-sm mx-auto">
              Campus custodians at {item.storageLocation} will review your proof. You will receive an alert once verified for pickup.
            </p>
          </div>
        ) : (
          <form onSubmit={handleClaimSubmit} className="space-y-4">
            <div className="bg-sand-100 p-3 rounded-xl text-xs text-charcoal-light flex items-center gap-2 border border-sand-200">
              <AlertCircle className="w-4 h-4 text-terracotta flex-shrink-0" />
              <span>Please describe private details NOT shown in the public listing (e.g. roll number, scratch, serial number, internal photo).</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-olive mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={claimantName}
                  onChange={(e) => setClaimantName(e.target.value)}
                  className="w-full bg-sand-50 border border-sand-300 rounded-lg p-2.5 text-xs text-charcoal focus:outline-none focus:border-terracotta"
                  placeholder="e.g. Aarav Sharma"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-olive mb-1">Campus Email</label>
                <input
                  type="email"
                  required
                  value={claimantEmail}
                  onChange={(e) => setClaimantEmail(e.target.value)}
                  className="w-full bg-sand-50 border border-sand-300 rounded-lg p-2.5 text-xs text-charcoal focus:outline-none focus:border-terracotta"
                  placeholder="name@campus.ves.ac.in"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-olive mb-1">Mobile Number</label>
              <input
                type="tel"
                value={claimantPhone}
                onChange={(e) => setClaimantPhone(e.target.value)}
                className="w-full bg-sand-50 border border-sand-300 rounded-lg p-2.5 text-xs text-charcoal focus:outline-none focus:border-terracotta"
                placeholder="+91 98201 23456"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-olive mb-1">
                Proof of Ownership / Distinctive Markers
              </label>
              <textarea
                required
                rows={3}
                value={proofDescription}
                onChange={(e) => setProofDescription(e.target.value)}
                placeholder="State serial numbers, wallpaper photo, unique stickers, roll number label, or specific contents..."
                className="w-full bg-sand-50 border border-sand-300 rounded-lg p-2.5 text-xs text-charcoal focus:outline-none focus:border-terracotta"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-olive mb-1">
                Supporting Photo / ID Card (Optional)
              </label>
              <div 
                onClick={() => setProofFileUploaded(!proofFileUploaded)}
                className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition ${
                  proofFileUploaded ? 'bg-emerald-50 border-emerald-400 text-emerald-800' : 'bg-sand-100 border-sand-300 text-charcoal-muted hover:border-terracotta'
                }`}
              >
                <UploadCloud className="w-5 h-5 mx-auto mb-1 text-terracotta" />
                <span className="text-xs font-medium">
                  {proofFileUploaded ? '✓ Proof file attached (campus_id_proof.jpg)' : 'Click to attach photo of ID card, bill, or item'}
                </span>
              </div>
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
                Submit Claim for Verification
              </button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
};
