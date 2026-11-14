/**
 * Image Upload Controller
 */

const imageService = require('../services/imageService');
const logger = require('../utils/logger');

const getUploadUrl = async (req, res, next) => {
  try {
    const { fileName, fileType, fileSize, reportType } = req.body;
    const result = await imageService.getUploadUrl({ fileName, fileType, fileSize, reportType });
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getViewUrl = async (req, res) => {
  try {
    const { key, url } = req.query;
    if (!key && !url) {
      return res.status(400).json({
        success: false,
        message: 'Image key or URL is required to generate presigned view URL.',
      });
    }

    const rawKey = key || url;
    const s3Key = imageService.extractS3Key(rawKey);

    // Security check: restrict presigned GET generation to authorized uploads / reports path prefixes
    if (s3Key && !s3Key.startsWith('http://') && !s3Key.startsWith('https://') && !s3Key.startsWith('/uploads')) {
      if ((!s3Key.startsWith('uploads/') && !s3Key.startsWith('reports/')) || s3Key.includes('..')) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Requested image path is not authorized.',
        });
      }
    }

    const signedUrl = await imageService.getPresignedGetUrl(key || url);
    res.status(200).json({
      success: true,
      viewUrl: signedUrl,
      expiresInSeconds: 900,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const handleLocalUpload = async (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production' || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);
  if (isProduction) {
    return res.status(403).json({
      success: false,
      message: 'Local filesystem uploads are disabled in production mode. Use Amazon S3 presigned upload URLs.',
    });
  }

  try {
    const file = req.file;
    const fileUrl = file
      ? `/uploads/${file.filename}`
      : (req.query.key ? `/uploads/${req.query.key}` : 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80');

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully in local development mode.',
      publicUrl: fileUrl,
      fileKey: file ? file.filename : req.query.key,
      isPrivateS3: false,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const analyzeImage = async (req, res) => {
  try {
    const { image, key, category, brand } = req.body;
    const analysis = await imageService.detectLabels({
      imageKey: key,
      s3Url: image,
      category,
      brand,
    });

    res.status(200).json({
      success: true,
      isLiveRekognition: analysis.isLiveRekognition,
      confidence: analysis.confidence, // null in simulation, real number from AWS
      labels: analysis.labels,
      rawLabels: analysis.rawLabels || [],
      provider: analysis.provider,
      message: analysis.message || (analysis.isLiveRekognition
        ? 'Live Amazon Rekognition analysis complete.'
        : 'Local simulated analysis. AWS Rekognition credentials not configured.'),
    });
  } catch (error) {
    logger.error('Image analysis endpoint failed:', error.message);
    res.status(400).json({
      success: false,
      isLiveRekognition: false,
      provider: error.provider || 'aws-rekognition-error',
      message: error.message || 'Image analysis failed.',
    });
  }
};

module.exports = {
  getUploadUrl,
  getViewUrl,
  handleLocalUpload,
  analyzeImage,
};
