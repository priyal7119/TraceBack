import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  MapPin, 
  Calendar, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Info,
  Lock,
  Building2,
  AlertCircle
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { ImageUploader } from '../../components/forms/ImageUploader';

export const ReportLostItem = () => {
  const navigate = useNavigate();
  const { addReport } = useData();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [brand, setBrand] = useState('');
  const [primaryColor, setPrimaryColor] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('12:00');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('HAMC Chembur, Mumbai');
  const [description, setDescription] = useState('');
  const [distinctiveFeature, setDistinctiveFeature] = useState('');
  const [contactPreference, setContactPreference] = useState('in_app');
  const [images, setImages] = useState([]);
  const [aiDetectedTags, setAiDetectedTags] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const categories = [
    'Electronics',
    'Bags & Wallets',
    'Jewelry & Watches',
    'Keys & Cards',
    'Clothing & Lab Wear',
    'ID & Documents',
    'Stationery & Books',
    'Bottles & Flasks',
    'Eyewear & Accessories',
    'Sports & Fitness',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || isImageUploading) return;

    if (isImageUploading) {
      setSubmitError('Please wait for photos to finish uploading to Amazon S3.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const newReport = {
        type: 'lost',
        title: title.trim(),
        category,
        brand: brand.trim(),
        primaryColor: primaryColor.trim(),
        date,
        time,
        location: location.trim(),
        city: city || 'HAMC Chembur, Mumbai',
        description: description.trim(),
        serialOrDistinctiveFeature: distinctiveFeature.trim(),
        contactPreference,
        images: images.length > 0 ? images : [],
        imageKey: images.length > 0 ? images[0] : '',
        image: images.length > 0 ? images[0] : '',
        aiTags: aiDetectedTags.length > 0 ? aiDetectedTags : [],
        reportedBy: user || null,
      };

      const saved = await addReport(newReport);
      if (!saved || !saved.id) {
        throw new Error('Server did not return a confirmed report record.');
      }

      setIsSubmitting(false);
      setSuccess(true);

      setTimeout(() => {
        navigate('/user/reports');
      }, 1200);
    } catch (err) {
      console.error('Failed to submit lost report:', err);
      const apiErrors = err.response?.data?.errors;
      const apiMessage = err.response?.data?.message;
      let displayMsg = 'Report submission failed. Please verify required fields.';

      if (Array.isArray(apiErrors) && apiErrors.length > 0) {
        displayMsg = apiErrors.join('. ');
      } else if (apiMessage) {
        displayMsg = apiMessage;
      } else if (err.message) {
        displayMsg = err.message;
      }

      setSubmitError(displayMsg);
      setIsSubmitting(false);
      setSuccess(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-sand-200/50 rounded-2xl p-6 sm:p-8 border border-sand-300">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-terracotta-subtle text-xs font-semibold text-terracotta mb-2 border border-terracotta/20">
          <FileText className="w-3.5 h-3.5" />
          <span>HAMC Campus Missing Property Report</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-olive">
          Report a Lost Belonging
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-light mt-1">
          Specify where you were on campus (Central Library, Canteen, Quadrangle, Lab Complex, Main Gate). Our Amazon Rekognition pipeline will immediately scan existing found inventory.
        </p>
      </div>

      {success ? (
        <div className="card-warm p-10 bg-cream-50 text-center space-y-4">
          <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto animate-bounce" />
          <h2 className="text-xl font-bold text-olive">Report Successfully Filed!</h2>
          <p className="text-sm text-charcoal-light max-w-md mx-auto">
            Amazon Rekognition is comparing your item's features against active found reports at HAMC. Redirecting to your reports...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: Basic Information */}
          <div className="card-warm p-6 bg-cream-50 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-olive border-b border-sand-200 pb-2">
              1. Item Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-olive mb-1">
                  Item Name / Title *
                </label>
                <input
                  type="text"
                  required
                  minLength={3}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white border border-sand-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-charcoal focus:outline-none focus:border-terracotta"
                  placeholder="e.g. Casio fx-991CW ClassWiz Scientific Calculator"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-olive mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white border border-sand-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-charcoal focus:outline-none focus:border-terracotta"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-olive mb-1">
                  Brand / Manufacturer
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full bg-white border border-sand-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-charcoal focus:outline-none focus:border-terracotta"
                  placeholder="e.g. Casio, Apple, Titan, Wildcraft"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-olive mb-1">
                  Primary Color & Finish
                </label>
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-full bg-white border border-sand-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-charcoal focus:outline-none focus:border-terracotta"
                  placeholder="e.g. Matte Black with white keys"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-olive mb-1">
                  Contact Preference
                </label>
                <select
                  value={contactPreference}
                  onChange={(e) => setContactPreference(e.target.value)}
                  className="w-full bg-white border border-sand-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-charcoal focus:outline-none focus:border-terracotta"
                >
                  <option value="in_app">TraceBack In-App Notifications</option>
                  <option value="email">Campus Email Alerts</option>
                  <option value="phone">SMS Text Message</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-olive mb-1">
                  Item Description *
                </label>
                <textarea
                  rows={3}
                  required
                  minLength={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white border border-sand-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-charcoal focus:outline-none focus:border-terracotta"
                  placeholder="Describe appearance, model, color, wear and tear, or general contents (at least 5 characters)..."
                />
                <p className="text-[11px] text-charcoal-muted mt-1">Please provide at least 5 characters describing the item.</p>
              </div>
            </div>
          </div>

          {/* Section 2: Location & Timing */}
          <div className="card-warm p-6 bg-cream-50 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-olive border-b border-sand-200 pb-2">
              2. When & Where Was It Lost at HAMC?
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-olive mb-1">
                  Date Lost *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-white border border-sand-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-charcoal focus:outline-none focus:border-terracotta"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-olive mb-1">
                  Approximate Time
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-white border border-sand-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-charcoal focus:outline-none focus:border-terracotta"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-olive mb-1">
                  Campus Complex *
                </label>
                <input
                  type="text"
                  readOnly
                  value="Hashu Advani Memorial Complex (HAMC), Chembur"
                  className="w-full bg-sand-100 border border-sand-300 rounded-xl px-3.5 py-2.5 text-xs text-charcoal font-medium cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-olive mb-1">
                  Specific Campus Spot / Room *
                </label>
                <input
                  type="text"
                  required
                  minLength={2}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-white border border-sand-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-charcoal focus:outline-none focus:border-terracotta"
                  placeholder="e.g. Central Library 2nd Floor, Engineering Lab 402, Canteen, Quadrangle"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Distinctive Proof Markers (Private) */}
          <div className="card-warm p-6 bg-cream-50 space-y-4">
            <div className="flex items-center justify-between border-b border-sand-200 pb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-olive flex items-center gap-2">
                <Lock className="w-4 h-4 text-terracotta" />
                3. Private Ownership Markers
              </h3>
              <span className="text-[11px] text-terracotta font-semibold">Kept confidential</span>
            </div>

            <p className="text-xs text-charcoal-light">
              State secret characteristics (roll number label, sticker on bottom, scratch near sensor, specific wallpaper) that only you would know. Campus custodians use this to verify claims.
            </p>

            <div>
              <label className="block text-xs font-semibold text-olive mb-1">
                Distinctive Mark / Roll Number / Serial Code
              </label>
              <textarea
                rows={2}
                value={distinctiveFeature}
                onChange={(e) => setDistinctiveFeature(e.target.value)}
                className="w-full bg-white border border-sand-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-charcoal focus:outline-none focus:border-terracotta"
                placeholder="e.g. Silver marker dot on slider cover; roll number written inside flap."
              />
            </div>
          </div>

          {/* Section 4: Photo Upload with Rekognition AI */}
          <div className="card-warm p-6 bg-cream-50 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-olive border-b border-sand-200 pb-2">
              4. Photos for Visual Matching
            </h3>
            <ImageUploader
              images={images}
              onChange={setImages}
              onTagsDetected={setAiDetectedTags}
              onUploadingChange={setIsImageUploading}
              reportType="lost"
            />
          </div>

          {submitError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/user/dashboard')}
              className="px-5 py-3 rounded-xl border border-sand-300 text-xs font-semibold text-charcoal hover:bg-sand-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isImageUploading}
              className="btn-terracotta px-8 py-3 text-xs sm:text-sm font-semibold shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Scanning Rekognition Pipeline...</span>
                </>
              ) : isImageUploading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Uploading Photo to S3...</span>
                </>
              ) : (
                <>
                  <span>Publish Lost Report</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </form>
      )}

    </div>
  );
};
