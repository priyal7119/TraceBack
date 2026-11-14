/**
 * Admin Controller
 */

const adminService = require('../services/adminService');
const adapter = require('../data/adapter');

const getOverview = async (req, res, next) => {
  try {
    const stats = await adminService.getOverviewStats();
    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await adminService.getAllUsers(req.query);
    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { status, role } = req.body;
    const updated = await adminService.updateUser(req.params.id, { status, role });
    res.status(200).json({
      success: true,
      message: 'User account updated successfully.',
      user: updated,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getReports = async (req, res, next) => {
  try {
    const reports = await adminService.getAllReports(req.query);
    res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    next(error);
  }
};

const updateReportStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required.' });
    }
    const updated = await adminService.updateReportStatus(req.params.id, status, notes);
    res.status(200).json({
      success: true,
      message: `Report status updated to ${status}.`,
      report: updated,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getMatches = async (req, res, next) => {
  try {
    const matches = await adapter.find('matches', {}, { sortBy: 'createdAt', sortOrder: 'desc' });
    res.status(200).json({
      success: true,
      count: matches.length,
      matches,
    });
  } catch (error) {
    next(error);
  }
};

const getArchivedReports = async (req, res, next) => {
  try {
    const reports = await adminService.getArchivedReports();
    res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverview,
  getUsers,
  updateUser,
  getReports,
  updateReportStatus,
  getMatches,
  getArchivedReports,
};
