import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PackageSearch, 
  MapPin, 
  Calendar, 
  Clock, 
  Sparkles, 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { ImageUploader } from '../../components/forms/ImageUploader';

export const ReportFoundItem = () => {
  const navigate = useNavigate();
  const { addReport } = useData();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [brand, setBrand] = useState('');
  const [primaryColor, setPrimaryColor] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('14:30');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('HAMC Chembur, Mumbai');
  const [storageLocation, setStorageLocation] = useState('HAMC Main Gate Security Desk');
  const [description, setDescription] = useState('');
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
      const newFoundReport = {
        type: 'found',
        title: title.trim(),
        category,
        brand: brand.trim(),
        primaryColor: primaryColor.trim(),
        date,
        time,
        location: location.trim(),
        city: city || 'HAMC Chembur, Mumbai',
        storageLocation: storageLocation || 'HAMC Main Gate Security Desk',
        description: description.trim(),
        images: images.length > 0 ? images : [],
        imageKey: images.length > 0 ? images[0] : '',
        image: images.length > 0 ? images[0] : '',
        aiTags: aiDetectedTags.length > 0 ? aiDetectedTags : [],
        reportedBy: user || null,
      };

      const saved = await addReport(newFoundReport);
      if (!saved || !saved.id) {
        throw new Error('Server did not return a confirmed report record.');
      }

      setIsSubmitting(false);
      setSuccess(true);

      setTimeout(() => {
        navigate('/browse');
      }, 1200);
    } catch (err) {
      console.error('Failed to submit found report:', err);
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sage-200 text-xs font-semibold text-olive mb-2 border border-sage-300">
          <PackageSearch className="w-3.5 h-3.5 text-olive" />
          <span>HAMC Campus Found Property Intake</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-olive">
          Report a Found Item
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-light mt-1">
          Thank you for turning in a community member's belonging. Cataloging this item allows the rightful owner at HAMC to find it through Amazon Rekognition visual matching.
        </p>
      </div>

      {success ? (
        <div className="card-warm p-10 bg-cream-50 text-center space-y-4">
          <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto animate-bounce" />
          <h2 className="text-xl font-bold text-olive">Found Item Logged Successfully!</h2>
          <p className="text-sm text-charcoal-light max-w-md mx-auto">
            The item is now listed in the HAMC catalog and queued for automated match checks against existing student and staff lost reports.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: Item Details */}
          <div className="card-warm p-6 bg-cream-50 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-olive border-b border-sand-200 pb-2">
              1. Found Item Characteristics
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-olive mb-1">
                  Item Title *
                </label>
                <input
                  type="text"
                  required
                  minLength={3}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white border border-sand-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-charcoal focus:outline-none focus:border-terracotta"
                  placeholder="e.g. Apple AirPods Pro (2nd Gen) with Olive Protective Case"
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
                  Brand (if visible)
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full bg-white border border-sand-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-charcoal focus:outline-none focus:border-terracotta"
                  placeholder="e.g. Apple, Casio, Wildcraft, Titan"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-olive mb-1">
                  Colors & Visible Appearance
                </label>
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-full bg-white border border-sand-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-charcoal focus:outline-none focus:border-terracotta"
                  placeholder="e.g. White earbuds inside olive silicone case with metal clip"
                />
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
                  placeholder="Describe where it was found in the campus and general condition (at least 5 characters). (Do not describe private roll numbers, serial codes, or secret engravings)."
                />
                <p className="text-[11px] text-charcoal-muted mt-1">Please provide at least 5 characters describing the item.</p>
              </div>
            </div>
          </div>

          {/* Section 2: Location & Custody */}
          <div className="card-warm p-6 bg-cream-50 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-olive border-b border-sand-200 pb-2">
              2. Discovery Location & Campus Custody
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-olive mb-1">
                  Date Found *
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
                  Time Found
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
                  Campus *
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
                  Specific Campus Spot Found *
                </label>
                <input
                  type="text"
                  required
                  minLength={2}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-white border border-sand-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-charcoal focus:outline-none focus:border-terracotta"
                  placeholder="e.g. HAMC Central Library 2nd Floor, Canteen Table, Quadrangle steps"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-olive mb-1">
                  Where Is the Item Stored for Safekeeping? (Custody Desk / Office) *
                </label>
                <select
                  value={storageLocation}
                  onChange={(e) => setStorageLocation(e.target.value)}
                  className="w-full bg-white border border-sand-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-charcoal focus:outline-none focus:border-terracotta"
                >
                  <option value="HAMC Main Gate Security Desk">HAMC Main Gate Security Cabin (Collector's Colony entrance)</option>
                  <option value="Central Library Circulation & Help Desk">Central Library Circulation & Help Desk (2nd Floor)</option>
                  <option value="HAMC Admin Office Custody Locker">Campus Administration Office Custody Locker</option>
                  <option value="Department Lab Attendant Desk">Department Lab Attendant Desk</option>
                  <option value="Kept with Finder (Awaiting Owner Handover)">Kept with Finder (Direct Campus Handover)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Photo Upload */}
          <div className="card-warm p-6 bg-cream-50 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-olive border-b border-sand-200 pb-2">
              3. Upload Clear Photos
            </h3>
            <ImageUploader
              images={images}
              onChange={setImages}
              onTagsDetected={setAiDetectedTags}
              onUploadingChange={setIsImageUploading}
              reportType="found"
            />
          </div>

          {submitError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Buttons */}
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
              className="btn-olive px-8 py-3 text-xs sm:text-sm font-semibold shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Registering with Rekognition Pipeline...</span>
                </>
              ) : isImageUploading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Uploading Photo to S3...</span>
                </>
              ) : (
                <>
                  <span>Register Found Item</span>
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
