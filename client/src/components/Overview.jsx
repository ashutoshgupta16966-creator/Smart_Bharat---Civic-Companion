import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  FileCheck,
  ArrowRight,
  TrendingUp,
  Megaphone,
  ChevronRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export default function Overview({ setActiveTab }) {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
  });
  const [categoryData, setCategoryData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/issues');
      if (res.ok) {
        const issues = await res.json();

        // Calculate status counts
        const total = issues.length;
        const pending = issues.filter(i => i.status === 'Pending').length;
        const inProgress = issues.filter(i => i.status === 'In Progress').length;
        const resolved = issues.filter(i => i.status === 'Resolved').length;

        setStats({ total, pending, inProgress, resolved });

        // Calculate category breakdowns
        const categories = {};
        issues.forEach(i => {
          categories[i.category] = (categories[i.category] || 0) + 1;
        });

        const catArray = Object.keys(categories).map(cat => ({
          name: cat,
          Complaints: categories[cat]
        }));
        setCategoryData(catArray);

        // Status Breakdown for Pie Chart
        setStatusData([
          { name: 'Pending', value: pending, color: '#ef4444' },
          { name: 'In Progress', value: inProgress, color: '#f59e0b' },
          { name: 'Resolved', value: resolved, color: '#22c55e' }
        ].filter(item => item.value > 0)); // Only show non-zero values

      }
    } catch (err) {
      console.error("Error fetching dashboard statistics", err);
    } finally {
      setLoading(false);
    }
  };
  const handleReportClick = () => {
    setStats(prev => ({
      ...prev,
      total: prev.total + 1
    }));
  };
  const handlePendingClick = () => {
    setStats(prev => ({
      ...prev,
      inProgress: prev.inProgress + 1
    }));
  };

  const handleResolvedClick = () => {
    setStats(prev => ({
      ...prev,
      resolved: prev.resolved + 1
    }));
  };
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const newsFeed = [
    {
      id: 1,
      tag: "UIDAI Notice",
      title: "Mandatory Aadhaar updates for cards older than 10 years extended",
      time: "2 hours ago",
      color: "var(--accent-saffron)"
    },
    {
      id: 2,
      tag: "BBMP Alert",
      title: "Night asphalt laying started on 12 arterial roads in East Bengaluru",
      time: "5 hours ago",
      color: "var(--accent-ashoka)"
    },
    {
      id: 3,
      tag: "Digital India",
      title: "E-shram card registration crossing 30 crore registrations nationwide",
      time: "1 day ago",
      color: "var(--accent-green)"
    }
  ];

  return (
    <div className="page-container">
      {/* Title block */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>
          Civic Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
          Welcome back! Review real-time status of civic complaints and public service applications.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid-cols-3" style={{ marginBottom: '2rem' }}>
        {/* Card 1: Total complaints */}
        <div
          className="glass-card stat-card"
          onClick={handleReportClick}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-info">
            <span className="stat-label">Reported Issues</span>
            <span className="stat-value">{loading ? '...' : stats.total}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
              <TrendingUp size={12} style={{ color: 'var(--accent-green)' }} /> Logged from your region
            </span>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--accent-ashoka-glow)', color: 'var(--accent-ashoka)' }}>
            <AlertCircle size={24} />
          </div>
        </div>

        {/* Card 2: Pending/In Progress */}
        <div
          className="glass-card stat-card"
          onClick={handlePendingClick}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-info">
            <span className="stat-label">Active / In Progress</span>
            <span className="stat-value">{loading ? '...' : stats.pending + stats.inProgress}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
              <Clock size={12} style={{ color: 'var(--accent-warning)' }} /> Pending field inspection
            </span>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--accent-saffron-glow)', color: 'var(--accent-saffron)' }}>
            <Clock size={24} />
          </div>
        </div>

        {/* Card 3: Resolved */}
        <div
          className="glass-card stat-card"
          onClick={handleResolvedClick}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-info">
            <span className="stat-label">Resolved Issues</span>
            <span className="stat-value" style={{ color: 'var(--accent-success)' }}>{loading ? '...' : stats.resolved}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
              <CheckCircle size={12} style={{ color: 'var(--accent-success)' }} /> Action completed
            </span>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--accent-green-glow)', color: 'var(--accent-green)' }}>
            <CheckCircle size={24} />
          </div>
        </div>
      </div>

      {/* Main Grid: Charts & Bulletins */}
      <div className="grid-dashboard" style={{ marginBottom: '2rem' }}>
        {/* Left Side: Charts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Chart 1: Categories Bar */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Issues Filed by Category
            </h3>
            <div style={{ width: '100%', height: 300 }}>
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>Loading chart...</div>
              ) : categoryData.length === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>No data available</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                    <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
                    <YAxis stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--bg-secondary)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    />
                    <Bar dataKey="Complaints" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} maxBarSize={45} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Two-Column Grid: Pie chart and Quick access */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }} className="grid-cols-2">
            {/* Status Breakdown Pie */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>
                Resolution Distribution
              </h3>
              <div style={{ width: '100%', height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {loading ? (
                  <div>Loading...</div>
                ) : statusData.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)' }}>No active data</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} iconSize={10} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Quick Actions Shortcuts */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>
                  Quick Citizens Portal
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                  Easily access AI-driven diagnostics and interactive portals.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button
                  onClick={() => setActiveTab('chatbot')}
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'space-between', padding: '0.65rem 1rem' }}
                >
                  <span style={{ fontSize: '0.9rem' }}>Ask AI Companion</span>
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => setActiveTab('docs')}
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'space-between', padding: '0.65rem 1rem' }}
                >
                  <span style={{ fontSize: '0.9rem' }}>Check Document Rules</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Bulletins & Circulars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Notifications Card */}
          <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Megaphone size={18} style={{ color: 'var(--accent-saffron)' }} /> Official Circulars
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
              {newsFeed.map((news) => (
                <div
                  key={news.id}
                  style={{
                    paddingBottom: '1.25rem',
                    borderBottom: '1px solid var(--border-light)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: news.color,
                      backgroundColor: 'var(--bg-tertiary)',
                      padding: '0.15rem 0.5rem',
                      borderRadius: 'var(--radius-sm)'
                    }}>
                      {news.tag}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{news.time}</span>
                  </div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    {news.title}
                  </h4>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '1.5rem' }}>
              <div style={{
                backgroundColor: 'var(--accent-saffron-glow)',
                border: '1px solid rgba(249, 115, 22, 0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                textAlign: 'center'
              }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-saffron)', fontWeight: 700, marginBottom: '0.25rem' }}>
                  PM-KISAN SAMMAN NIDHI
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  17th Installment credited to all eligible farmers. Check beneficiary status online.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
