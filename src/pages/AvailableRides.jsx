import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'

export default function AvailableRides() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState(null)

  useEffect(() => {
    fetchCourses()
    if (user) {
      fetchUserProfile()
    }
  }, [user])

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          societe:users!societe_id (nom, note_moyenne),
          candidatures (id, chauffeur_id)
        `)
        .eq('statut', 'disponible')
        .order('date_heure', { ascending: true })

      if (error) throw error
      setCourses(data || [])
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('valide')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setUserProfile(data)
    } catch (error) {
      console.error('Erreur profil:', error)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-BE', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    })
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('fr-BE', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isValidated = userProfile?.valide === true

  // Vérifier si l'utilisateur a déjà candidaté
  const hasCandidated = (course) => {
    return course.candidatures?.some(c => c.chauffeur_id === user?.id)
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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Header />

      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px 16px'
      }}>
        {/* Alerte profil non validé */}
        {user && !isValidated && (
          <div style={{
            backgroundColor: '#fef3c7',
            border: '1px solid #fcd34d',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>⚠️</span>
              <span style={{ fontSize: '14px', color: '#92400e' }}>
                <strong>Profil en attente de validation</strong> - Vous pouvez consulter les courses, mais pas candidater.
              </span>
            </div>
            <a 
              href="mailto:shuttlemarketplace@gmail.com?subject=Documents%20-%20Validation%20profil"
              style={{ 
                backgroundColor: '#92400e',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '500',
                textDecoration: 'none'
              }}
            >
              Envoyer mes documents →
            </a>
          </div>
        )}

        {/* En-tête */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
              Courses disponibles
            </h1>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
              {courses.length} course{courses.length > 1 ? 's' : ''} disponible{courses.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {courses.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
            padding: '48px 24px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚗</div>
            <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '8px' }}>
              Aucune course disponible pour le moment
            </p>
            <p style={{ fontSize: '14px', color: '#9ca3af' }}>
              Les nouvelles courses apparaîtront ici
            </p>
          </div>
        ) : (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
            overflow: 'hidden'
          }}>
            {/* Tableau */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                fontSize: '14px'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Date</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Heure</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Trajet</th>
                    <th style={{ padding: '14px 16px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Pax</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Société</th>
                    <th style={{ padding: '14px 16px', textAlign: 'right', fontWeight: '600', color: '#374151' }}>Prix</th>
                    <th style={{ padding: '14px 16px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Candidats</th>
                    <th style={{ padding: '14px 16px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course, index) => {
                    const isOwner = user?.id === course.societe_id
                    const alreadyCandidated = hasCandidated(course)
                    
                    return (
                      <tr 
                        key={course.id}
                        style={{ 
                          borderBottom: '1px solid #e5e7eb',
                          backgroundColor: index % 2 === 0 ? 'white' : '#fafafa',
                          transition: 'background-color 0.15s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0f9ff'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'white' : '#fafafa'}
                      >
                        <td style={{ padding: '14px 16px', color: '#111827', fontWeight: '500' }}>
                          {formatDate(course.date_heure)}
                        </td>
                        <td style={{ padding: '14px 16px', color: '#111827' }}>
                          {formatTime(course.date_heure)}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: '600', color: '#111827' }}>
                            {course.depart}
                          </div>
                          <div style={{ color: '#6b7280', fontSize: '13px' }}>
                            → {course.arrivee}
                          </div>
                          {course.mode_attribution === 'premier_arrive' && (
                            <div style={{
                              display: 'inline-block',
                              marginTop: '4px',
                              backgroundColor: '#fef3c7',
                              color: '#92400e',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: '600'
                            }}>
                              ⚡ Premier arrivé
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'center', color: '#111827' }}>
                          {course.nb_passagers}
                        </td>
                        <td style={{ padding: '14px 16px', color: '#6b7280' }}>
                          <div>{course.societe?.nom || '-'}</div>
                          {course.societe?.note_moyenne > 0 && (
                            <div style={{ fontSize: '12px', color: '#f59e0b' }}>
                              ⭐ {course.societe.note_moyenne}/5
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <span style={{
                            backgroundColor: '#ecfdf5',
                            color: '#059669',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            fontSize: '15px'
                          }}>
                            {course.prix}€
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <span style={{
                            backgroundColor: course.candidatures?.length > 0 ? '#dbeafe' : '#f3f4f6',
                            color: course.candidatures?.length > 0 ? '#1e40af' : '#6b7280',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '13px',
                            fontWeight: '600'
                          }}>
                            {course.candidatures?.length || 0}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          {isOwner ? (
                            <span style={{ 
                              color: '#9ca3af', 
                              fontSize: '13px',
                              fontStyle: 'italic'
                            }}>
                              Ma course
                            </span>
                          ) : alreadyCandidated ? (
                            <span style={{
                              backgroundColor: '#ecfdf5',
                              color: '#059669',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '13px',
                              fontWeight: '500'
                            }}>
                              ✓ Candidaté
                            </span>
                          ) : (
                            <button
                              onClick={() => navigate(`/ride/${course.id}`)}
                              style={{
                                backgroundColor: '#111827',
                                color: 'white',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontWeight: '500',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'background-color 0.15s'
                              }}
                              onMouseOver={(e) => e.target.style.backgroundColor = '#374151'}
                              onMouseOut={(e) => e.target.style.backgroundColor = '#111827'}
                            >
                              Voir →
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}