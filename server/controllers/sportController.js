const Sport = require('../models/Sport');

// @desc    Get all sports
// @route   GET /api/sports
// @access  Public
const getSports = async (req, res, next) => {
  try {
    const sports = await Sport.find().sort({ name: 1 });
    res.json({ success: true, count: sports.length, data: sports });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new sport
// @route   POST /api/sports
// @access  Private (Admins)
const createSport = async (req, res, next) => {
  try {
    const { name, code, description, icon, defaultMonthlyFee } = req.body;
    const sport = await Sport.create({
      name,
      code: code || name.substring(0, 3).toUpperCase(),
      description,
      icon: icon || 'Trophy',
      defaultMonthlyFee: defaultMonthlyFee || 2000
    });
    res.status(201).json({ success: true, message: 'Sport created successfully', data: sport });
  } catch (error) {
    next(error);
  }
};

// @desc    Update sport
// @route   PUT /api/sports/:id
// @access  Private (Admins)
const updateSport = async (req, res, next) => {
  try {
    const sport = await Sport.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!sport) {
      return res.status(404).json({ success: false, message: 'Sport not found' });
    }
    res.json({ success: true, message: 'Sport updated successfully', data: sport });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSports,
  createSport,
  updateSport
};
