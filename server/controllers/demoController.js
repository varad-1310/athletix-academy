const { seedDatabase, resetDemoData } = require('../seed/seedData');

// @desc    Reset and re-seed demo data with confirmation
// @route   POST /api/demo/reset
// @access  Private (Super Admin / Academy Admin)
const resetDemo = async (req, res, next) => {
  try {
    const { confirmation } = req.body;
    if (confirmation !== 'RESET_DEMO_DATA') {
      return res.status(400).json({
        success: false,
        message: 'Confirmation string "RESET_DEMO_DATA" required to reset demo records.'
      });
    }

    const summary = await resetDemoData();

    res.json({
      success: true,
      message: 'Demo records successfully reset and reseeded with realistic dataset.',
      summary
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get demo status and statistics
// @route   GET /api/demo/status
// @access  Public
const getDemoStatus = async (req, res, next) => {
  try {
    res.json({
      success: true,
      isDemoMode: true,
      demoAccounts: {
        superAdmin: { email: 'superadmin@athletix.com', password: 'Password@123', role: 'Super Admin' },
        academyAdmin: { email: 'admin@athletix.com', password: 'Password@123', role: 'Academy Admin' },
        coach: { email: 'coach.rohit@athletix.com', password: 'Password@123', role: 'Coach' }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  resetDemo,
  getDemoStatus
};
