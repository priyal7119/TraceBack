/**
 * Reports Controller (Lost & Found)
 */

const reportService = require('../services/reportService');

const createLostReport = async (req, res, next) => {
  try {
    const report = await reportService.createLostReport(req.body, req.user);
    res.status(201).json({
      success: true,
      message: 'Lost item report submitted successfully. Automated matching initiated.',
      report,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const createFoundReport = async (req, res, next) => {
  try {
    const report = await reportService.createFoundReport(req.body, req.user);
    res.status(201).json({
      success: true,
      message: 'Found item report registered. Thank you for turning in campus property.',
      report,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getLostReports = async (req, res, next) => {
  try {
    const { category, search, status, page, limit } = req.query;
    const reports = await reportService.getLostReports(
      { category, search, status },
      { page: parseInt(page) || 1, limit: parseInt(limit) || 50 }
    );
    res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    next(error);
  }
};

const getFoundReports = async (req, res, next) => {
  try {
    const { category, search, status, location, page, limit } = req.query;
    const reports = await reportService.getFoundReports(
      { category, search, status, location },
      { page: parseInt(page) || 1, limit: parseInt(limit) || 50 }
    );
    res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    next(error);
  }
};

const getMyReports = async (req, res, next) => {
  try {
    const reports = await reportService.getUserReports(req.user.id);
    res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    next(error);
  }
};

const getReportById = async (req, res, next) => {
  try {
    const report = await reportService.getReportById(req.params.id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    const user = req.user;
    const isOwner = Boolean(user && (user.id === report.userId || (report.reportedBy && report.reportedBy.id === user.id)));
    const isAdmin = Boolean(user && user.role === 'admin');

    // Authorization check: if report is cancelled, only owner or admin can view
    if (report.status === 'cancelled') {
      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You are not authorized to view this report.',
        });
      }
    }

    // Mask sensitive contact details for unrelated students browsing items
    const outputReport = (isOwner || isAdmin) ? report : reportService.sanitizePublicReport(report);

    res.status(200).json({
      success: true,
      report: outputReport,
    });
  } catch (error) {
    next(error);
  }
};

const updateReport = async (req, res, next) => {
  try {
    const updated = await reportService.updateReport(req.params.id, req.body, req.user);
    res.status(200).json({
      success: true,
      message: 'Report updated successfully.',
      report: updated,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteReport = async (req, res, next) => {
  try {
    await reportService.deleteReport(req.params.id, req.user);
    res.status(200).json({
      success: true,
      message: 'Report cancelled/deleted successfully.',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getPublicStats = async (req, res, next) => {
  try {
    const adminService = require('../services/adminService');
    const stats = await adminService.getOverviewStats();
    res.status(200).json({
      success: true,
      stats: {
        totalReports: stats.totalReports,
        lostReportsCount: stats.lostReportsCount,
        foundReportsCount: stats.foundReportsCount,
        resolvedCount: stats.resolvedCount,
        rekognitionAccuracy: stats.rekognitionAccuracy,
        avgReuniteTimeDays: stats.avgReuniteTimeDays,
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLostReport,
  createFoundReport,
  getLostReports,
  getFoundReports,
  getMyReports,
  getReportById,
  updateReport,
  deleteReport,
  getPublicStats,
};
