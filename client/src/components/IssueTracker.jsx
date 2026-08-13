import React, { useState, useEffect } from 'react';
import {
  Plus,
  MapPin,
  Search,
  Filter,
  User,
  Phone,
  Briefcase,
  Info,
  Calendar,
  CheckCircle,
  FileImage,
  LocateFixed,
  Loader2
} from 'lucide-react';

const API_BASE = 'https://smart-bharat-civic-companion-rk6z.onrender.com';

// ── Status Timeline component ──────────────────────────────────────────────────
const STAGES = ['Reported', 'Under Review', 'Assigned', 'Resolved'];

function StatusTimeline({ status }) {
  const stageIndex = {
    Pending: 0,
    'In Progress': 2,
    Resolved: 3
  };
  const currentIndex = stageIndex[status] ?? 0;

  return (
    <div style={{ marginTop: '0.75rem' }}>
      <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
        Resolution Timeline
      </h4>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        {STAGES.map((stage, idx) => {
          const done = idx <= currentIndex;
          const isActive = idx === currentIndex;
          return (
            <React.Fragment key={stage}>
              {/* Node */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', flex: '0 0 auto' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  border: `2px solid ${done ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                  backgroundColor: done ? (isActive ? 'var(--accent-primary)' : 'var(--accent-ashoka-glow)') : 'var(--bg-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s',
                  boxShadow: isActive ? '0 0 0 3px var(--accent-ashoka-glow)' : 'none'
                }}>
                  {done && <CheckCircle size={13} style={{ color: 'var(--accent-primary)' }} />}
                </div>
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--accent-primary)' : done ? 'var(--text-secondary)' : 'var(--text-muted)',
                  whiteSpace: 'nowrap'
                }}>
                  {stage}
                </span>
              </div>
              {/* Connector bar */}
              {idx < STAGES.length - 1 && (
                <div style={{
                  flex: 1,
                  height: '2px',
                  backgroundColor: idx < currentIndex ? 'var(--accent-primary)' : 'var(--border-color)',
                  transition: 'background-color 0.3s',
                  marginBottom: '20px'
                }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────────
export default function IssueTracker() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Roads & Traffic',
    location: '',
    citizenName: '',
    citizenContact: '',
    city: 'New Delhi',
    lat: '',
    lng: ''
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const citiesCoordinates = {
    'New Delhi':  { lat: 28.6139, lng: 77.2090 },
    'Mumbai':     { lat: 19.0760, lng: 72.8777 },
    'Bengaluru':  { lat: 12.9716, lng: 77.5946 },
    'Kolkata':    { lat: 22.5726, lng: 88.3639 },
    'Chennai':    { lat: 13.0827, lng: 80.2707 }
  };

  // ── Fetch issues ──────────────────────────────────────────────────────────────
  const fetchIssues = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/issues`);
      if (res.ok) {
        const data = await res.json();
        setIssues(data);
        if (data.length > 0 && !selectedIssue) {
          setSelectedIssue(data[0]);
        }
      }
    } catch (err) {
      console.error('Error loading issues:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchIssues(); }, []);

  // ── Form helpers ──────────────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // NEW FEATURE 1 — Browser Geolocation auto-tag
  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData(prev => ({
          ...prev,
          lat: pos.coords.latitude.toFixed(6),
          lng: pos.coords.longitude.toFixed(6),
          location: prev.location || 'Current Location (GPS tagged)'
        }));
        setGeoLoading(false);
      },
      (err) => {
        console.error('Geolocation error:', err);
        alert('Could not fetch location. Please check browser permissions and try again.');
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // ── Submit form ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Use GPS lat/lng if captured, else fall back to city preset
    const coord = (formData.lat && formData.lng)
      ? { lat: parseFloat(formData.lat), lng: parseFloat(formData.lng) }
      : (citiesCoordinates[formData.city] || { lat: 28.61, lng: 77.20 });

    const requestBody = new FormData();
    requestBody.append('title', formData.title);
    requestBody.append('description', formData.description);
    requestBody.append('category', formData.category);
    requestBody.append('location', `${formData.location}, ${formData.city}`);
    requestBody.append('citizenName', formData.citizenName);
    requestBody.append('citizenContact', formData.citizenContact);
    requestBody.append('lat', coord.lat);
    requestBody.append('lng', coord.lng);

    const fileInput = document.getElementById('file-attachment');
    if (fileInput && fileInput.files[0]) {
      requestBody.append('attachment', fileInput.files[0]);
    }

    try {
      // FIX: correct URL and variable reference
      const response = await fetch(`${API_BASE}/api/issues`, {
        method: 'POST',
        body: requestBody
      });

      if (response.ok) {
        const newIssue = await response.json();
        setIssues(prev => [newIssue, ...prev]);
        setSelectedIssue(newIssue);
        setShowForm(false);
        setFormData({
          title: '', description: '', category: 'Roads & Traffic',
          location: '', citizenName: '', citizenContact: '',
          city: 'New Delhi', lat: '', lng: ''
        });
      } else {
        throw new Error('Server rejected the complaint submission.');
      }
    } catch (err) {
      console.error('Error logging issue:', err);
      alert('Failed to submit issue. Please try again.');
    }
  };

  // ── SVG Map helpers ───────────────────────────────────────────────────────────
  const getSvgCoords = (lat, lng) => {
    const mapWidth = 400, mapHeight = 450;
    const minLng = 68.0, maxLng = 98.0;
    const minLat = 8.0,  maxLat = 38.0;
    const x = ((lng - minLng) / (maxLng - minLng)) * mapWidth;
    const y = mapHeight - (((lat - minLat) / (maxLat - minLat)) * mapHeight);
    return { x, y };
  };

  // ── Filtering ─────────────────────────────────────────────────────────────────
  const filteredIssues = issues.filter(issue => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      issue.title.toLowerCase().includes(q) ||
      issue.location.toLowerCase().includes(q) ||
      issue.category.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'All' || issue.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>
            Civic Issue Tracker
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
            Report issues in your locality and track resolution by public departments.
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          <Plus size={18} />
          <span>Report New Issue</span>
        </button>
      </div>

      {/* Two-column grid */}
      <div className="grid-dashboard">

        {/* ── Left Column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>

          {showForm ? (
            /* ── Report Form ── */
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)' }}>Report a New Civic Issue</h3>
                <button onClick={() => setShowForm(false)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Cancel</button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Issue Category</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} className="form-select">
                    <option value="Roads & Traffic">Roads & Traffic (Potholes, blockages)</option>
                    <option value="Water Supply">Water Supply (Leakage, contaminated water)</option>
                    <option value="Sanitation & Waste">Sanitation & Waste (Garbage, drain overflow)</option>
                    <option value="Street Lighting">Street Lighting (Bulb repair, wiring)</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Title / Subject</label>
                  <input type="text" name="title" value={formData.title} onChange={handleInputChange}
                    placeholder="Short summary of the issue" className="form-input" required />
                </div>

                <div className="form-group">
                  <label className="form-label">Detailed Description</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange}
                    placeholder="Provide details about the issue, severity, and duration..." className="form-textarea" required />
                </div>

                {/* City + Location row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <select name="city" value={formData.city} onChange={handleInputChange} className="form-select">
                      <option>New Delhi</option>
                      <option>Mumbai</option>
                      <option>Bengaluru</option>
                      <option>Kolkata</option>
                      <option>Chennai</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Specific Street Address</label>
                    <input type="text" name="location" value={formData.location} onChange={handleInputChange}
                      placeholder="e.g. Opposite Sector 4 Bus Stop" className="form-input" required />
                  </div>
                </div>

                {/* NEW FEATURE 1 — Geolocation button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button type="button" onClick={handleGeolocate} className="btn btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', fontSize: '0.85rem' }}
                    disabled={geoLoading}>
                    {geoLoading
                      ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      : <LocateFixed size={16} style={{ color: 'var(--accent-primary)' }} />}
                    <span>{geoLoading ? 'Locating...' : 'Auto-tag My GPS Location'}</span>
                  </button>
                  {formData.lat && formData.lng && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <CheckCircle size={13} /> GPS tagged ({parseFloat(formData.lat).toFixed(4)}, {parseFloat(formData.lng).toFixed(4)})
                    </span>
                  )}
                </div>

                {/* Name + Contact row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">Your Name</label>
                    <input type="text" name="citizenName" value={formData.citizenName} onChange={handleInputChange} className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact Number (Optional)</label>
                    <input type="tel" name="citizenContact" value={formData.citizenContact} onChange={handleInputChange}
                      placeholder="+91 XXXXX XXXXX" className="form-input" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Attach Photo (Optional)</label>
                  <label htmlFor="file-attachment" style={{
                    border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)',
                    padding: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '0.5rem', cursor: 'pointer', backgroundColor: 'var(--bg-tertiary)'
                  }}>
                    <FileImage size={18} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Click to upload incident photo</span>
                  </label>
                  <input type="file" id="file-attachment" accept="image/*" style={{ display: 'none' }} />
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Submit Complaint</button>
              </form>
            </div>

          ) : (
            /* ── List + Filters ── */
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Filters row */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                  <input type="text" placeholder="Search complaints..."
                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="form-input" style={{ paddingLeft: '2.25rem', height: '40px' }} />
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  backgroundColor: 'var(--bg-tertiary)', padding: '0 0.75rem',
                  borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', height: '40px'
                }}>
                  <Filter size={14} style={{ color: 'var(--text-muted)' }} />
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{
                    border: 'none', backgroundColor: 'transparent', color: 'var(--text-primary)',
                    fontFamily: 'var(--font-primary)', fontSize: '0.85rem', fontWeight: 600, outline: 'none', cursor: 'pointer'
                  }}>
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>

              {/* FIX 3 — list container: padding-top added so first card is never clipped */}
              <div style={{
                maxHeight: '420px', overflowY: 'auto',
                border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)',
                paddingTop: '2px'            /* prevents top-border clip on first row */
              }}>
                {loading ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Fetching issues...</div>
                ) : filteredIssues.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No matching complaints found.</div>
                ) : (
                  filteredIssues.map((issue) => (
                    <div key={issue.id} onClick={() => setSelectedIssue(issue)}
                      style={{
                        padding: '0.9rem 1rem',
                        borderBottom: '1px solid var(--border-light)',
                        cursor: 'pointer',
                        backgroundColor: selectedIssue?.id === issue.id ? 'var(--bg-tertiary)' : 'transparent',
                        transition: 'background-color 0.15s',
                        display: 'flex', flexDirection: 'column', gap: '0.25rem'
                      }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{issue.id}</span>
                        <span className={`badge badge-${issue.status === 'In Progress' ? 'progress' : issue.status.toLowerCase()}`}>
                          {issue.status}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>{issue.title}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <MapPin size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} /> {issue.location}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ── Detail drawer with NEW FEATURE 2 — Status Timeline ── */}
          {selectedIssue && !showForm && (
            <div className="glass-card" style={{ animation: 'slideUp var(--transition-fast)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>CIVIC COMPLAINT FILE</span>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '0.25rem', fontFamily: 'var(--font-display)' }}>{selectedIssue.title}</h3>
                </div>
                <span className={`badge badge-${selectedIssue.status === 'In Progress' ? 'progress' : selectedIssue.status.toLowerCase()}`}
                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}>
                  {selectedIssue.status}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* NEW FEATURE 2 — Status Timeline */}
                <StatusTimeline status={selectedIssue.status} />

                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Description</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{selectedIssue.description}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="grid-cols-2">
                  <div>
                    <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Location</h4>
                    <p style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <MapPin size={14} style={{ color: 'var(--accent-saffron)', flexShrink: 0 }} /> {selectedIssue.location}
                    </p>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Reporter</h4>
                    <p style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <User size={14} style={{ color: 'var(--text-muted)' }} /> {selectedIssue.citizenName}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="grid-cols-2">
                  <div>
                    <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Assigned Agency</h4>
                    <p style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Briefcase size={14} style={{ color: 'var(--accent-ashoka)' }} /> {selectedIssue.assignedTo}
                    </p>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Report Date</h4>
                    <p style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={14} style={{ color: 'var(--text-muted)' }} /> {new Date(selectedIssue.reportedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div style={{
                  backgroundColor: 'var(--bg-tertiary)', borderLeft: '4px solid var(--accent-ashoka)',
                  padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginTop: '0.25rem'
                }}>
                  <h4 style={{ fontSize: '0.8rem', color: 'var(--accent-ashoka)', fontWeight: 700, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Info size={12} /> Municipal Action Log
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{selectedIssue.notes}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Right Column: Map ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={18} style={{ color: 'var(--accent-saffron)' }} /> Live Map Viewer
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Complaints mapped geographically across primary centers. Click a node to inspect.
            </p>

            <div className="map-canvas-container" style={{ flex: 1 }}>
              <svg viewBox="0 0 400 450" className="map-svg" style={{ maxHeight: '400px' }}>
                {/* Outline of India */}
                <path
                  d="M170 30 L185 20 L210 20 L212 40 L220 50 L200 80 L230 110 L275 145 L290 148 L320 120 L350 125 L345 145 L320 160 L340 178 L310 182 L290 200 L285 220 L250 220 L252 230 L260 250 L220 280 L200 320 L195 380 L180 430 L160 380 L145 320 L115 260 L95 240 L70 230 L55 210 L50 170 L80 160 L100 165 L115 130 L120 100 L135 75 Z"
                  className="map-state"
                />
                {/* Grid lines */}
                {[90, 180, 270, 360].map(y => <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="var(--border-light)" strokeDasharray="5,5" />)}
                {[100, 200, 300].map(x => <line key={x} x1={x} y1="0" x2={x} y2="450" stroke="var(--border-light)" strokeDasharray="5,5" />)}
                {/* City labels */}
                <text x="150" y="115" fill="var(--text-muted)" fontSize="9" fontWeight="600">New Delhi</text>
                <text x="75"  y="248" fill="var(--text-muted)" fontSize="9" fontWeight="600">Mumbai</text>
                <text x="110" y="360" fill="var(--text-muted)" fontSize="9" fontWeight="600">Bengaluru</text>
                <text x="250" y="200" fill="var(--text-muted)" fontSize="9" fontWeight="600">Kolkata</text>
                <text x="165" y="340" fill="var(--text-muted)" fontSize="9" fontWeight="600">Chennai</text>
                {/* Issue pins */}
                {issues.map((issue) => {
                  const { x, y } = getSvgCoords(issue.lat, issue.lng);
                  const isSelected = selectedIssue?.id === issue.id;
                  const pinColor =
                    issue.status === 'Pending'     ? 'hsl(352,75%,55%)' :
                    issue.status === 'In Progress' ? 'hsl(40,90%,50%)'  :
                                                     'hsl(142,60%,40%)';
                  return (
                    <g key={issue.id} className="map-pin" onClick={() => setSelectedIssue(issue)}>
                      {issue.status !== 'Resolved' && (
                        <circle cx={x} cy={y} r={isSelected ? 14 : 9}
                          fill="none" stroke={pinColor} strokeWidth="2"
                          className="map-pin-pulse"
                          style={{ transformOrigin: `${x}px ${y}px` }}
                        />
                      )}
                      <circle cx={x} cy={y} r={isSelected ? 6 : 4.5}
                        fill={pinColor}
                        stroke={isSelected ? '#fff' : 'none'} strokeWidth="1.5"
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Legend */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem',
              marginTop: '1rem', borderTop: '1px solid var(--border-light)',
              paddingTop: '0.75rem', color: 'var(--text-secondary)'
            }}>
              {[
                { label: 'Pending',     color: 'hsl(352,75%,55%)' },
                { label: 'In Progress', color: 'hsl(40,90%,50%)' },
                { label: 'Resolved',    color: 'hsl(142,60%,40%)' }
              ].map(({ label, color }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color, display: 'inline-block' }} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
