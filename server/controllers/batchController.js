const Batch = require('../models/Batch');
const Student = require('../models/Student');
const AuditLog = require('../models/AuditLog');

// @desc    Get all batches with enrolled student count & capacity
// @route   GET /api/batches
// @access  Private
const getBatches = async (req, res, next) => {
  try {
    const { search, sport, status } = req.query;
    const query = {};

    if (status) query.status = status;
    if (sport && sport !== 'all') query.sport = sport;
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // If coach role, show only their batches
    if (req.user.role === 'coach') {
      query.coach = req.user.coachProfile || req.user._id;
    }

    const batches = await Batch.find(query).populate('coach', 'name email phone avatar').sort({ createdAt: -1 });

    // Compute enrolled counts
    const enriched = await Promise.all(batches.map(async (b) => {
      const enrolledCount = await Student.countDocuments({ batch: b._id, status: 'active' });
      return {
        ...b.toObject(),
        enrolledCount,
        availableSlots: Math.max(0, b.maxCapacity - enrolledCount),
        isFull: enrolledCount >= b.maxCapacity
      };
    }));

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single batch with enrolled students
// @route   GET /api/batches/:id
// @access  Private
const getBatchById = async (req, res, next) => {
  try {
    const batch = await Batch.findById(req.params.id).populate('coach');
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    const students = await Student.find({ batch: batch._id, status: 'active' });

    res.json({
      success: true,
      data: {
        ...batch.toObject(),
        enrolledCount: students.length,
        availableSlots: Math.max(0, batch.maxCapacity - students.length),
        isFull: students.length >= batch.maxCapacity,
        students
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create batch
// @route   POST /api/batches
// @access  Private (Admins)
const createBatch = async (req, res, next) => {
  try {
    const { name, sport, coach, trainingDays, startTime, endTime, maxCapacity, monthlyFee } = req.body;

    const batch = await Batch.create({
      name,
      sport,
      coach,
      trainingDays: trainingDays || ['Monday', 'Wednesday', 'Friday'],
      startTime,
      endTime,
      maxCapacity: maxCapacity || 20,
      monthlyFee: monthlyFee || 2500,
      status: 'active'
    });

    await AuditLog.create({
      entity: 'Batch',
      entityId: batch._id.toString(),
      action: 'CREATE',
      performedBy: req.user._id,
      performedByName: req.user.name,
      details: { batchName: batch.name, sport: batch.sport }
    });

    res.status(201).json({ success: true, message: 'Batch created successfully', data: batch });
  } catch (error) {
    next(error);
  }
};

// @desc    Update batch
// @route   PUT /api/batches/:id
// @access  Private (Admins)
const updateBatch = async (req, res, next) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    // Check if new max capacity is less than current enrolled
    if (req.body.maxCapacity) {
      const activeEnrolled = await Student.countDocuments({ batch: batch._id, status: 'active' });
      if (req.body.maxCapacity < activeEnrolled) {
        return res.status(400).json({
          success: false,
          message: `Cannot reduce capacity to ${req.body.maxCapacity}. There are already ${activeEnrolled} active students enrolled.`
        });
      }
    }

    const updated = await Batch.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('coach');

    res.json({ success: true, message: 'Batch updated successfully', data: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete batch
// @route   DELETE /api/batches/:id
// @access  Private (Admins)
const deleteBatch = async (req, res, next) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    const enrolled = await Student.countDocuments({ batch: batch._id, status: 'active' });
    if (enrolled > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete batch with ${enrolled} active students enrolled. Reassign students first.`
      });
    }

    batch.status = 'inactive';
    await batch.save();

    res.json({ success: true, message: 'Batch marked inactive successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBatches,
  getBatchById,
  createBatch,
  updateBatch,
  deleteBatch
};
