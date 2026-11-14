/**
 * Report Model
 * Represents a Lost or Found item report on the HAMC campus.
 */

class Report {
  constructor({
    id,
    reportId,
    type, // 'lost' or 'found'
    title,
    description,
    category,
    date, // Date lost or found (YYYY-MM-DD)
    location, // Campus location (e.g. 'Lab 402', 'Central Library')
    city = 'Chembur, Mumbai',
    image,
    images = [],
    imageKey = '',
    s3Bucket = '',
    imageMetadata = null,
    status = 'active', // 'active', 'matched', 'claimed', 'under_review', 'resolved', 'archived', 'cancelled'
    userId, // Reporter ID
    reportedBy = null, // Reporter object { id, name, email, phone, role }
    brand = '',
    primaryColor = '',
    distinctFeatures = '',
    serialOrDistinctiveFeature = '',
    custodyLocation = '', // Where physical found item is deposited (e.g. 'Main Gate Security Cabin')
    aiTags = [], // Image labels from Rekognition or simulated detection
    rekognitionConfidence = 0,
    isLiveRekognition = false,
    imageAnalysisProvider = 'local-simulation-no-aws',
    views = 0,
    createdAt = new Date().toISOString(),
    updatedAt = new Date().toISOString()
  }) {
    const defaultImage = 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80';
    const imageList = Array.isArray(images) && images.length > 0
      ? images.filter(Boolean)
      : (image ? [image] : [defaultImage]);

    this.id = id || reportId;
    this.reportId = reportId || this.id;
    this.type = type;
    this.title = title;
    this.description = description;
    this.category = category;
    this.date = date;
    this.location = location;
    this.city = city;
    this.image = image || imageList[0] || defaultImage;
    this.images = imageList;
    const isExternalImage = typeof this.image === 'string' && (this.image.startsWith('http') || this.image.startsWith('/uploads') || this.image.startsWith('data:'));
    this.imageKey = imageKey || (isExternalImage ? '' : this.image);
    this.s3Bucket = s3Bucket || (this.imageKey ? (process.env.AWS_S3_BUCKET || 'traceback-campus-lost-and-found-hamc') : '');
    this.imageMetadata = imageMetadata || null;
    this.status = status;
    this.userId = userId;
    this.reportedBy = reportedBy;
    this.brand = brand;
    this.primaryColor = primaryColor;
    this.distinctFeatures = distinctFeatures || serialOrDistinctiveFeature;
    this.serialOrDistinctiveFeature = serialOrDistinctiveFeature || distinctFeatures;
    this.custodyLocation = custodyLocation;
    this.aiTags = Array.isArray(aiTags) ? aiTags : [];
    this.rekognitionConfidence = rekognitionConfidence;
    this.isLiveRekognition = Boolean(isLiveRekognition);
    this.imageAnalysisProvider = imageAnalysisProvider;
    this.views = views;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

module.exports = Report;
