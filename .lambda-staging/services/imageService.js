/**
 * Image Upload & Amazon Rekognition Service
 * 
 * AWS Integration:
 * - Uses @aws-sdk/s3-request-presigner and @aws-sdk/client-s3 for presigned S3 upload & private GET URLs.
 * - Uses @aws-sdk/client-rekognition to execute DetectLabelsCommand against private S3 bucket objects.
 * - Private S3 bucket: traceback-campus-lost-and-found-hamc
 * 
 * Reliability & Transparency:
 * - When live AWS mode is active (DATA_ADAPTER === 'dynamodb' or AWS configured), DetectLabelsCommand
 *   is executed directly against S3. Service errors, invalid keys, or credential issues throw clear errors
 *   and NEVER silently fall back to simulated AI.
 * - When local development mode is active (DATA_ADAPTER === 'local'), returns simulated classification
 *   with provider strictly set to 'local-simulation-no-aws' and confidence: null.
 * - When no image is provided, cleanly returns provider: 'no-image' without calling Rekognition.
 */

const { PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { DetectLabelsCommand } = require('@aws-sdk/client-rekognition');
const { isAwsConfigured, s3Client, rekognitionClient, s3Bucket, region, rekognitionMinConfidence } = require('../config/aws');
const logger = require('../utils/logger');

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

class ImageService {
  constructor() {
    this.extractS3Key = this.extractS3Key.bind(this);
    this.getUploadUrl = this.getUploadUrl.bind(this);
    this.getPresignedGetUrl = this.getPresignedGetUrl.bind(this);
    this.detectLabels = this.detectLabels.bind(this);
    this.recordImageMetadata = this.recordImageMetadata.bind(this);
  }

  /**
   * Helper to extract S3 key from either a raw key or full S3 URL
   */
  extractS3Key(keyOrUrl) {
    if (!keyOrUrl || typeof keyOrUrl !== 'string') return null;
    let raw = keyOrUrl.trim();
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      try {
        const parsed = new URL(raw);
        // Only extract if URL belongs to AWS S3 (amazon ws or contains our bucket name)
        const isS3Host = parsed.hostname.includes('amazonaws.com') || (s3Bucket && parsed.hostname.includes(s3Bucket));
        if (!isS3Host) {
          return null; // External non-S3 URL (e.g. unsplash.com)
        }
        let pathname = decodeURIComponent(parsed.pathname).replace(/^\/+/, '');
        if (s3Bucket && pathname.startsWith(`${s3Bucket}/`)) {
          pathname = pathname.substring(s3Bucket.length + 1);
        }
        return pathname;
      } catch {
        return null;
      }
    }
    if (raw.startsWith('/uploads/') || raw.startsWith('data:')) {
      return null;
    }
    return raw.replace(/^\/+/, '');
  }

  /**
   * Request Presigned Upload URL (PutObjectCommand) or Local Development URL
   */
  async getUploadUrl({ fileName, fileType, fileSize, reportType = 'item' }) {
    // 1. Validation
    if (!fileType || !ALLOWED_MIME_TYPES.includes(fileType.toLowerCase())) {
      throw new Error(`Invalid file type "${fileType}". Allowed types: JPEG, PNG, WebP, HEIC.`);
    }

    if (fileSize && fileSize > MAX_FILE_SIZE_BYTES) {
      throw new Error(`File size exceeds 5MB limit. Please upload an optimized photo.`);
    }

    const cleanExt = fileType.split('/')[1] || 'jpg';
    const key = `uploads/${reportType}/${Date.now()}-${Math.random().toString(36).substr(2, 6)}.${cleanExt}`;

    // 2. Real AWS S3 Presigned PUT URL if configured
    if (isAwsConfigured && s3Client) {
      try {
        const command = new PutObjectCommand({
          Bucket: s3Bucket,
          Key: key,
          ContentType: fileType,
        });

        // 5-minute short-lived presigned upload URL
        const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
        
        // Private S3 bucket: do NOT expose raw s3.amazonaws.com URL as public
        // Instead generate a presigned GET URL for immediate preview
        const viewUrl = await this.getPresignedGetUrl(key, 900);

        logger.info(`Generated S3 presigned upload URL for key: ${key}`);
        return {
          uploadUrl,
          fileKey: key,
          s3Key: key,
          publicUrl: viewUrl, // Short-lived presigned GET URL for private object
          isPrivateS3: true,
          provider: 'aws-s3',
          expiresInSeconds: 300
        };
      } catch (err) {
        logger.error('Failed to generate S3 presigned URL.', err);
        throw new Error(`Failed to generate S3 upload URL: ${err.message}`);
      }
    }

    // 3. Local Development Mock / Fallback
    const isProduction = process.env.NODE_ENV === 'production' || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);
    if (isProduction) {
      throw new Error('AWS S3 image storage is required in production mode. Local filesystem fallback is disabled.');
    }

    logger.info(`Local dev mode: generated placeholder upload endpoint for ${fileName || key}`);
    const devPublicUrl = `/uploads/${key}`;

    return {
      uploadUrl: `/api/images/local-upload?key=${encodeURIComponent(key)}`,
      fileKey: key,
      s3Key: key,
      publicUrl: devPublicUrl,
      isPrivateS3: false,
      provider: 'local-development',
      message: 'AWS S3 is not active. Using local development image handler.'
    };
  }

  /**
   * Generate a short-lived presigned GET URL for viewing private S3 objects.
   * If running locally or given an external URL, returns the original URL intact.
   */
  async getPresignedGetUrl(keyOrUrl, expiresInSeconds = 900) {
    if (!keyOrUrl || typeof keyOrUrl !== 'string') return keyOrUrl;

    // Check if this is an external link (like unsplash) or a local development path
    if (keyOrUrl.startsWith('/uploads/') || keyOrUrl.startsWith('data:') || keyOrUrl.includes('images.unsplash.com')) {
      return keyOrUrl;
    }

    // If AWS is configured, generate presigned GET URL for the private S3 object
    if (isAwsConfigured && s3Client) {
      try {
        const key = this.extractS3Key(keyOrUrl);
        if (!key) return keyOrUrl;

        const command = new GetObjectCommand({
          Bucket: s3Bucket,
          Key: key,
        });
        const signedGetUrl = await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
        return signedGetUrl;
      } catch (err) {
        logger.error(`Failed to generate presigned GET URL for ${keyOrUrl}`, err);
        return keyOrUrl;
      }
    }

    // Local dev mode fallback
    if (keyOrUrl.startsWith('uploads/')) {
      return `/${keyOrUrl}`;
    }
    return keyOrUrl;
  }

  /**
   * Detect labels using Amazon Rekognition DetectLabelsCommand.
   * Clearly distinguishes live AWS results from local simulation and no-image submissions.
   * Never returns fabricated labels on AWS failures.
   */
  async detectLabels({ imageKey, s3Url, category, brand }) {
    const isExplicitLocal = process.env.DATA_ADAPTER === 'local';
    const isLiveAws = !isExplicitLocal && (Boolean(isAwsConfigured) || process.env.DATA_ADAPTER === 'dynamodb');

    // Case 1: No image provided
    if (!imageKey && !s3Url) {
      logger.info('No image provided for report. Rekognition visual scan skipped.');
      return {
        isLiveRekognition: false,
        labels: [],
        confidence: null,
        provider: 'no-image',
        rawLabels: [],
        message: 'No image was provided. Visual Rekognition scan was not performed.'
      };
    }

    const s3Key = this.extractS3Key(imageKey || s3Url);

    // Case 2: Live AWS Rekognition Mode
    if (isLiveAws) {
      if (!rekognitionClient) {
        logger.error('AWS Rekognition client not initialized in live mode.');
        const err = new Error('AWS Rekognition is not configured or credentials unavailable in live AWS mode.');
        err.name = 'NoCredentials';
        err.provider = 'aws-rekognition-error';
        throw err;
      }

      if (!s3Key) {
        logger.warn(`Image reference "${imageKey || s3Url}" is not stored in S3 bucket ${s3Bucket}. Rekognition scan skipped.`);
        return {
          isLiveRekognition: false,
          labels: [],
          confidence: null,
          provider: 'no-image',
          rawLabels: [],
          message: 'Image is not located in the configured S3 bucket. Rekognition scan skipped.'
        };
      }

      // Security check on key
      if (s3Key.includes('..')) {
        const err = new Error('Invalid S3 object key: path traversal characters detected.');
        err.name = 'InvalidS3ObjectException';
        err.provider = 'aws-rekognition-error';
        throw err;
      }

      try {
        const minConf = Number(process.env.AWS_REKOGNITION_MIN_CONFIDENCE || rekognitionMinConfidence || 80);
        const command = new DetectLabelsCommand({
          Image: {
            S3Object: {
              Bucket: s3Bucket,
              Name: s3Key,
            },
          },
          MaxLabels: 15,
          MinConfidence: minConf,
        });

        logger.info(`Invoking live AWS Rekognition DetectLabelsCommand for s3://${s3Bucket}/${s3Key} (MinConfidence: ${minConf}%)`);
        const response = await rekognitionClient.send(command);

        // Structure individual label confidences
        const rawLabels = (response.Labels || []).map(l => ({
          name: l.Name,
          confidence: Number((l.Confidence || 0).toFixed(1)),
          categories: (l.Categories || []).map(c => c.Name),
          parents: (l.Parents || []).map(p => p.Name),
        }));

        // Deduplicate and filter useful labels
        const seen = new Set();
        const labels = [];
        for (const l of response.Labels || []) {
          const name = l.Name.trim();
          const lower = name.toLowerCase();
          if (!seen.has(lower)) {
            seen.add(lower);
            labels.push(name);
          }
        }

        const avgConfidence = rawLabels.length
          ? Number((rawLabels.reduce((acc, l) => acc + l.confidence, 0) / rawLabels.length).toFixed(1))
          : null;

        logger.info(`Live AWS Rekognition completed for s3://${s3Bucket}/${s3Key}: ${labels.length} labels detected (avg confidence: ${avgConfidence}%)`);

        return {
          isLiveRekognition: true,
          labels,
          confidence: avgConfidence,
          provider: 'aws-rekognition',
          rawLabels,
          message: 'Live Amazon Rekognition analysis complete.'
        };
      } catch (err) {
        logger.error(`AWS Rekognition DetectLabelsCommand failed for s3://${s3Bucket}/${s3Key}: ${err.name} - ${err.message}`, err);
        const wrappedErr = new Error(`AWS Rekognition error: ${err.message}`);
        wrappedErr.name = err.name || 'RekognitionServiceError';
        wrappedErr.code = err.name || 'RekognitionServiceError';
        wrappedErr.provider = 'aws-rekognition-error';
        throw wrappedErr;
      }
    }

    // Case 3: Local Simulation Mode (Explicitly flagged as NOT live AI)
    logger.info(`Report submission: using local simulated tags (DATA_ADAPTER=${process.env.DATA_ADAPTER || 'local'}).`);
    return {
      isLiveRekognition: false,
      labels: [category, brand || 'Personal Item', 'Campus Belonging'].filter(Boolean),
      confidence: null, // Strictly null: never report simulated confidence as live AI
      provider: 'local-simulation-no-aws',
      rawLabels: [],
      message: 'Simulated classification based on user category input. AWS Rekognition is not active.',
    };
  }

  /**
   * Record image metadata (backward compatible method)
   */
  async recordImageMetadata({ fileKey, publicUrl, category }) {
    const analysis = await this.detectLabels({ imageKey: fileKey, s3Url: publicUrl, category });
    return {
      fileKey,
      publicUrl,
      labels: analysis.labels,
      isLiveRekognition: analysis.isLiveRekognition,
      rekognitionConfidence: analysis.confidence,
      processedBy: analysis.provider,
    };
  }
}

module.exports = new ImageService();
