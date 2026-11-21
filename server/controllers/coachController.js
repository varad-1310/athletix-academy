const Coach = require('../models/Coach');
const Batch = require('../models/Batch');
const Student = require('../models/Student');
const AuditLog = require('../models/AuditLog');

// @desc    Get all coaches
// @route   GET /api/coaches
// @access  Private
const getCoaches = async (req, res, next) => {
  try {
    const { search, sport, status } = req.query;
    const query = {};

    if (status) query.status = status;
    if (sport && sport !== 'all') query.assignedSports = sport;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { coachId: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } }
      ];
    }

    const coaches = await Coach.find(query).sort({ createdAt: -1 });

    // Populate assigned batches & student counts for each coach
    const enriched = await Promise.all(coaches.map(async (c) => {
      const batches = await Batch.find({ coach: c._id });
      const studentCount = await Student.countDocuments({ coach: c._id, status: 'active' });
      return {
        ...c.toObject(),
        assignedBatchesList: batches,
        totalStudentsAssigned: studentCount
      };
    }));

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single coach details with assigned batches and students
// @route   GET /api/coaches/:id
// @access  Private
const getCoachById = async (req, res, next) => {
  try {
    const coach = await Coach.findById(req.params.id);
    if (!coach) {
      return res.status(404).json({ success: false, message: 'Coach not found' });
    }

    const batches = await Batch.find({ coach: coach._id });
    const students = await Student.find({ coach: coach._id, status: 'active' }).populate('batch', 'name');

    res.json({
      success: true,
      data: {
        ...coach.toObject(),
        batches,
        students
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create coach
// @route   POST /api/coaches
// @access  Private (Admins)
const createCoach = async (req, res, next) => {
  try {
    const { name, email, phone, specialization, experience, assignedSports, salary, avatar } = req.body;

    const count = await Coach.countDocuments();
    const coachId = `COACH-${String(count + 1).padStart(3, '0')}`;

    const coach = await Coach.create({
      coachId,
      name,
      email,
      phone,
      specialization,
      experience: experience || '3+ Years',
      assignedSports: Array.isArray(assignedSports) ? assignedSports : (assignedSports ? [assignedSports] : []),
      salary: salary || 0,
      avatar: avatar || `https://api.dicebear.com/7.x/personas/svg?seed=${coachId}`,
      status: 'active'
    });

    await AuditLog.create({
      entity: 'Coach',
      entityId: coach._id.toString(),
      action: 'CREATE',
      performedBy: req.user._id,
      performedByName: req.user.name,
      details: { coachId: coach.coachId, name: coach.name }
    });

    res.status(201).json({ success: true, message: 'Coach created successfully', data: coach });
  } catch (error) {
    next(error);
  }
};

// @desc    Update coach
// @route   PUT /api/coaches/:id
// @access  Private (Admins)
const updateCoach = async (req, res, next) => {
  try {
    const coach = await Coach.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!coach) {
      return res.status(404).json({ success: false, message: 'Coach not found' });
    }

    await AuditLog.create({
      entity: 'Coach',
      entityId: coach._id.toString(),
      action: 'UPDATE',
      performedBy: req.user._id,
      performedByName: req.user.name,
      details: { updatedFields: Object.keys(req.body) }
    });

    res.json({ success: true, message: 'Coach updated successfully', data: coach });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete coach
// @route   DELETE /api/coaches/:id
// @access  Private (Admins)
const deleteCoach = async (req, res, next) => {
  try {
    const coach = await Coach.findById(req.params.id);
    if (!coach) {
      return res.status(404).json({ success: false, message: 'Coach not found' });
    }

    // Check if coach has active batches
    const activeBatches = await Batch.countDocuments({ coach: coach._id, status: 'active' });
    if (activeBatches > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete coach who is assigned to ${activeBatches} active batch(es). Please reassign batches first.`
      });
    }

    coach.status = 'inactive';
    await coach.save();

    res.json({ success: true, message: 'Coach marked inactive successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCoaches,
  getCoachById,
  createCoach,
  updateCoach,
  deleteCoach
};
