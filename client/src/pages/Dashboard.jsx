import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/common/StatCard';
import QuickStudentModal from '../components/common/QuickStudentModal';
import QuickPaymentModal from '../components/common/QuickPaymentModal';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Trophy,
  Layers,
  IndianRupee,
  AlertCircle,
  CalendarCheck,
  TrendingUp,
  UserPlus,
  CreditCard,
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

const COLORS = ['#4D83D7', '#22A477', '#E5A23A', '#DE5965', '#9333EA', '#06B6D4', '#F97316', '#64748B'];

const Dashboard = () => {
  const { user, isCoach } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  // Quick Action Modal states
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/stats');
      if (res.data.success) {
        setStats(res.data.stats);
        setCharts(res.data.charts);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Listen to custom event for data refreshes
    const handleRefresh = () => fetchDashboardData();
    window.addEventListener('athletix_data_updated', handleRefresh);
    return () => window.removeEventListener('athletix_data_updated', handleRefresh);
  }, []);

  if (loading && !stats) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ fontSize: '1.1rem', color: 'var(--secondary-text)', fontWeight: 600 }}>
          Loading real-time sports academy analytics...
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Welcome Banner & Quick Action Buttons */}
      <div
        className="neu-card"
        style={{
          padding: '24px 28px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--dark-text)' }}>
              Hello, {user?.name}
            </h2>
            <span className="badge badge-info">{user?.role?.replace('_', ' ')}</span>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--secondary-text)', marginTop: 4 }}>
            Here is the live operational and financial status of Athletix Academy.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {!isCoach && (
            <>
              <button
                type="button"
                className="btn-primary"
                onClick={() => setIsStudentModalOpen(true)}
              >
                <UserPlus size={18} /> Add Student
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsPaymentModalOpen(true)}
              >
                <CreditCard size={18} /> Collect Fees
              </button>
            </>
          )}

          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate('/attendance')}
          >
            <CalendarCheck size={18} /> Mark Attendance
          </button>

          {!isCoach && (
            <>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate('/batches')}
              >
                <Layers size={18} /> Add Batch
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate('/reports')}
              >
                <FileText size={18} /> View Reports
              </button>
            </>
          )}
        </div>
      </div>

      {/* Primary KPI Stat Cards (Calculated from Real MongoDB records) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
        <StatCard
          title="Total Students"
          value={stats?.totalStudents || 0}
          subtitle={`${stats?.activeStudents || 0} Active • ${stats?.inactiveStudents || 0} Inactive`}
          icon={Users}
          color="blue"
        />

        <StatCard
          title="Monthly Revenue"
          value={`₹${(stats?.monthlyRevenue || 0).toLocaleString()}`}
          subtitle="Realized this month"
          icon={IndianRupee}
          color="green"
        />

        <StatCard
          title="Pending Fees"
          value={`₹${(stats?.pendingFees || 0).toLocaleString()}`}
          subtitle={`Overdue: ₹${(stats?.overdueFees || 0).toLocaleString()}`}
          icon={AlertCircle}
          color={stats?.overdueFees > 0 ? 'red' : 'yellow'}
        />

        <StatCard
          title="Today's Attendance"
          value={`${stats?.attendancePercentage || 0}%`}
          subtitle={`${stats?.todayAttendance || 0} / ${stats?.todayTotal || 0} Athletes present`}
          icon={CalendarCheck}
          color="blue"
        />
      </div>

      {/* Secondary Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
        <div className="neu-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="neu-inset" style={{ width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Trophy size={22} color="var(--primary-blue)" />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--secondary-text)', fontWeight: 600 }}>ACTIVE COACHES</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--dark-text)' }}>{stats?.totalCoaches || 0}</div>
          </div>
        </div>

        <div className="neu-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="neu-inset" style={{ width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Layers size={22} color="var(--primary-blue)" />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--secondary-text)', fontWeight: 600 }}>TRAINING BATCHES</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--dark-text)' }}>{stats?.totalBatches || 0}</div>
          </div>
        </div>

        <div className="neu-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="neu-inset" style={{ width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={22} color="var(--success)" />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--secondary-text)', fontWeight: 600 }}>OVERDUE DUES</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--danger)' }}>₹{(stats?.overdueFees || 0).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: 24 }}>
        {/* Monthly Collection Trends (BarChart) */}
        <div className="neu-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--dark-text)' }}>
                Fee Collection Analytics
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--secondary-text)' }}>
                Monthly fee collection vs total invoiced (Last 6 Months)
              </p>
            </div>
          </div>

          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={charts?.monthlyCollection || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(166, 180, 200, 0.4)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--secondary-text)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--secondary-text)" fontSize={12} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip
                  formatter={(value) => [`₹${Number(value).toLocaleString()}`, '']}
                  contentStyle={{ backgroundColor: 'var(--card-bg)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.8)', boxShadow: 'var(--shadow-raised-sm)' }}
                />
                <Legend />
                <Bar dataKey="collected" name="Collected Revenue" fill="#4D83D7" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expected" name="Total Invoiced" fill="#BCCDE2" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sport-wise Student Distribution (PieChart) */}
        <div className="neu-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--dark-text)' }}>
                Sport-wise Enrollment
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--secondary-text)' }}>
                Active athletes distributed by sports discipline
              </p>
            </div>
          </div>

          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={charts?.sportDistribution || []}
                  dataKey="students"
                  nameKey="sport"
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  innerRadius={50}
                  paddingAngle={3}
                  label={({ sport, percent }) => `${sport} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {(charts?.sportDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [`${val} Athletes`, name]}
                  contentStyle={{ backgroundColor: 'var(--card-bg)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.8)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Second Row Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: 24 }}>
        {/* Batch Capacity BarChart */}
        <div className="neu-card" style={{ padding: 24 }}>
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--dark-text)' }}>
              Batch Capacity Utilization
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--secondary-text)' }}>
              Current enrolled athletes vs maximum batch limit
            </p>
          </div>

          <div style={{ width: '100%', height: 270 }}>
            <ResponsiveContainer>
              <BarChart data={charts?.batchDistribution || []} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(166, 180, 200, 0.4)" horizontal={false} />
                <XAxis type="number" stroke="var(--secondary-text)" fontSize={12} />
                <YAxis dataKey="batch" type="category" stroke="var(--secondary-text)" fontSize={11} width={130} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', borderRadius: 12 }} />
                <Legend />
                <Bar dataKey="enrolled" name="Enrolled" fill="#22A477" radius={[0, 4, 4, 0]} />
                <Bar dataKey="capacity" name="Max Capacity" fill="#CCD7E7" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Attendance Analytics (AreaChart) */}
        <div className="neu-card" style={{ padding: 24 }}>
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--dark-text)' }}>
              Attendance Turnout Trend
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--secondary-text)' }}>
              Athletes present daily across all training sessions
            </p>
          </div>

          <div style={{ width: '100%', height: 270 }}>
            <ResponsiveContainer>
              <AreaChart data={charts?.attendanceTrends || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="attendanceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4D83D7" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#4D83D7" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(166, 180, 200, 0.4)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--secondary-text)" fontSize={12} />
                <YAxis stroke="var(--secondary-text)" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', borderRadius: 12 }} />
                <Area type="monotone" dataKey="present" stroke="#4D83D7" strokeWidth={3} fillOpacity={1} fill="url(#attendanceGrad)" name="Present Athletes" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Global Quick Action Modals */}
      <QuickStudentModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        onStudentAdded={() => fetchDashboardData()}
      />

      <QuickPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentRecorded={() => fetchDashboardData()}
      />
    </div>
  );
};

export default Dashboard;
