import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'
import { sendAcceptationNotification } from '../services/emailService'

export default function MyCourses() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    if (user) {
      fetchMyCourses()
    }
  }, [user])

  const fetchMyCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          candidatures (
            id,
            prix_propose,
            chauffeur:users!chauffeur_id (id, nom, telephone, note_moyenne_chauffeur, nb_courses_chauffeur)
          ),
          chauffeur_attribue:users!chauffeur_attribue_id (id, nom, telephone, raison_sociale, numero_tva, rue, numero, code_postal, commune, email_facturation)
        `)
        .eq('societe_id', user.id)
        .order('date_heure', { ascending: true })

      if (error) throw error
      setCourses(data || [])
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptCandidature = async (courseId, chauffeurId, prixAccepte) => {
    setActionLoading(`accept-${courseId}-${chauffeurId}`)
    
    try {
      // Mettre à jour la course avec le chauffeur ET le prix accepté
      const { error } = await supabase
        .from('courses')
        .update({
          chauffeur_attribue_id: chauffeurId,
          statut: 'attribuee',
          prix: prixAccepte // Met à jour le prix avec celui proposé par le chauffeur
        })
        .eq('id', courseId)

      if (error) throw error

      // Récupérer les infos de la course
      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single()

      // Récupérer les infos du chauffeur
      const { data: chauffeur } = await supabase
        .from('users')
        .select('email, notif_email')
        .eq('id', chauffeurId)
        .single()

      // Récupérer les infos de la société (moi)
      const { data: societe } = await supabase
        .from('users')
        .select('nom, telephone, raison_sociale, numero_tva, rue, numero, code_postal, commune, email_facturation')
        .eq('id', user.id)
        .single()

      // Envoyer notification au chauffeur
      if (chauffeur?.notif_email) {
        await sendAcceptationNotification({
          course: courseData,
          chauffeurEmail: chauffeur.email,
          societe
        })
        console.log('📧 Notification d\'acceptation envoyée')
      }

      await fetchMyCourses()
      alert('✅ Chauffeur accepté avec succès !')
    } catch (error) {
      alert('❌ Erreur: ' + error.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleRefuseCandidature = async (candidatureId) => {
    setActionLoading(`refuse-${candidatureId}`)
    
    try {
      const { error } = await supabase
        .from('candidatures')
        .delete()
        .eq('id', candidatureId)

      if (error) throw error

      await fetchMyCourses()
      alert('Candidature refusée')
    } catch (error) {
      alert('❌ Erreur: ' + error.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleTerminerCourse = async (courseId) => {
    if (!confirm('Confirmer que cette course est terminée ?')) return

    setActionLoading(`terminer-${courseId}`)
    
    try {
      const { error } = await supabase
        .from('courses')
        .update({ statut: 'terminee' })
        .eq('id', courseId)

      if (error) throw error

      await fetchMyCourses()
      alert('✅ Course marquée comme terminée !')
    } catch (error) {
      alert('❌ Erreur: ' + error.message)
    } finally {
      setActionLoading(null)
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

  const getStatutStyle = (statut) => {
    switch (statut) {
      case 'disponible':
        return { backgroundColor: '#ecfdf5', color: '#059669' }
      case 'attribuee':
        return { backgroundColor: '#dbeafe', color: '#1e40af' }
      case 'terminee':
        return { backgroundColor: '#f3f4f6', color: '#374151' }
      case 'annulee':
        return { backgroundColor: '#fef2f2', color: '#dc2626' }
      default:
        return { backgroundColor: '#f3f4f6', color: '#374151' }
    }
  }

  const getStatutLabel = (statut) => {
    switch (statut) {
      case 'disponible': return 'Disponible'
      case 'attribuee': return 'Attribuée'
      case 'terminee': return 'Terminée'
      case 'annulee': return 'Annulée'
      default: return statut
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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Header />

      <main style={{
        maxWidth: '600px',
        margin: '0 auto',
        padding: '32px 16px'
      }}>
        {/* Titre */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
            Mes courses publiées
          </h1>
          <p style={{ fontSize: '15px', color: '#6b7280', margin: 0 }}>
            {courses.length} course(s)
          </p>
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
            <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '16px' }}>
              Vous n'avez pas encore publié de course
            </p>
            <button
              onClick={() => navigate('/publish-ride')}
              style={{
                backgroundColor: '#111827',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Publier ma première course
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {courses.map((course) => (
              <div
                key={course.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  border: '1px solid #e5e7eb',
                  padding: '20px'
                }}
              >
                {/* En-tête */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                      {course.depart} → {course.arrivee}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                      📅 {formatDate(course.date_heure)} à {formatTime(course.date_heure)} • 👥 {course.nb_passagers} • 💰 {course.prix}€
                    </div>
                  </div>
                  <div style={{
                    ...getStatutStyle(course.statut),
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '500'
                  }}>
                    {getStatutLabel(course.statut)}
                  </div>
                </div>

                {/* Chauffeur attribué */}
                {course.chauffeur_attribue && (
                  <div style={{
                    backgroundColor: course.statut === 'terminee' ? '#f3f4f6' : '#eff6ff',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '12px'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: course.statut === 'terminee' ? '#374151' : '#1e40af', marginBottom: '4px' }}>
                          {course.statut === 'terminee' ? '✓ Course terminée' : '✅ Chauffeur attribué'}
                        </div>
                        <div style={{ fontSize: '14px', color: course.statut === 'terminee' ? '#374151' : '#1e40af' }}>
                          <div>{course.chauffeur_attribue.nom} • 📞 {course.chauffeur_attribue.telephone}</div>
                          {course.chauffeur_attribue.raison_sociale && (
                            <div style={{ marginTop: '4px', fontSize: '13px' }}>
                              🏢 {course.chauffeur_attribue.raison_sociale}
                              {course.chauffeur_attribue.numero_tva && ` • TVA: ${course.chauffeur_attribue.numero_tva}`}
                            </div>
                          )}
                          {course.chauffeur_attribue.email_facturation && (
                            <div style={{ marginTop: '2px', fontSize: '13px' }}>
                              📧 {course.chauffeur_attribue.email_facturation}
                            </div>
                          )}
                          {course.chauffeur_attribue.rue && (
                            <div style={{ marginTop: '2px', fontSize: '13px' }}>
                              📍 {course.chauffeur_attribue.rue} {course.chauffeur_attribue.numero}, {course.chauffeur_attribue.code_postal} {course.chauffeur_attribue.commune}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {course.statut === 'attribuee' && (
                          <button
                            onClick={() => handleTerminerCourse(course.id)}
                            disabled={actionLoading === `terminer-${course.id}`}
                            style={{
                              backgroundColor: '#059669',
                              color: 'white',
                              padding: '8px 16px',
                              borderRadius: '6px',
                              fontSize: '14px',
                              fontWeight: '500',
                              border: 'none',
                              cursor: 'pointer',
                              opacity: actionLoading === `terminer-${course.id}` ? 0.7 : 1
                            }}
                          >
                            ✓ Terminer la course
                          </button>
                        )}
                        
                        {course.statut === 'terminee' && (
                          <button
                            onClick={() => navigate(`/rate/${course.id}`)}
                            style={{
                              backgroundColor: '#f59e0b',
                              color: 'white',
                              padding: '8px 16px',
                              borderRadius: '6px',
                              fontSize: '14px',
                              fontWeight: '500',
                              border: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            ⭐ Noter le chauffeur
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Candidatures */}
                {course.statut === 'disponible' && (
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      Candidatures ({course.candidatures?.length || 0})
                    </div>
                    
{course.candidatures?.length === 0 ? (
  <p style={{ fontSize: '14px', color: '#9ca3af', fontStyle: 'italic' }}>
    Aucune candidature pour le moment
  </p>
) : (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
    {[...course.candidatures]
      .sort((a, b) => a.prix_propose - b.prix_propose)
      .map((candidature) => {
                          const isSousEnchere = candidature.prix_propose < course.prix
                          const economie = course.prix - candidature.prix_propose
                          
                          return (
                            <div
                              key={candidature.id}
                              style={{
                                backgroundColor: '#f9fafb',
                                borderRadius: '8px',
                                padding: '12px',
                                border: isSousEnchere ? '2px solid #059669' : '1px solid #e5e7eb'
                              }}
                            >
                              <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                marginBottom: '12px'
                              }}>
                                <div>
                                  <div style={{ fontSize: '15px', fontWeight: '500', color: '#111827' }}>
                                    {candidature.chauffeur?.nom}
                                  </div>
                                  <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>
                                    📞 {candidature.chauffeur?.telephone} • 
                                    ⭐ {candidature.chauffeur?.note_moyenne_chauffeur > 0 ? `${candidature.chauffeur.note_moyenne_chauffeur}/5` : 'Nouveau'} • 
                                    🚗 {candidature.chauffeur?.nb_courses_chauffeur || 0} courses
                                  </div>
                                </div>
                                
                                <div style={{
                                  backgroundColor: isSousEnchere ? '#ecfdf5' : '#f3f4f6',
                                  color: isSousEnchere ? '#059669' : '#374151',
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  textAlign: 'center'
                                }}>
                                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                                    {candidature.prix_propose}€
                                  </div>
                                  {isSousEnchere && (
                                    <div style={{ fontSize: '11px', color: '#059669' }}>
                                      -{economie}€
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  onClick={() => handleAcceptCandidature(course.id, candidature.chauffeur?.id, candidature.prix_propose)}
                                  disabled={actionLoading === `accept-${course.id}-${candidature.chauffeur?.id}`}
                                  style={{
                                    flex: 1,
                                    backgroundColor: '#059669',
                                    color: 'white',
                                    padding: '10px 16px',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    border: 'none',
                                    cursor: 'pointer',
                                    opacity: actionLoading ? 0.7 : 1
                                  }}
                                >
                                  ✓ Accepter à {candidature.prix_propose}€
                                </button>
                                <button
                                  onClick={() => handleRefuseCandidature(candidature.id)}
                                  disabled={actionLoading === `refuse-${candidature.id}`}
                                  style={{
                                    backgroundColor: '#fef2f2',
                                    color: '#dc2626',
                                    padding: '10px 16px',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    border: 'none',
                                    cursor: 'pointer',
                                    opacity: actionLoading ? 0.7 : 1
                                  }}
                                >
                                  ✗ Refuser
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}