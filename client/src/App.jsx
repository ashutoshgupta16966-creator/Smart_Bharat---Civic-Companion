import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Overview from './components/Overview.jsx';
import AIChatbot from './components/AIChatbot.jsx';
import IssueTracker from './components/IssueTracker.jsx';
import DocumentAssistant from './components/DocumentAssistant.jsx';
import { 
  Bell, 
  MapPin, 
  ShieldCheck, 
  Flame 
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [theme, setTheme] = useState('light');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Watch theme change and set document attributes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Clock update (IST/Local display)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'overview': return 'Command Center Overview';
      case 'chatbot': return 'AI Civic Companion';
      case 'issues': return 'Public Grievance Tracker';
      case 'docs': return 'Document Requirements Assistant';
      default: return 'Smart Bharat';
    }
  };

  return (
    <div className="app-container">
      {/* Top Tricolor Strip */}
      <div className="top-tricolor-bar">
        <div className="tricolor-saffron" />
        <div className="tricolor-white" />
        <div className="tricolor-green" />
      </div>

      {/* Navigation Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        theme={theme} 
        toggleTheme={toggleTheme} 
      />

      {/* Main Workspace Frame */}
      <div className="main-content">
        
        {/* Header App Bar */}
        <header className="app-header">
          <div className="header-title-container">
            <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
              {getPageTitle()}
            </h2>
            <span className="header-tagline">
              Digital India Initiative
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {/* Live Clock / Timer */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              borderRight: '1px solid var(--border-color)',
              paddingRight: '1rem'
            }}>
              <span style={{ fontWeight: 700 }}>IST (GMT+5:30)</span>
              <span style={{ fontFamily: 'monospace' }}>
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>

            {/* Verification Status Badge */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.35rem', 
              fontSize: '0.85rem', 
              color: 'var(--accent-success)',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              fontWeight: 600
            }}>
              <ShieldCheck size={14} />
              <span>Secure Gateway</span>
            </div>

            {/* Notification Bell */}
            <button 
              className="btn-secondary btn-icon"
              style={{ position: 'relative', width: '38px', height: '38px', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
              onClick={() => alert("Notification center: All municipal systems online. No new alerts.")}
            >
              <Bell size={16} />
              <span style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                width: '6px',
                height: '6px',
                backgroundColor: 'var(--accent-saffron)',
                borderRadius: '50%'
              }} />
            </button>
          </div>
        </header>

        {/* Dynamic Inner Page Loader */}
        <main style={{ flex: 1, overflowY: 'auto' }}>
          {activeTab === 'overview' && <Overview setActiveTab={setActiveTab} />}
          {activeTab === 'chatbot' && <AIChatbot />}
          {activeTab === 'issues' && <IssueTracker />}
          {activeTab === 'docs' && <DocumentAssistant />}
        </main>
        
      </div>
    </div>
  );
}
