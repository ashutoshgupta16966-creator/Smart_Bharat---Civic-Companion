import React from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  AlertTriangle, 
  FileText, 
  Sun, 
  Moon,
  ChevronLeft,
  ChevronRight,
  UserCheck
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, theme, toggleTheme }) {
  const [collapsed, setCollapsed] = React.useState(false);

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'chatbot', label: 'AI Companion', icon: MessageSquare },
    { id: 'issues', label: 'Civic Issue Tracker', icon: AlertTriangle },
    { id: 'docs', label: 'Document Assistant', icon: FileText }
  ];

  return (
    <aside className="sidebar-container" style={{
      width: collapsed ? '80px' : '280px',
      backgroundColor: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      transition: 'width var(--transition-normal)',
      position: 'relative',
      zIndex: 10
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '1.5rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justify-content: collapsed ? 'center' : 'space-between',
        borderBottom: '1px solid var(--border-color)',
        minHeight: '70px'
      }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🇮🇳</span>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '800', lineHeight: 1.2, fontFamily: 'var(--font-display)' }}>
                SMART BHARAT
              </h2>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.05em' }}>
                CIVIC COMPANION
              </span>
            </div>
          </div>
        )}
        {collapsed && <span style={{ fontSize: '1.75rem' }}>🇮🇳</span>}
        
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="btn-secondary"
          style={{
            width: '28px',
            height: '28px',
            borderRadius: 'var(--radius-sm)',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justify-content: 'center',
            cursor: 'pointer',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-tertiary)',
            color: 'var(--text-secondary)'
          }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav style={{ padding: '1rem 0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justify-content: collapsed ? 'center' : 'flex-start',
                gap: '0.85rem',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-primary)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.95rem',
                transition: 'all var(--transition-fast)',
                backgroundColor: isActive ? 'var(--accent-ashoka-glow)' : 'transparent',
                color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                textAlign: 'left'
              }}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={20} style={{ 
                color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
                transition: 'color var(--transition-fast)'
              }} />
              {!collapsed && <span>{item.label}</span>}
              {isActive && !collapsed && (
                <div style={{
                  marginLeft: 'auto',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-primary)'
                }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Settings & Theme switcher */}
      <div style={{
        padding: '1rem',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        {/* Theme Switcher Button */}
        <button
          onClick={toggleTheme}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justify-content: collapsed ? 'center' : 'space-between',
            gap: '0.5rem',
            padding: '0.65rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            cursor: 'pointer',
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-primary)',
            fontSize: '0.85rem',
            fontWeight: 500
          }}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
              <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
            </div>
          )}
          {collapsed ? (
            theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />
          ) : (
            <div style={{
              width: '32px',
              height: '18px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: theme === 'dark' ? 'var(--accent-primary)' : 'var(--text-muted)',
              position: 'relative',
              transition: 'background-color 0.2s'
            }}>
              <div style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                backgroundColor: 'white',
                position: 'absolute',
                top: '2px',
                left: theme === 'dark' ? '16px' : '2px',
                transition: 'left 0.2s'
              }} />
            </div>
          )}
        </button>

        {/* User Card */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: collapsed ? '0.25rem' : '0.5rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-tertiary)',
          border: '1px solid var(--border-light)',
          justifyContent: collapsed ? 'center' : 'flex-start'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--accent-saffron-glow)',
            color: 'var(--accent-saffron)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600,
            fontSize: '0.85rem'
          }}>
            <UserCheck size={16} />
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                Guest Citizen
              </p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                Aadhaar Verified
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
