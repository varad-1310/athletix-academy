const Attendance = require('../models/Attendance');

/**
 * Calculates attendance statistics for a student
 */
const getStudentAttendanceStats = async (studentId) => {
  const attendances = await Attendance.find({ 'records.student': studentId }).lean();
  
  let totalSessions = 0;
  let presentCount = 0;
  let absentCount = 0;
  let lateCount = 0;
  const history = [];

  attendances.forEach(att => {
    const rec = att.records.find(r => r.student.toString() === studentId.toString());
    if (rec) {
      totalSessions++;
      if (rec.status === 'present') presentCount++;
      else if (rec.status === 'absent') absentCount++;
      else if (rec.status === 'late') {
        lateCount++;
        presentCount += 0.5; // Optional weight for late
      }
      history.push({
        date: att.date,
        sport: att.sport,
        batch: att.batch,
        status: rec.status,
        remark: rec.remark
      });
    }
  });

  const percentage = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 100;

  return {
    totalSessions,
    presentCount: Math.floor(presentCount),
    absentCount,
    lateCount,
    percentage,
    history: history.sort((a, b) => new Date(b.date) - new Date(a.date))
  };
};

module.exports = {
  getStudentAttendanceStats
};
