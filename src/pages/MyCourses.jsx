import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'
import { sendAcceptationNotification, sendNonRetenuNotification } from '../services/emailService'

export default function MyCourses() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [expandedCourse, setExpandedCourse] = useState(null)

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
            chauffeur:users!chauffeur_id (id, nom, telephone, email, notif_email, note_moyenne_chauffeur, nb_courses_chauffeur)
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

  const handleAcceptCandidature = async (courseId, chauffeurId, prixAccepte, allCandidatures) => {
    setActionLoading(`accept-${courseId}-${chauffeurId}`)
    
    try {
      const { error } = await supabase
        .from('courses')
        .update({
          chauffeur_attribue_id: chauffeurId,
          statut: 'attribuee',
          prix: prixAccepte
        })
        .eq('id', courseId)

      if (error) throw error

      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single()

      const { data: chauffeur } = await supabase
        .from('users')
        .select('email, notif_email')
        .eq('id', chauffeurId)
        .single()

      const { data: societe } = await supabase
        .from('users')
        .select('nom, telephone, raison_sociale, numero_tva, rue, numero, code_postal, commune, email_facturation')
        .eq('id', user.id)
        .single()

      // Envoyer email au chauffeur accepté
      if (chauffeur?.notif_email) {
        await sendAcceptationNotification({
          course: courseData,
          chauffeurEmail: chauffeur.email,
          societe
        })
        console.log('📧 Email acceptation envoyé')
      }

      // Envoyer email aux chauffeurs NON retenus
      const nonRetenus = allCandidatures.filter(c => c.chauffeur?.id !== chauffeurId)
      for (const candidature of nonRetenus) {
        if (candidature.chauffeur?.notif_email && candidature.chauffeur?.email) {
          await sendNonRetenuNotification({
            course: courseData,
            chauffeurEmail: candidature.chauffeur.email,
            chauffeurNom: candidature.chauffeur.nom
          })
          console.log(`📧 Email non-retenu envoyé à ${candidature.chauffeur.nom}`)
        }
      }

      await fetchMyCourses()
      setExpandedCourse(null)
      alert('✅ Chauffeur accepté avec succès !')
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

  const getStatutBadge = (statut) => {
    switch (statut) {
      case 'disponible':
        return { label: '⏳ En attente', bg: '#fef3c7', color: '#d97706' }
      case 'attribuee':
        return { label: '✅ Attribuée', bg: '#dbeafe', color: '#1e40af' }
      case 'terminee':
        return { label: '✓ Terminée', bg: '#f3f4f6', color: '#374151' }
      case 'annulee':
        return { label: '❌ Annulée', bg: '#fef2f2', color: '#dc2626' }
      default:
        return { label: statut, bg: '#f3f4f6', color: '#374151' }
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
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px 16px'
      }}>
        {/* En-tête */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
              Mes publications
            </h1>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
              {courses.length} course{courses.length > 1 ? 's' : ''} publiée{courses.length > 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => navigate('/publish-ride')}
            style={{
              backgroundColor: '#111827',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            + Nouvelle course
          </button>
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
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
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
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
            overflow: 'hidden'
          }}>
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
                    <th style={{ padding: '14px 16px', textAlign: 'right', fontWeight: '600', color: '#374151' }}>Prix</th>
                    <th style={{ padding: '14px 16px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Statut</th>
                    <th style={{ padding: '14px 16px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Candidats</th>
                    <th style={{ padding: '14px 16px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course, index) => {
                    const statut = getStatutBadge(course.statut)
                    const isExpanded = expandedCourse === course.id
                    const hasCandidatures = course.candidatures?.length > 0
                    
                    return (
                      <React.Fragment key={course.id}>
                        <tr
                          style={{ 
                            borderBottom: isExpanded ? 'none' : '1px solid #e5e7eb',
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
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'center', color: '#111827' }}>
                            {course.nb_passagers}
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
                              backgroundColor: statut.bg,
                              color: statut.color,
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '13px',
                              fontWeight: '500'
                            }}>
                              {statut.label}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                            {course.statut === 'disponible' ? (
                              <span style={{
                                backgroundColor: hasCandidatures ? '#dbeafe' : '#f3f4f6',
                                color: hasCandidatures ? '#1e40af' : '#6b7280',
                                padding: '4px 10px',
                                borderRadius: '12px',
                                fontSize: '13px',
                                fontWeight: '600'
                              }}>
                                {course.candidatures?.length || 0}
                              </span>
                            ) : course.chauffeur_attribue ? (
                              <span style={{ fontSize: '13px', color: '#059669' }}>
                                {course.chauffeur_attribue.nom}
                              </span>
                            ) : '-'}
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                            {course.statut === 'disponible' && hasCandidatures ? (
                              <button
                                onClick={() => setExpandedCourse(isExpanded ? null : course.id)}
                                style={{
                                  backgroundColor: '#1e40af',
                                  color: 'white',
                                  padding: '8px 16px',
                                  borderRadius: '6px',
                                  fontSize: '13px',
                                  fontWeight: '500',
                                  border: 'none',
                                  cursor: 'pointer'
                                }}
                              >
                                {isExpanded ? '▲ Fermer' : '▼ Choisir'}
                              </button>
                            ) : course.statut === 'disponible' ? (
                              <span style={{ color: '#9ca3af', fontSize: '13px' }}>
                                En attente...
                              </span>
                            ) : course.statut === 'attribuee' ? (
                              <button
                                onClick={() => handleTerminerCourse(course.id)}
                                disabled={actionLoading === `terminer-${course.id}`}
                                style={{
                                  backgroundColor: '#059669',
                                  color: 'white',
                                  padding: '8px 16px',
                                  borderRadius: '6px',
                                  fontSize: '13px',
                                  fontWeight: '500',
                                  border: 'none',
                                  cursor: 'pointer',
                                  opacity: actionLoading === `terminer-${course.id}` ? 0.7 : 1
                                }}
                              >
                                ✓ Terminer
                              </button>
                            ) : course.statut === 'terminee' ? (
                              <button
                                onClick={() => navigate(`/rate/${course.id}`)}
                                style={{
                                  backgroundColor: '#f59e0b',
                                  color: 'white',
                                  padding: '8px 16px',
                                  borderRadius: '6px',
                                  fontSize: '13px',
                                  fontWeight: '500',
                                  border: 'none',
                                  cursor: 'pointer'
                                }}
                              >
                                ⭐ Noter
                              </button>
                            ) : '-'}
                          </td>
                        </tr>
                        
                        {/* Ligne expandable pour les candidatures */}
                        {isExpanded && (
                          <tr key={`${course.id}-expanded`}>
                            <td colSpan="8" style={{ 
                              padding: '0',
                              backgroundColor: '#f0f9ff',
                              borderBottom: '1px solid #e5e7eb'
                            }}>
                              <div style={{ padding: '16px 24px' }}>
                                <div style={{ 
                                  fontSize: '14px', 
                                  fontWeight: '600', 
                                  color: '#1e40af', 
                                  marginBottom: '12px' 
                                }}>
                                  Choisir un chauffeur parmi {course.candidatures?.length} candidature(s)
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  {course.candidatures?.map((candidature) => (
                                    <div
                                      key={candidature.id}
                                      style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        backgroundColor: 'white',
                                        padding: '12px 16px',
                                        borderRadius: '8px',
                                        border: '1px solid #e5e7eb'
                                      }}
                                    >
                                      <div>
                                        <div style={{ fontWeight: '600', color: '#111827' }}>
                                          {candidature.chauffeur?.nom}
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#6b7280' }}>
                                          📞 {candidature.chauffeur?.telephone} • 
                                          ⭐ {candidature.chauffeur?.note_moyenne_chauffeur > 0 ? `${candidature.chauffeur.note_moyenne_chauffeur}/5` : 'Nouveau'} • 
                                          🚗 {candidature.chauffeur?.nb_courses_chauffeur || 0} courses
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => handleAcceptCandidature(course.id, candidature.chauffeur?.id, course.prix, course.candidatures)}
                                        disabled={actionLoading === `accept-${course.id}-${candidature.chauffeur?.id}`}
                                        style={{
                                          backgroundColor: '#059669',
                                          color: 'white',
                                          padding: '10px 20px',
                                          borderRadius: '6px',
                                          fontSize: '14px',
                                          fontWeight: '500',
                                          border: 'none',
                                          cursor: 'pointer',
                                          opacity: actionLoading ? 0.7 : 1
                                        }}
                                      >
                                        ✓ Accepter
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
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