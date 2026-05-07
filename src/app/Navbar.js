'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  // Check for logged in user on mount and when localStorage changes
  useEffect(() => {
    const checkUser = () => {
      const userData = localStorage.getItem('user');
      console.log('Navbar checking user:', userData);
      if (userData && userData !== 'undefined') {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          console.log('User set in navbar:', parsedUser);
        } catch (e) {
          console.error('Error parsing user data:', e);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    checkUser();

    // Listen for storage events (for multi-tab support)
    window.addEventListener('storage', checkUser);
    
    // Listen for custom login event
    window.addEventListener('login', checkUser);

    return () => {
      window.removeEventListener('storage', checkUser);
      window.removeEventListener('login', checkUser);
    };
  }, []);

  /**
   * Handle user logout
   */
const handleLogout = async () => {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  }
};

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      width: '100%',
      backgroundColor: '#2e7d32',
      color: 'white',
      padding: '15px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 1000,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      {/* Logo / Home link */}
      <Link href="/" style={{ color: 'white', textDecoration: 'none', fontSize: '24px', fontWeight: 'bold' }}>
        🍃EcoĒire
      </Link>

      {/* Navigation Links */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <Link href="/" style={{ color: 'white', textDecoration: 'none' }}>Home</Link>
        <Link href="/map" style={{ color: 'white', textDecoration: 'none' }}>Map</Link>
        <Link href="/events" style={{ color: 'white', textDecoration: 'none' }}>Events</Link>

        {/* Conditional rendering based on login status */}
        {user ? (
          <>
            <Link href="/report" style={{ color: 'white', textDecoration: 'none' }}>Report</Link>
            <Link href="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</Link>

            {/* Admin link only visible to admins */}
            {user.role === 'admin' && (
              <Link href="/admin" style={{ color: 'white', textDecoration: 'none' }}>Admin</Link>
            )}

            {/* User menu dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                style={{
                  backgroundColor: 'transparent',
                  color: 'white',
                  border: '1px solid white',
                  padding: '8px 15px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <span>👤 {user.name}</span>
                <span>▼</span>
              </button>

              {/* Dropdown menu */}
              {menuOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  backgroundColor: 'white',
                  color: '#333',
                  borderRadius: '5px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  minWidth: '200px',
                  marginTop: '5px'
                }}>
                  <Link href="/profile" style={{
                    display: 'block',
                    padding: '10px 15px',
                    textDecoration: 'none',
                    color: '#333',
                    borderBottom: '1px solid #eee'
                  }}>
                    Profile
                  </Link>
                  <Link href="/settings/privacy" style={{
                    display: 'block',
                    padding: '10px 15px',
                    textDecoration: 'none',
                    color: '#333',
                    borderBottom: '1px solid #eee'
                  }}>
                    Privacy Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '10px 15px',
                      border: 'none',
                      background: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      color: '#f44336'
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Links for non-logged-in users */
          <>
            <Link href="/login" style={{ color: 'white', textDecoration: 'none' }}>Login</Link>
            <Link href="/register" style={{
              backgroundColor: 'white',
              color: '#2e7d32',
              padding: '8px 15px',
              borderRadius: '5px',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}>
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}