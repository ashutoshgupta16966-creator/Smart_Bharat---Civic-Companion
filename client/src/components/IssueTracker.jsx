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
  FileImage
} from 'lucide-react';

export default function IssueTracker() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Roads & Traffic",
    location: "",
    citizenName: "",
    citizenContact: "",
    city: "New Delhi"
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const citiesCoordinates = {
    "New Delhi": { lat: 28.6139, lng: 77.2090 },
    "Mumbai": { lat: 19.0760, lng: 72.8777 },
    "Bengaluru": { lat: 12.9716, lng: 77.5946 },
    "Kolkata": { lat: 22.5726, lng: 88.3639 },
    "Chennai": { lat: 13.0827, lng: 80.2707 }
  };

  const fetchIssues = async () => {
    try {
      const res = await fetch('https://smart-bharat-civic-companion-rk6z.onrender.com/api/issues');
      if (res.ok) {
        const data = await res.json();
        setIssues(data);
        if (data.length > 0 && !selectedIssue) {
          setSelectedIssue(data[0]); // Select first issue by default
        }
      }
    } catch (err) {
      console.error("Error loading issues:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Choose coordinate based on selected city
    const coord = citiesCoordinates[formData.city] || { lat: 28.61, lng: 77.20 };

    const requestBody = new FormData();
    requestBody.append("title", formData.title);
    requestBody.append("description", formData.description);
    requestBody.append("category", formData.category);
    requestBody.append("location", `${formData.location}, ${formData.city}`);
    requestBody.append("citizenName", formData.citizenName);
    requestBody.append("citizenContact", formData.citizenContact);
    requestBody.append("lat", coord.lat);
    requestBody.append("lng", coord.lng);

    // Grab file from input
    const fileInput = document.getElementById("file-attachment");
    if (fileInput && fileInput.files[0]) {
      requestBody.append("attachment", fileInput.files[0]);
    }

    try {
      const response = await fetch('https://smart-bharat-civic-companion-rk6z.onrender.com/api/chat', {
        method: 'POST',
        body: requestBody
      });

      if (res.ok) {
        const newIssue = await res.json();
        setIssues(prev => [newIssue, ...prev]);
        setSelectedIssue(newIssue);
        setShowForm(false);
        setFormData({
          title: "",
          description: "",
          category: "Roads & Traffic",
          location: "",
          citizenName: "",
          citizenContact: "",
          city: "New Delhi"
        });
      }
    } catch (err) {
      console.error("Error logging issue:", err);
      alert("Failed to submit issue. Please try again.");
    }
  };

  // Convert Indian Geographic coordinates to local SVG viewBox (400x500)
  // India Bounds approx: Lng 68 to 98, Lat 8 to 38
  const getSvgCoords = (lat, lng) => {
    const mapWidth = 400;
    const mapHeight = 450;

    // Scaling formulas mapping Lat/Lng to SVG coordinates
    const minLng = 68.0;
    const maxLng = 98.0;
    const minLat = 8.0;
    const maxLat = 38.0;

    const x = ((lng - minLng) / (maxLng - minLng)) * mapWidth;
    // Y is inverted in SVG
    const y = mapHeight - (((lat - minLat) / (maxLat - minLat)) * mapHeight);

    return { x, y };
  };

  // Filter Issues
  const filteredIssues = issues.filter(issue => {
    const matchesSearch =
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "All" || issue.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="page-container">
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>
            Civic Issue Tracker
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
            Report issues in your locality and track the resolution steps taken by public departments.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={18} />
          <span>Report New Issue</span>
        </button>
      </div>

      {/* Grid: Form/Detail & Map split */}
      <div className="grid-dashboard">

        {/* Left Side: Form OR Issue list & Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {showForm ? (
            /* REPORT ISSUE FORM */
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)' }}>Report a New Civic Issue</h3>
                <button onClick={() => setShowForm(false)} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Cancel</button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Issue Category</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} className="form-select">
                    <option value="Roads & Traffic">Roads & Traffic (Potholes, blockages)</option>
                    <option value="Water Supply">Water Supply (Leakage, contaminated water)</option>
                    <option value="Sanitation & Waste">Sanitation & Waste (Garbage pileup, drain overflow)</option>
                    <option value="Street Lighting">Street Lighting (Bulb repair, wiring safety)</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Title / Subject</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Short summary of the issue"
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Detailed Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Provide details about the issue location, severity, and duration..."
                    className="form-textarea"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <select name="city" value={formData.city} onChange={handleInputChange} className="form-select">
                      <option value="New Delhi">New Delhi</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Bengaluru">Bengaluru</option>
                      <option value="Kolkata">Kolkata</option>
                      <option value="Chennai">Chennai</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Specific Street Address</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="e.g. Opposite Sector 4 Bus Stop"
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">Your Name</label>
                    <input
                      type="text"
                      name="citizenName"
                      value={formData.citizenName}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact Number (Optional)</label>
                    <input
                      type="tel"
                      name="citizenContact"
                      value={formData.citizenContact}
                      onChange={handleInputChange}
                      placeholder="+91 XXXXX XXXXX"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Attach Photo (Optional)</label>
                  <label
                    htmlFor="file-attachment"
                    style={{
                      border: '1px dashed var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer',
                      backgroundColor: 'var(--bg-tertiary)'
                    }}
                  >
                    <FileImage size={18} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Click to upload incident photo</span>
                  </label>
                  <input type="file" id="file-attachment" accept="image/*" style={{ display: 'none' }} />
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Submit Complaint</button>
              </form>
            </div>
          ) : (
            /* LIST & FILTERS */
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Search & Status Filters */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search complaints..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '2.25rem', height: '40px' }}
                  />
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: 'var(--bg-tertiary)',
                  padding: '0 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  height: '40px'
                }}>
                  <Filter size={14} style={{ color: 'var(--text-muted)' }} />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-primary)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>

              {/* Table / List */}
              <div style={{ maxHeight: '420px', overflowY: 'auto', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                {loading ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Fetching issues...</div>
                ) : filteredIssues.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No matching complaints found.</div>
                ) : (
                  filteredIssues.map((issue) => (
                    <div
                      key={issue.id}
                      onClick={() => setSelectedIssue(issue)}
                      style={{
                        padding: '1rem',
                        borderBottom: '1px solid var(--border-light)',
                        cursor: 'pointer',
                        backgroundColor: selectedIssue?.id === issue.id ? 'var(--bg-tertiary)' : 'transparent',
                        transition: 'background-color 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{issue.id}</span>
                        <span className={`badge badge-${issue.status.toLowerCase().replace(' ', '-')}`}>
                          {issue.status}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>{issue.title}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <MapPin size={12} style={{ color: 'var(--text-muted)' }} /> {issue.location}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* SELECTED ISSUE DETAILS DRAWER */}
          {selectedIssue && !showForm && (
            <div className="glass-card" style={{ animation: 'slideUp var(--transition-fast)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>CIVIC COMPLAINT FILE</span>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '0.25rem', fontFamily: 'var(--font-display)' }}>{selectedIssue.title}</h3>
                </div>
                <span className={`badge badge-${selectedIssue.status.toLowerCase().replace(' ', '-')}`} style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}>
                  {selectedIssue.status}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Description</h4>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{selectedIssue.description}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="grid-cols-2">
                  <div>
                    <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Location</h4>
                    <p style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <MapPin size={14} style={{ color: 'var(--accent-saffron)' }} /> {selectedIssue.location}
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
                  backgroundColor: 'var(--bg-tertiary)',
                  borderLeft: '4px solid var(--accent-ashoka)',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  marginTop: '0.5rem'
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

        {/* Right Side: Map & Command Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={18} style={{ color: 'var(--accent-saffron)' }} /> Live Map Viewer
            </h3>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Complaints mapped geographically across primary centers. Click a pulsing node to inspect.
            </p>

            <div className="map-canvas-container" style={{ flex: 1 }}>
              {/* Indian Geographic Map SVG representation */}
              <svg viewBox="0 0 400 450" className="map-svg" style={{ maxHeight: '400px' }}>
                {/* Simplified stylized outline of India */}
                <path
                  d="M170 30 L185 20 L210 20 L212 40 L220 50 L200 80 L230 110 L275 145 L290 148 L320 120 L350 125 L345 145 L320 160 L340 178 L310 182 L290 200 L285 220 L250 220 L252 230 L260 250 L220 280 L200 320 L195 380 L180 430 L160 380 L145 320 L115 260 L95 240 L70 230 L55 210 L50 170 L80 160 L100 165 L115 130 L120 100 L135 75 Z"
                  className="map-state"
                />

                {/* Grid Grid lines for command center feel */}
                <line x1="0" y1="90" x2="400" y2="90" stroke="var(--border-light)" strokeDasharray="5,5" />
                <line x1="0" y1="180" x2="400" y2="180" stroke="var(--border-light)" strokeDasharray="5,5" />
                <line x1="0" y1="270" x2="400" y2="270" stroke="var(--border-light)" strokeDasharray="5,5" />
                <line x1="0" y1="360" x2="400" y2="360" stroke="var(--border-light)" strokeDasharray="5,5" />
                <line x1="100" y1="0" x2="100" y2="450" stroke="var(--border-light)" strokeDasharray="5,5" />
                <line x1="200" y1="0" x2="200" y2="450" stroke="var(--border-light)" strokeDasharray="5,5" />
                <line x1="300" y1="0" x2="300" y2="450" stroke="var(--border-light)" strokeDasharray="5,5" />

                {/* Major Cities labels */}
                <text x="150" y="115" fill="var(--text-muted)" fontSize="9" fontWeight="600">New Delhi</text>
                <text x="75" y="248" fill="var(--text-muted)" fontSize="9" fontWeight="600">Mumbai</text>
                <text x="110" y="360" fill="var(--text-muted)" fontSize="9" fontWeight="600">Bengaluru</text>
                <text x="250" y="200" fill="var(--text-muted)" fontSize="9" fontWeight="600">Kolkata</text>
                <text x="165" y="340" fill="var(--text-muted)" fontSize="9" fontWeight="600">Chennai</text>

                {/* Render pins */}
                {issues.map((issue) => {
                  const { x, y } = getSvgCoords(issue.lat, issue.lng);
                  const isSelected = selectedIssue?.id === issue.id;

                  // Color codes based on status
                  const pinColor =
                    issue.status === 'Pending' ? 'hsl(352, 75%, 55%)' :
                      issue.status === 'In Progress' ? 'hsl(40, 90%, 50%)' :
                        'hsl(142, 60%, 40%)';

                  return (
                    <g
                      key={issue.id}
                      className="map-pin"
                      onClick={() => setSelectedIssue(issue)}
                    >
                      {/* Pulse ring for pending/progress nodes */}
                      {issue.status !== 'Resolved' && (
                        <circle
                          cx={x}
                          cy={y}
                          r={isSelected ? 14 : 9}
                          fill="none"
                          stroke={pinColor}
                          strokeWidth="2"
                          className="map-pin-pulse"
                          style={{
                            transformOrigin: `${x}px ${y}px`
                          }}
                        />
                      )}

                      {/* Main Node */}
                      <circle
                        cx={x}
                        cy={y}
                        r={isSelected ? 6 : 4.5}
                        fill={pinColor}
                        stroke={isSelected ? "#fff" : "none"}
                        strokeWidth="1.5"
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              marginTop: '1rem',
              borderTop: '1px solid var(--border-light)',
              paddingTop: '0.75rem',
              color: 'var(--text-secondary)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'hsl(352, 75%, 55%)', display: 'inline-block' }} />
                <span>Pending</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'hsl(40, 90%, 50%)', display: 'inline-block' }} />
                <span>In Progress</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'hsl(142, 60%, 40%)', display: 'inline-block' }} />
                <span>Resolved</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
