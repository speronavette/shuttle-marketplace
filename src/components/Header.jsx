import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Logo from './Logo'

// Hook personnalisé pour détecter mobile
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  return isMobile
}

export default function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, signOut } = useAuth()
  const isMobile = useIsMobile()

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  // Menu items
  const menuItems = [
    { path: '/available-rides', label: 'Courses', icon: '🚗' },
    { path: '/publish-ride', label: 'Publier', icon: '➕' },
    { path: '/mes-courses', label: 'Mes courses', icon: '📋' },
    { path: '/en-attente', label: 'Attente', icon: '⏳' },
    { path: '/dashboard', label: 'Profil', icon: '👤' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <>
      {/* Header classique en haut */}
      <header style={{ 
        backgroundColor: 'white', 
        borderBottom: '1px solid #e5e7eb',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        width: '100%'
      }}>
        {/* Ligne du haut : Logo + Déconnexion */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: user && !isMobile ? '1px solid #f3f4f6' : 'none'
        }}>
          {/* Logo */}
          <div 
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(user ? '/available-rides' : '/login')}
          >
            <Logo />
          </div>

          {/* Déconnexion */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {!isMobile && (
                <a
                  href="/comment-ca-marche"
                  style={{
                    color: '#6b7280',
                    fontSize: '14px',
                    fontWeight: '500',
                    textDecoration: 'none',
                    padding: '8px 12px',
                    borderRadius: '6px'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  ❓ Aide
                </a>
              )}
              <button
                onClick={handleLogout}
                style={{
                  backgroundColor: 'transparent',
                  color: '#6b7280',
                  fontSize: '13px',
                  fontWeight: '500',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px 12px',
                  borderRadius: '6px'
                }}
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              style={{
                backgroundColor: '#111827',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Connexion
            </button>
          )}
        </div>

        {/* Menu navigation DESKTOP - seulement si connecté et pas mobile */}
        {user && !isMobile && (
          <nav style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 16px'
          }}>
            <div style={{
              display: 'flex',
              gap: '4px',
              paddingBottom: '2px'
            }}>
              {menuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  style={{
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontWeight: '500',
                    border: 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    borderRadius: '8px 8px 0 0',
                    transition: 'all 0.15s',
                    backgroundColor: isActive(item.path) ? '#111827' : 'transparent',
                    color: isActive(item.path) ? 'white' : '#6b7280',
                    borderBottom: isActive(item.path) ? '2px solid #111827' : '2px solid transparent'
                  }}
                  onMouseOver={(e) => {
                    if (!isActive(item.path)) {
                      e.target.style.backgroundColor = '#f3f4f6'
                      e.target.style.color = '#111827'
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isActive(item.path)) {
                      e.target.style.backgroundColor = 'transparent'
                      e.target.style.color = '#6b7280'
                    }
                  }}
                >
                  {item.icon} {item.label}
                </button>
              ))}
            </div>
          </nav>
        )}
      </header>

      {/* Navigation MOBILE - barre fixe en bas */}
      {user && isMobile && (
        <nav style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'white',
          borderTop: '1px solid #e5e7eb',
          zIndex: 50,
          paddingBottom: 'env(safe-area-inset-bottom)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            padding: '8px 0'
          }}>
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                  padding: '8px 12px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  color: isActive(item.path) ? '#111827' : '#9ca3af',
                  transition: 'color 0.15s'
                }}
              >
                <span style={{ fontSize: '20px' }}>{item.icon}</span>
                <span style={{ 
                  fontSize: '10px', 
                  fontWeight: isActive(item.path) ? '600' : '500'
                }}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </nav>
      )}
    </>
  )
}