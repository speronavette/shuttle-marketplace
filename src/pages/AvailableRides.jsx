import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'
import Tooltip from '../components/Tooltip'

export default function AvailableRides() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState(null)
  const [sortBy, setSortBy] = useState('recent') // 'recent', 'date', 'prix'

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
          societe:users!societe_id (id, nom, note_moyenne),
          candidatures (id, chauffeur_id)
        `)
        .eq('statut', 'disponible')
        .order('created_at', { ascending: false })

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
        .maybeSingle()

      if (!error && data) {
        setUserProfile(data)
      }
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

  // Trier les courses
  const sortedCourses = [...courses].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.created_at) - new Date(a.created_at)
      case 'date':
        return new Date(a.date_heure) - new Date(b.date_heure)
      case 'prix':
        return b.prix - a.prix
      default:
        return 0
    }
  })

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
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <span style={{ fontSize: '24px' }}>⚠️</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#92400e', marginBottom: '8px' }}>
                  Profil en attente de validation
                </div>
                <p style={{ fontSize: '14px', color: '#78350f', margin: '0 0 12px 0' }}>
                  Vous pouvez consulter les courses, mais pas candidater. Envoyez votre <strong>autorisation d'exploiter</strong> pour activer votre compte :
                </p>
                <a 
                  href="mailto:shuttlemarketplace@gmail.com?subject=Autorisation%20d'exploiter%20-%20Validation%20profil&body=Bonjour,%0A%0AVeuillez%20trouver%20ci-joint%20mon%20autorisation%20d'exploiter%20pour%20la%20validation%20de%20mon%20profil.%0A%0ANom%20:%20%0ATéléphone%20:%20%0A%0ACordialement"
                  style={{ 
                    display: 'inline-block',
                    backgroundColor: '#92400e',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    textDecoration: 'none'
                  }}
                >
                  📧 Envoyer mon autorisation
                </a>
              </div>
            </div>
          </div>
        )}

        {/* En-tête avec tri */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
              Courses disponibles
            </h1>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
              {courses.length} course{courses.length > 1 ? 's' : ''} disponible{courses.length > 1 ? 's' : ''}
            </p>
          </div>
          
          {/* Sélecteur de tri */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>Trier par :</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="recent">🕐 Dernières publiées</option>
              <option value="date">📅 Prochaines courses</option>
              <option value="prix">💰 Prix décroissant</option>
            </select>
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
                    <th style={{ padding: '14px 16px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Bagages</th>
                    <th style={{ padding: '14px 16px', textAlign: 'right', fontWeight: '600', color: '#374151' }}>Prix</th>
                    <th style={{ padding: '14px 16px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Candidats</th>
                    <th style={{ padding: '14px 16px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedCourses.map((course, index) => {
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
                            <div style={{ marginTop: '4px' }}>
                              <Tooltip text="Le premier chauffeur qui candidate obtient automatiquement la course. Pas besoin d'attendre la validation du donneur d'ordre.">
                                <span style={{
                                  display: 'inline-block',
                                  backgroundColor: '#fef3c7',
                                  color: '#92400e',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: '600'
                                }}>
                                  ⚡ Premier arrivé
                                </span>
                              </Tooltip>
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'center', color: '#111827' }}>
                          {course.nb_passagers}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'center', color: '#6b7280' }}>
                          {course.nb_bagages || 0}
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