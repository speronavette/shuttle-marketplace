import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      setProfile(data)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <Header />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px 0' }}>
          <div style={{ fontSize: '18px', color: '#6b7280' }}>Chargement...</div>
        </div>
      </div>
    )
  }

  const isValidated = profile?.valide === true

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Header />

      <main style={{
        maxWidth: '600px',
        margin: '0 auto',
        padding: '32px 16px'
      }}>
        {/* Alerte profil non validé */}
        {!isValidated && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '2px solid #fecaca',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ fontSize: '32px' }}>⚠️</div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#dc2626', margin: '0 0 8px 0' }}>
                  Profil en attente de validation
                </h3>
                <p style={{ fontSize: '14px', color: '#991b1b', margin: '0 0 12px 0' }}>
                  Pour pouvoir <strong>candidater aux courses</strong>, envoyez votre <strong>autorisation d'exploiter</strong>.
                </p>
                <a
                  href="mailto:shuttlemarketplace@gmail.com?subject=Autorisation%20d'exploiter%20-%20Validation%20profil&body=Bonjour,%0A%0AVeuillez%20trouver%20ci-joint%20mon%20autorisation%20d'exploiter%20pour%20la%20validation%20de%20mon%20profil.%0A%0ANom%20:%20%0ATéléphone%20:%20%0A%0ACordialement"
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    textDecoration: 'none'
                  }}
                >
                  📧 Envoyer mon autorisation
                </a>
                <p style={{ fontSize: '12px', color: '#991b1b', margin: '12px 0 0 0', fontStyle: 'italic' }}>
                  ⏱️ Validation sous 24-48h après réception.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Badge validé */}
        {isValidated && (
          <div style={{
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '18px' }}>✅</span>
            <span style={{ fontSize: '14px', color: '#065f46', fontWeight: '500' }}>
              Profil validé - Vous pouvez candidater aux courses
            </span>
          </div>
        )}

        {/* Carte de bienvenue */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
            Bienvenue {profile?.nom || 'Utilisateur'} !
          </h1>
          <p style={{ fontSize: '15px', color: '#6b7280', margin: 0 }}>{profile?.email}</p>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
          marginBottom: '24px'
        }}>
          {/* Note en tant que donneur d'ordre */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ 
                backgroundColor: '#8b5cf6', 
                color: 'white', 
                padding: '2px 8px', 
                borderRadius: '4px', 
                fontSize: '11px',
                fontWeight: '600'
              }}>
                🏢 Donneur d'ordre
              </span>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>
              {profile?.note_moyenne_societe > 0 ? `${profile.note_moyenne_societe}/5 ⭐` : 'Pas de note'}
            </div>
            <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
              {profile?.nb_courses_societe || 0} course(s) publiée(s)
            </div>
          </div>

          {/* Note en tant que chauffeur */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ 
                backgroundColor: '#3b82f6', 
                color: 'white', 
                padding: '2px 8px', 
                borderRadius: '4px', 
                fontSize: '11px',
                fontWeight: '600'
              }}>
                🚗 Chauffeur
              </span>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>
              {profile?.note_moyenne_chauffeur > 0 ? `${profile.note_moyenne_chauffeur}/5 ⭐` : 'Pas de note'}
            </div>
            <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
              {profile?.nb_courses_chauffeur || 0} course(s) effectuée(s)
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        {profile && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
            padding: '24px',
            marginBottom: '24px'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
              Actions rapides
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                onClick={() => navigate('/publish-ride')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: '#111827',
                  color: 'white',
                  padding: '14px 20px',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '500',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                + Publier une course
              </button>
              <button
                onClick={() => navigate('/available-rides')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: 'white',
                  color: '#111827',
                  padding: '14px 20px',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '500',
                  border: '2px solid #111827',
                  cursor: 'pointer'
                }}
              >
                🚗 Voir les courses
              </button>
              <button
                onClick={() => navigate('/my-courses')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: 'white',
                  color: '#374151',
                  padding: '14px 20px',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '500',
                  border: '1px solid #d1d5db',
                  cursor: 'pointer'
                }}
              >
                📋 Mes publications
              </button>
              <button
                onClick={() => navigate('/my-candidatures')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: 'white',
                  color: '#374151',
                  padding: '14px 20px',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '500',
                  border: '1px solid #d1d5db',
                  cursor: 'pointer'
                }}
              >
                📨 Mes candidatures
              </button>
            </div>
          </div>
        )}

        {/* Infos profil */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb',
          padding: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
              Mon profil
            </h2>
            <button
              onClick={() => navigate('/profile')}
              style={{
                backgroundColor: '#f3f4f6',
                color: '#374151',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              ✏️ Modifier
            </button>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
              <span style={{ fontSize: '15px', color: '#6b7280' }}>Téléphone</span>
              <span style={{ fontSize: '15px', fontWeight: '500', color: '#111827' }}>
                {profile?.telephone || 'Non renseigné'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
              <span style={{ fontSize: '15px', color: '#6b7280' }}>Zone géographique</span>
              <span style={{ fontSize: '15px', fontWeight: '500', color: '#111827' }}>
                {profile?.zone_geographique || 'Non renseignée'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
              <span style={{ fontSize: '15px', color: '#6b7280' }}>TVA</span>
              <span style={{ fontSize: '15px', fontWeight: '500', color: '#111827' }}>
                {profile?.numero_tva || 'Non renseigné'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
              <span style={{ fontSize: '15px', color: '#6b7280' }}>Statut</span>
              <span style={{ 
                fontSize: '14px', 
                fontWeight: '500', 
                color: isValidated ? '#059669' : '#dc2626',
                backgroundColor: isValidated ? '#ecfdf5' : '#fef2f2',
                padding: '4px 12px',
                borderRadius: '6px'
              }}>
                {isValidated ? '✅ Validé' : '⏳ En attente'}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}