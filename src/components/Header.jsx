import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Logo from './Logo'

export default function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, signOut } = useAuth()

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  // Menu items
  const menuItems = [
    { path: '/available-rides', label: '🚗 Courses', short: 'Courses' },
    { path: '/publish-ride', label: '+ Publier', short: 'Publier' },
    { path: '/my-courses', label: '📋 Mes publications', short: 'Publications' },
    { path: '/my-candidatures', label: '📨 Mes candidatures', short: 'Candidatures' },
    { path: '/dashboard', label: '👤 Profil', short: 'Profil' },
  ]

  const isActive = (path) => location.pathname === path

  return (
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
        borderBottom: user ? '1px solid #f3f4f6' : 'none'
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
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: 'transparent',
                color: '#6b7280',
                fontSize: '14px',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: '6px'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
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

      {/* Menu navigation - seulement si connecté */}
      {user && (
        <nav style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 16px'
        }}>
          <div style={{
            display: 'flex',
            gap: '4px',
            overflowX: 'auto',
            paddingBottom: '2px',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none'
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
                <span className="menu-full">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}