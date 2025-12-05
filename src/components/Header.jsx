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

  const isHomePage = location.pathname === '/dashboard'

  return (
    <header style={{ 
      backgroundColor: 'white', 
      borderBottom: '1px solid #e5e7eb',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      width: '100%'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        padding: '12px 16px'
      }}>
        {/* Bouton retour si pas sur Dashboard */}
        {!isHomePage && (
          <button
            onClick={() => navigate(-1)}
            style={{
              backgroundColor: 'transparent',
              color: '#6b7280',
              fontSize: '14px',
              border: 'none',
              cursor: 'pointer',
              padding: '0',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            ← Retour
          </button>
        )}

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Logo */}
          <div 
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/dashboard')}
          >
            <Logo />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {user ? (
              <>
                <button
                  onClick={() => navigate('/publish-ride')}
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
                  + Publier
                </button>
                <button
                  onClick={handleLogout}
                  style={{
                    backgroundColor: 'transparent',
                    color: '#6b7280',
                    fontSize: '14px',
                    fontWeight: '500',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Déconnexion
                </button>
              </>
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
        </div>
      </div>
    </header>
  )
}