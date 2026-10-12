import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { 
  Sun, 
  Moon, 
  Menu, 
  X, 
  LogOut, 
  User, 
  History, 
  LayoutDashboard, 
  Sparkles, 
  ShieldAlert 
} from 'lucide-react';

export default function Navbar({ onNavigate, currentPage }) {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLinkClick = (page) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    handleLinkClick('landing');
  };

  return (
    <nav className="glass-panel" style={{
      position: 'sticky',
      top: '16px',
      margin: '16px 24px',
      padding: '12px 24px',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: '1px',
      borderRadius: '24px'
    }}>
      {/* Logo */}
      <div 
        onClick={() => handleLinkClick(isAuthenticated ? 'dashboard' : 'landing')} 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          cursor: 'pointer',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 700,
          fontSize: '20px',
          background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}
      >
        <Sparkles size={24} color="#7C3AED" style={{ strokeWidth: 2.5 }} />
        <span>QuizGenius AI</span>
      </div>

      {/* Desktop Menu */}
      <div style={{ display: 'none', alignItems: 'center', gap: '20px', '@media (min-width: 768px)': { display: 'flex' } } /* inline fallback handled inside return JSX structure below */ } className="desktop-menu-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {isAuthenticated && (
            <>
              <button 
                onClick={() => handleLinkClick('dashboard')}
                className={currentPage === 'dashboard' ? 'active-nav-link' : ''}
                style={navLinkStyle(currentPage === 'dashboard')}
              >
                <LayoutDashboard size={16} />
                Dashboard
              </button>
              <button 
                onClick={() => handleLinkClick('generate')}
                className={currentPage === 'generate' ? 'active-nav-link' : ''}
                style={navLinkStyle(currentPage === 'generate')}
              >
                <Sparkles size={16} />
                Create Quiz
              </button>
              <button 
                onClick={() => handleLinkClick('history')}
                className={currentPage === 'history' ? 'active-nav-link' : ''}
                style={navLinkStyle(currentPage === 'history')}
              >
                <History size={16} />
                History
              </button>
              {user?.is_admin && (
                <button 
                  onClick={() => handleLinkClick('admin')}
                  className={currentPage === 'admin' ? 'active-nav-link' : ''}
                  style={navLinkStyle(currentPage === 'admin', true)}
                >
                  <ShieldAlert size={16} />
                  Admin
                </button>
              )}
            </>
          )}
        </div>

        {/* Right side items */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.05)',
              width: '40px',
              height: '40px'
            }}
          >
            {theme === 'dark' ? <Sun size={20} color="#F59E0B" /> : <Moon size={20} color="#4F46E5" />}
          </button>

          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(79, 70, 229, 0.1)',
                  border: '1px solid rgba(79, 70, 229, 0.2)',
                  borderRadius: '30px',
                  padding: '6px 14px',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                <User size={16} />
                <span>{user?.name}</span>
              </button>

              {dropdownOpen && (
                <div className="glass-panel" style={{
                  position: 'absolute',
                  right: 0,
                  top: '48px',
                  minWidth: '180px',
                  padding: '8px 0',
                  borderRadius: '12px',
                  boxShadow: 'var(--shadow)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  zIndex: 200
                }}>
                  <button 
                    onClick={() => handleLinkClick('profile')}
                    style={dropdownItemStyle}
                  >
                    <User size={14} /> Profile
                  </button>
                  <div style={{ height: '1px', backgroundColor: 'var(--card-border)', margin: '4px 0' }} />
                  <button 
                    onClick={handleLogout}
                    style={{ ...dropdownItemStyle, color: 'var(--error)' }}
                  >
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button 
                onClick={() => handleLinkClick('login')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-main)',
                  fontWeight: 500,
                  cursor: 'pointer',
                  padding: '8px 16px'
                }}
              >
                Log In
              </button>
              <button 
                onClick={() => handleLinkClick('register')}
                className="btn-ripple glow-effect"
                style={{
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                  border: 'none',
                  borderRadius: '24px',
                  color: '#FFF',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '10px 20px',
                  boxShadow: '0 4px 15px rgba(124, 58, 237, 0.3)'
                }}
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Button */}
      <div className="mobile-menu-toggle" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Mobile Theme Toggle */}
        <button 
          onClick={toggleTheme}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.05)',
            width: '36px',
            height: '36px'
          }}
        >
          {theme === 'dark' ? <Sun size={18} color="#F59E0B" /> : <Moon size={18} color="#4F46E5" />}
        </button>

        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="glass-panel" style={{
          position: 'absolute',
          top: '76px',
          left: 0,
          right: 0,
          padding: '20px',
          borderRadius: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          zIndex: 90
        }}>
          {isAuthenticated ? (
            <>
              <div style={{ borderBottom: '1px solid var(--card-border)', paddingBottom: '12px' }}>
                <span style={{ fontWeight: 600, fontSize: '16px', color: 'var(--text-main)' }}>{user?.name}</span>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user?.email}</div>
              </div>
              <button onClick={() => handleLinkClick('dashboard')} style={mobileNavLinkStyle(currentPage === 'dashboard')}>
                <LayoutDashboard size={18} /> Dashboard
              </button>
              <button onClick={() => handleLinkClick('generate')} style={mobileNavLinkStyle(currentPage === 'generate')}>
                <Sparkles size={18} /> Create Quiz
              </button>
              <button onClick={() => handleLinkClick('history')} style={mobileNavLinkStyle(currentPage === 'history')}>
                <History size={18} /> History
              </button>
              <button onClick={() => handleLinkClick('profile')} style={mobileNavLinkStyle(currentPage === 'profile')}>
                <User size={18} /> Profile
              </button>
              {user?.is_admin && (
                <button onClick={() => handleLinkClick('admin')} style={mobileNavLinkStyle(currentPage === 'admin', true)}>
                  <ShieldAlert size={18} /> Admin Panel
                </button>
              )}
              <div style={{ height: '1px', backgroundColor: 'var(--card-border)' }} />
              <button 
                onClick={handleLogout}
                style={{
                  ...mobileNavLinkStyle(false),
                  color: 'var(--error)',
                  justifyContent: 'center',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '12px',
                  padding: '10px'
                }}
              >
                <LogOut size={18} /> Logout
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                onClick={() => handleLinkClick('login')}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--card-border)',
                  borderRadius: '12px',
                  color: 'var(--text-main)',
                  padding: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Log In
              </button>
              <button 
                onClick={() => handleLinkClick('register')}
                style={{
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#FFF',
                  padding: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      )}

      {/* Inline styles for media query fallbacks handled by React render */}
      <style>{`
        .desktop-menu-container {
          display: flex !important;
          align-items: center;
          gap: 24px;
        }
        .mobile-menu-toggle {
          display: none !important;
        }
        @media (max-width: 768px) {
          .desktop-menu-container {
            display: none !important;
          }
          .mobile-menu-toggle {
            display: flex !important;
          }
        }
      `}</style>
    </nav>
  );
}

// Nav styles helpers
const navLinkStyle = (isActive, isAdmin = false) => ({
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '14px',
  color: isActive 
    ? (isAdmin ? '#EC4899' : 'var(--primary)') 
    : 'var(--text-muted)',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 12px',
  borderRadius: '8px',
  backgroundColor: isActive ? 'rgba(79, 70, 229, 0.05)' : 'transparent',
  transition: 'all 0.2s ease',
  position: 'relative'
});

const mobileNavLinkStyle = (isActive, isAdmin = false) => ({
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '15px',
  color: isActive 
    ? (isAdmin ? '#EC4899' : 'var(--primary)') 
    : 'var(--text-main)',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '10px 14px',
  borderRadius: '10px',
  textAlign: 'left',
  width: '100%',
  backgroundColor: isActive ? 'rgba(79, 70, 229, 0.05)' : 'transparent'
});

const dropdownItemStyle = {
  background: 'transparent',
  border: 'none',
  padding: '10px 16px',
  textAlign: 'left',
  cursor: 'pointer',
  color: 'var(--text-main)',
  fontWeight: 500,
  fontSize: '14px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  width: '100%',
  transition: 'background 0.2s',
  borderRadius: '6px',
  ':hover': {
    backgroundColor: 'rgba(255,255,255,0.05)'
  }
};
