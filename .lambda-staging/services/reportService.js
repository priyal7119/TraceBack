/**
 * Lost & Found Report Service
 */

const adapter = require('../data/adapter');
const Report = require('../models/Report');
const matchingService = require('./matchingService');
const imageService = require('./imageService');
const logger = require('../utils/logger');

class ReportService {
  /**
   * Helper to attach short-lived presigned GET URLs for private S3 images
   * In local development, leaves local file paths untouched.
   */
  async resolveReportImages(report) {
    if (!report) return report;
    const cloned = { ...report };
    const keyToResolve = cloned.imageKey || cloned.image;
    if (keyToResolve) {
      cloned.image = await imageService.getPresignedGetUrl(keyToResolve);
    }
    if (Array.isArray(cloned.images) && cloned.images.length > 0) {
      cloned.images = await Promise.all(cloned.images.map(img => imageService.getPresignedGetUrl(img)));
    } else if (cloned.image) {
      cloned.images = [cloned.image];
    }
    return cloned;
  }

  /**
   * Helper to resolve, extract and validate S3 object key from report input
   */
  resolveS3Key(reportData) {
    let raw = reportData.imageKey || reportData.s3Key || reportData.fileKey || reportData.image || '';
    if (!raw && Array.isArray(reportData.images) && reportData.images.length > 0) {
      raw = reportData.images[0];
    }
    if (!raw) return '';
    const extracted = imageService.extractS3Key(raw);
    if (!extracted || extracted.includes('..')) return '';
    return extracted;
  }

  /**
   * Create Lost Report
   * Involves DetectLabelsCommand via imageService when AWS is active.
   * Accurately reflects whether labels are live AI, local simulation, no-image, or error.
   */
  async createLostReport(reportData, user) {
    const s3Key = this.resolveS3Key(reportData);
    const hasImage = Boolean(s3Key || reportData.image);

    let analysis;
    if (!hasImage) {
      analysis = {
        isLiveRekognition: false,
        labels: [],
        confidence: null,
        provider: 'no-image',
        rawLabels: [],
        message: 'No image was provided. Visual Rekognition scan was not performed.'
      };
    } else {
      try {
        analysis = await imageService.detectLabels({
          imageKey: s3Key,
          s3Url: reportData.image,
          category: reportData.category,
          brand: reportData.brand,
        });
      } catch (err) {
        logger.error(`Rekognition analysis failed during lost report creation: ${err.message}`);
        analysis = {
          isLiveRekognition: false,
          labels: [],
          confidence: null,
          provider: 'aws-rekognition-error',
          rawLabels: [],
          error: err.message
        };
      }
    }

    const report = new Report({
      ...reportData,
      imageKey: s3Key,
      s3Bucket: s3Key ? (process.env.AWS_S3_BUCKET || 'traceback-campus-lost-and-found-hamc') : '',
      imageMetadata: {
        provider: analysis.provider,
        confidence: analysis.confidence,
        labels: analysis.rawLabels || analysis.labels || [],
        error: analysis.error || null,
      },
      type: 'lost',
      userId: user.id,
      reportedBy: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      status: 'active',
      aiTags: (Array.isArray(analysis.labels) && analysis.labels.length > 0)
        ? analysis.labels
        : (Array.isArray(reportData.aiTags) ? reportData.aiTags : []),
      isLiveRekognition: Boolean(analysis.isLiveRekognition),
      rekognitionConfidence: analysis.confidence || 0,
      imageAnalysisProvider: analysis.provider,
    });

    const saved = await adapter.create('reports', report);
    logger.info(`Lost report created: ${saved.title} by user ${user.id} [AI: ${analysis.provider}]`);

    // Execute matching evaluation synchronously so matches & notifications exist before response
    try {
      await matchingService.evaluateMatchesForReport(saved);
    } catch (err) {
      logger.error('Matching evaluation error for report ' + saved.id, err);
    }

    return this.resolveReportImages(saved);
  }

  /**
   * Create Found Report
   */
  async createFoundReport(reportData, user) {
    const s3Key = this.resolveS3Key(reportData);
    const hasImage = Boolean(s3Key || reportData.image);

    let analysis;
    if (!hasImage) {
      analysis = {
        isLiveRekognition: false,
        labels: [],
        confidence: null,
        provider: 'no-image',
        rawLabels: [],
        message: 'No image was provided. Visual Rekognition scan was not performed.'
      };
    } else {
      try {
        analysis = await imageService.detectLabels({
          imageKey: s3Key,
          s3Url: reportData.image,
          category: reportData.category,
          brand: reportData.brand,
        });
      } catch (err) {
        logger.error(`Rekognition analysis failed during found report creation: ${err.message}`);
        analysis = {
          isLiveRekognition: false,
          labels: [],
          confidence: null,
          provider: 'aws-rekognition-error',
          rawLabels: [],
          error: err.message
        };
      }
    }

    const report = new Report({
      ...reportData,
      imageKey: s3Key,
      s3Bucket: s3Key ? (process.env.AWS_S3_BUCKET || 'traceback-campus-lost-and-found-hamc') : '',
      imageMetadata: {
        provider: analysis.provider,
        confidence: analysis.confidence,
        labels: analysis.rawLabels || analysis.labels || [],
        error: analysis.error || null,
      },
      type: 'found',
      userId: user.id,
      reportedBy: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      status: 'active',
      custodyLocation: reportData.custodyLocation || reportData.location || 'Main Gate Security Cabin',
      aiTags: (Array.isArray(analysis.labels) && analysis.labels.length > 0)
        ? analysis.labels
        : (Array.isArray(reportData.aiTags) ? reportData.aiTags : []),
      isLiveRekognition: Boolean(analysis.isLiveRekognition),
      rekognitionConfidence: analysis.confidence || 0,
      imageAnalysisProvider: analysis.provider,
    });

    const saved = await adapter.create('reports', report);
    logger.info(`Found report created: ${saved.title} by user ${user.id} [AI: ${analysis.provider}]`);

    // Execute matching evaluation synchronously so matches & notifications exist before response
    try {
      await matchingService.evaluateMatchesForReport(saved);
    } catch (err) {
      logger.error('Matching evaluation error for report ' + saved.id, err);
    }

    return this.resolveReportImages(saved);
  }

  /**
   * Sanitize public report to prevent leaking student contact info to unrelated users
   */
  sanitizePublicReport(report) {
    if (!report) return null;
    const sanitized = { ...report };
    if (sanitized.contactInfo) {
      sanitized.contactInfo = {
        notes: sanitized.contactInfo.notes || 'Please contact HAMC administration custody desk for property verification.'
      };
    }
    if (sanitized.reportedBy) {
      sanitized.reportedBy = {
        id: sanitized.reportedBy.id,
        name: sanitized.reportedBy.name,
        role: sanitized.reportedBy.role,
      };
    }
    return sanitized;
  }

  /**
   * Get public/eligible lost reports
   */
  async getLostReports(filters = {}, options = {}) {
    const query = {
      type: 'lost',
      status: (s) => s !== 'cancelled' && s !== 'archived'
    };

    if (filters.category) query.category = filters.category;
    if (filters.status) query.status = filters.status;

    let reports = await adapter.find('reports', query, {
      sortBy: 'createdAt',
      sortOrder: 'desc',
      ...options
    });

    if (filters.search) {
      const q = filters.search.toLowerCase();
      reports = reports.filter(r =>
        (r.title && r.title.toLowerCase().includes(q)) ||
        (r.description && r.description.toLowerCase().includes(q)) ||
        (r.location && r.location.toLowerCase().includes(q))
      );
    }

    const resolved = await Promise.all(reports.map(r => this.resolveReportImages(r)));
    return resolved.map(r => this.sanitizePublicReport(r));
  }

  /**
   * Get public found item listings (for Browse Found Items page)
   */
  async getFoundReports(filters = {}, options = {}) {
    const query = {
      type: 'found',
      status: (s) => s !== 'archived' && s !== 'cancelled'
    };

    if (filters.category) query.category = filters.category;
    if (filters.status) query.status = filters.status;

    let reports = await adapter.find('reports', query, {
      sortBy: 'createdAt',
      sortOrder: 'desc',
      ...options
    });

    if (filters.search) {
      const q = filters.search.toLowerCase();
      reports = reports.filter(r =>
        (r.title && r.title.toLowerCase().includes(q)) ||
        (r.description && r.description.toLowerCase().includes(q)) ||
        (r.location && r.location.toLowerCase().includes(q)) ||
        (r.custodyLocation && r.custodyLocation.toLowerCase().includes(q))
      );
    }

    if (filters.location && filters.location !== 'all') {
      const loc = filters.location.toLowerCase();
      reports = reports.filter(r =>
        (r.location && r.location.toLowerCase().includes(loc)) ||
        (r.custodyLocation && r.custodyLocation.toLowerCase().includes(loc))
      );
    }

    const resolved = await Promise.all(reports.map(r => this.resolveReportImages(r)));
    return resolved.map(r => this.sanitizePublicReport(r));
  }

  /**
   * Get all reports submitted by a specific user (My Reports)
   */
  async getUserReports(userId) {
    const reports = await adapter.find('reports', { userId }, { sortBy: 'createdAt', sortOrder: 'desc' });
    return Promise.all(reports.map(r => this.resolveReportImages(r)));
  }

  /**
   * Get single report by ID (increments views count)
   */
  async getReportById(id) {
    const report = await adapter.findById('reports', id);
    if (!report) return null;

    // Increment view count asynchronously
    adapter.update('reports', id, { views: (report.views || 0) + 1 }).catch(() => {});
    return this.resolveReportImages(report);
  }

  /**
   * Update own report where permitted
   */
  async updateReport(id, updateData, user) {
    const existing = await adapter.findById('reports', id);
    if (!existing) {
      throw new Error('Report not found');
    }

    // Permission check: owner or admin
    if (existing.userId !== user.id && user.role !== 'admin') {
      throw new Error('You do not have permission to update this report.');
    }

    // Disallow updating type or userId
    delete updateData.type;
    delete updateData.userId;
    delete updateData.id;

    const updated = await adapter.update('reports', id, updateData);
    logger.info(`Report ${id} updated by user ${user.id}`);
    return this.resolveReportImages(updated);
  }

  /**
   * Delete or cancel own report
   */
  async deleteReport(id, user) {
    const existing = await adapter.findById('reports', id);
    if (!existing) {
      throw new Error('Report not found');
    }

    if (existing.userId !== user.id && user.role !== 'admin') {
      throw new Error('You do not have permission to delete this report.');
    }

    // Soft delete / cancel to preserve audit trail, or delete
    await adapter.delete('reports', id);
    logger.info(`Report ${id} deleted by user ${user.id}`);
    return true;
  }
}

module.exports = new ReportService();
