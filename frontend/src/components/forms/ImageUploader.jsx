import React, { useState } from 'react';
import { UploadCloud, X, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

export const ImageUploader = ({
  images = [],
  onChange,
  onTagsDetected,
  onUploadingChange,
  reportType = 'lost',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [previews, setPreviews] = useState([]);

  const setUploadingState = (val) => {
    setIsUploading(val);
    if (onUploadingChange) onUploadingChange(val);
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploadError('');

    // Validate all files first
    for (const file of files) {
      if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
        setUploadError(`Invalid format for "${file.name}". Supported formats: JPG, PNG, WEBP, HEIC.`);
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
        setUploadError(`"${file.name}" is ${sizeMb} MB. Maximum allowed file size is 5 MB.`);
        return;
      }
    }

    setUploadingState(true);
    setUploadProgress(15);

    try {
      const newKeys = [];
      const newPreviews = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(20 + Math.round((i / files.length) * 40));

        // 1. Request presigned upload URL from backend
        const urlRes = await api.post('/images/upload-url', {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          reportType,
        });

        if (!urlRes.data?.uploadUrl || !urlRes.data?.fileKey) {
          throw new Error('Failed to obtain secure S3 upload credentials.');
        }

        const { uploadUrl, fileKey, publicUrl } = urlRes.data;

        // 2. Direct PUT upload to Amazon S3
        setUploadProgress(65 + Math.round((i / files.length) * 30));
        const putRes = await fetch(uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': file.type,
          },
          body: file,
        });

        if (!putRes.ok) {
          throw new Error(`S3 upload failed (HTTP ${putRes.status}).`);
        }

        newKeys.push(fileKey);
        newPreviews.push(publicUrl || URL.createObjectURL(file));
      }

      setUploadProgress(100);

      const combinedKeys = [...images, ...newKeys];
      const combinedPreviews = [...previews, ...newPreviews];
      setPreviews(combinedPreviews);
      onChange(combinedKeys);

      if (onTagsDetected) {
        onTagsDetected(['Amazon S3 Stored', 'Visual Evidence']);
      }
    } catch (err) {
      console.error('[ImageUploader] Upload failed:', err);
      setUploadError(err.message || 'Image upload failed. Please try again.');
    } finally {
      setUploadingState(false);
      setUploadProgress(0);
      e.target.value = '';
    }
  };

  const removeImage = (indexToRemove) => {
    const updatedKeys = images.filter((_, idx) => idx !== indexToRemove);
    const updatedPreviews = previews.filter((_, idx) => idx !== indexToRemove);
    setPreviews(updatedPreviews);
    onChange(updatedKeys);
  };

  const displayList = previews.length > 0 ? previews : images;

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-olive">
        Photos & Evidence <span className="text-charcoal-muted text-xs font-normal">(Encrypted S3 storage for Rekognition AI matching)</span>
      </label>

      {uploadError && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Upload Zone */}
      <div className="relative border-2 border-dashed border-sand-300 hover:border-terracotta rounded-xl p-6 text-center bg-cream-50/60 transition-colors cursor-pointer group">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic"
          multiple
          disabled={isUploading}
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
        />
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-sand-200 flex items-center justify-center text-olive group-hover:scale-105 transition-transform">
            <UploadCloud className="w-6 h-6 text-terracotta" />
          </div>
          <div className="text-sm">
            <span className="font-semibold text-terracotta hover:underline">Click to upload</span> or drag and drop
          </div>
          <p className="text-xs text-charcoal-muted">
            PNG, JPG, WEBP, HEIC up to 5MB. S3 secure encrypted storage.
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      {isUploading && (
        <div className="space-y-1.5 p-3 bg-sand-100 rounded-lg border border-sand-200">
          <div className="flex justify-between text-xs text-olive font-medium">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-terracotta animate-spin" />
              Encrypting & Uploading directly to Amazon S3...
            </span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-sand-300 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-terracotta h-full transition-all duration-200"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Previews Grid */}
      {displayList.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {displayList.map((imgUrl, index) => (
            <div key={index} className="relative group rounded-lg overflow-hidden border border-sand-300 bg-sand-100 aspect-square shadow-sm">
              <img
                src={imgUrl}
                alt={`Upload preview ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1.5 right-1.5 bg-charcoal/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600"
                title="Remove photo"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="absolute bottom-1 left-1 bg-charcoal/70 backdrop-blur-sm text-[10px] text-cream-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                S3 Uploaded
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
