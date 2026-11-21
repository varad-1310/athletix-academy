const AcademySettings = require('../models/AcademySettings');
const FeePlan = require('../models/FeePlan');
const AuditLog = require('../models/AuditLog');

// @desc    Get academy settings
// @route   GET /api/settings
// @access  Public / Private
const getSettings = async (req, res, next) => {
  try {
    let settings = await AcademySettings.findOne();
    if (!settings) {
      settings = await AcademySettings.create({
        academyName: 'ATHLETIX ACADEMY',
        tagline: 'Train Smarter. Manage Better. Perform Stronger.',
        email: 'contact@athletixacademy.com',
        phone: '+91 98765 43210',
        address: 'Plot 42, Olympic Avenue, Sports City, India',
        supportedSports: ['Cricket', 'Football', 'Badminton', 'Basketball', 'Swimming', 'Volleyball', 'Tennis', 'Athletics']
      });
    }

    const feePlans = await FeePlan.find({ status: 'active' });

    res.json({
      success: true,
      data: settings,
      feePlans
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update academy settings
// @route   PUT /api/settings
// @access  Private (Super Admin)
const updateSettings = async (req, res, next) => {
  try {
    let settings = await AcademySettings.findOne();
    if (!settings) {
      settings = await AcademySettings.create(req.body);
    } else {
      settings = await AcademySettings.findByIdAndUpdate(settings._id, req.body, {
        new: true,
        runValidators: true
      });
    }

    await AuditLog.create({
      entity: 'Settings',
      entityId: settings._id.toString(),
      action: 'UPDATE',
      performedBy: req.user._id,
      performedByName: req.user.name,
      details: { updatedFields: Object.keys(req.body) }
    });

    res.json({
      success: true,
      message: 'Academy settings updated successfully',
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create / Update Fee Plan
// @route   POST /api/settings/fee-plans
// @access  Private (Admins)
const createFeePlan = async (req, res, next) => {
  try {
    const feePlan = await FeePlan.create(req.body);
    res.status(201).json({ success: true, message: 'Fee plan created successfully', data: feePlan });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings,
  createFeePlan
};
