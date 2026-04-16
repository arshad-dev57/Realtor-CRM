'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { authController } from '@/controllers/auth.controller';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

// ==================== ICONS ====================

function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function LeadsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <rect x="2" y="2" width="20" height="20" rx="2" />
      <line x1="8" y1="16" x2="8" y2="12" />
      <line x1="12" y1="16" x2="12" y2="8" />
      <line x1="16" y1="16" x2="16" y2="10" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

// ==================== NAVIGATION ITEMS ====================

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: <HomeIcon /> },
  { href: '/dashboard/users', label: 'Users', icon: <UsersIcon /> },
  { href: '/dashboard/realtors', label: 'Realtors', icon: <BuildingIcon /> },
  { href: '/dashboard/leads', label: 'Leads', icon: <LeadsIcon />, badge: 12 },
  { href: '/dashboard/lead-request', label: 'Lead Requests', icon: <BellIcon /> },
  { href: '/dashboard/properties', label: 'Properties', icon: <BuildingIcon /> },
  { href: '/dashboard/analytics', label: 'Analytics', icon: <ChartIcon /> },
];

// ==================== SIDEBAR COMPONENT ====================

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [userName, setUserName] = useState('Admin User');
  const [userRole, setUserRole] = useState('Administrator');
  const [userInitials, setUserInitials] = useState('AU');

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Get user data from localStorage
    const userData = authController.getUser();
    if (userData) {
      setUserName(userData.name || 'Admin User');
      setUserRole(userData.role === 'admin' ? 'Administrator' : 'User');
      const initials = userData.name?.split(' ').map((n: string) => n[0]).join('') || 'AU';
      setUserInitials(initials.toUpperCase());
    }
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = () => {
    authController.logout();
    router.push('/login');
  };

  const sidebarWidth = isMobile && !isOpen ? 0 : 240;

  return (
    <>
      {/* Hamburger Menu Button for Mobile */}
      {isMobile && !isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            top: '16px',
            left: '16px',
            zIndex: 60,
            background: '#537D96',
            border: 'none',
            borderRadius: '8px',
            padding: '10px',
            cursor: 'pointer',
            color: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      )}

      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 45
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          width: isOpen ? '240px' : '0',
          minHeight: '100vh',
          background: '#537D96',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 50,
          transition: 'width 0.3s ease',
          overflow: 'hidden',
          boxShadow: '2px 0 12px rgba(0,0,0,0.08)'
        }}
      >
        {isOpen && (
          <>
            {/* Logo Section */}
            <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#537D96" stroke="none">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#537D96" strokeWidth="2" />
                  </svg>
                </div>
                <div>
                  <div className="font-display" style={{ 
                    fontWeight: 700, 
                    fontSize: '16px', 
                    color: 'white', 
                    letterSpacing: '-0.01em' 
                  }}>
                    Realtor CRM
                  </div>
                  <div style={{ 
                    fontSize: '10px', 
                    color: 'rgba(255,255,255,0.6)', 
                    letterSpacing: '0.08em', 
                    textTransform: 'uppercase' 
                  }}>
                    Enterprise
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav style={{ flex: 1, padding: '20px 12px', overflowY: 'auto' }}>
              <div style={{ marginBottom: '24px' }}>
                <div style={{ 
                  fontSize: '10px', 
                  color: 'rgba(255,255,255,0.5)', 
                  letterSpacing: '0.1em', 
                  textTransform: 'uppercase', 
                  padding: '0 10px 10px', 
                  fontWeight: 600 
                }}>
                  Main Menu
                </div>
                {navItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                  return (
                    <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                      <div
                        className="nav-item"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          marginBottom: '4px',
                          color: isActive ? 'white' : 'rgba(255,255,255,0.7)',
                          background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          position: 'relative',
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)';
                            (e.currentTarget as HTMLElement).style.color = 'white';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            (e.currentTarget as HTMLElement).style.background = 'transparent';
                            (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)';
                          }
                        }}
                      >
                        {isActive && (
                          <div style={{
                            position: 'absolute',
                            left: '-12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '3px',
                            height: '40%',
                            background: 'white',
                            borderRadius: '0 2px 2px 0',
                          }} />
                        )}
                        <span style={{ flexShrink: 0 }}>{item.icon}</span>
                        <span style={{ 
                          fontSize: '13.5px', 
                          fontWeight: isActive ? 600 : 400, 
                          flex: 1 
                        }}>
                          {item.label}
                        </span>
                        {item.badge && (
                          <span style={{
                            background: 'white',
                            color: '#537D96',
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '12px',
                            minWidth: '22px',
                            textAlign: 'center',
                          }}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* System Section */}
              <div>
                <div style={{ 
                  fontSize: '10px', 
                  color: 'rgba(255,255,255,0.5)', 
                  letterSpacing: '0.1em', 
                  textTransform: 'uppercase', 
                  padding: '0 10px 10px', 
                  fontWeight: 600 
                }}>
                  System
                </div>
                <Link href="/dashboard/settings" style={{ textDecoration: 'none' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      marginBottom: '4px',
                      color: 'rgba(255,255,255,0.7)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)';
                      (e.currentTarget as HTMLElement).style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                      (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)';
                    }}
                  >
                    <span><SettingsIcon /></span>
                    <span style={{ fontSize: '13.5px', flex: 1 }}>Settings</span>
                  </div>
                </Link>
              </div>
            </nav>

            {/* User Profile & Logout */}
            <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              {/* User Profile */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)',
                marginBottom: '12px',
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#537D96',
                  flexShrink: 0,
                }}>
                  {userInitials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    fontSize: '13px', 
                    fontWeight: 600, 
                    color: 'white', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    whiteSpace: 'nowrap' 
                  }}>
                    {userName}
                  </div>
                  <div style={{ 
                    fontSize: '10px', 
                    color: 'rgba(255,255,255,0.6)' 
                  }}>
                    {userRole}
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <div
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  color: '#fecaca',
                  background: 'rgba(239,68,68,0.1)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.2)';
                  (e.currentTarget as HTMLElement).style.color = '#fca5a5';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)';
                  (e.currentTarget as HTMLElement).style.color = '#fecaca';
                }}
              >
                <span><LogoutIcon /></span>
                <span style={{ fontSize: '13px', fontWeight: 500, flex: 1 }}>Logout</span>
              </div>
            </div>
          </>
        )}
      </aside>

      {/* Adjust main content margin */}
      <style jsx global>{`
        main {
          margin-left: ${sidebarWidth}px;
          transition: margin-left 0.3s ease;
        }
        @media (max-width: 1024px) {
          main {
            margin-left: ${isOpen ? sidebarWidth : 0}px;
          }
        }
      `}</style>
    </>
  );
}