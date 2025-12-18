import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import Header, { useIsMobile } from '../components/Header'

export default function EnAttente() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isMobile = useIsMobile()
  
  const [candidatures, setCandidatures] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    if (user) {
      fetchCandidaturesEnAttente()
    }
  }, [user])

  const fetchCandidaturesEnAttente = async () => {
    try {
      const { data, error } = await supabase
        .from('candidatures')
        .select(`
          *,
          course:courses (
            id,
            depart,
            arrivee,
            date_heure,
            nb_passagers,
            prix,
            statut,
            chauffeur_attribue_id,
            created_at,
            societe:users!societe_id (nom, telephone, note_moyenne)
          )
        `)
        .eq('chauffeur_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Filtrer uniquement les candidatures "en attente" (course disponible, pas encore attribuée)
      const enAttente = (data || []).filter(c => 
        c.course?.statut === 'disponible'
      )
      
      setCandidatures(enAttente)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnnulerCandidature = async (candidatureId) => {
    if (!confirm('Voulez-vous vraiment retirer votre candidature ?')) return

    setActionLoading(`annuler-${candidatureId}`)
    
    try {
      const { error } = await supabase
        .from('candidatures')
        .delete()
        .eq('id', candidatureId)

      if (error) throw error

      await fetchCandidaturesEnAttente()
      alert('Candidature retirée')
    } catch (error) {
      alert('Erreur: ' + error.message)
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

  // Calcul du temps écoulé depuis la publication
  const getTempsEcoule = (createdAt) => {
    const now = new Date()
    const created = new Date(createdAt)
    const diffMs = now - created
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) {
      return `${diffDays}j`
    } else if (diffHours > 0) {
      return `${diffHours}h`
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      return `${diffMinutes}min`
    }
  }

  // Indicateur visuel basé sur l'ancienneté
  const getAncienneteStyle = (createdAt) => {
    const now = new Date()
    const created = new Date(createdAt)
    const diffHours = (now - created) / (1000 * 60 * 60)

    if (diffHours < 24) {
      return { bg: '#ecfdf5', color: '#059669', label: 'Récente' }
    } else if (diffHours < 72) {
      return { bg: '#fef3c7', color: '#d97706', label: 'En cours' }
    } else {
      return { bg: '#fee2e2', color: '#dc2626', label: 'Ancienne' }
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
        padding: '24px 16px',
        paddingBottom: isMobile ? '90px' : '24px'
      }}>
        {/* En-tête */}
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
              ⏳ En attente
            </h1>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
              {candidatures.length} candidature{candidatures.length > 1 ? 's' : ''} en attente de réponse
            </p>
          </div>
          <button
            onClick={() => navigate('/available-rides')}
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
            Voir les courses
          </button>
        </div>

        {/* Info box */}
        <div style={{
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px'
        }}>
          <span style={{ fontSize: '20px' }}>💡</span>
          <div style={{ fontSize: '14px', color: '#1e40af' }}>
            <strong>Comment ça marche ?</strong><br />
            Quand vous candidatez à une course, le donneur d'ordre reçoit votre demande et choisit parmi les candidats. 
            Vous serez notifié par email dès qu'une décision est prise.
          </div>
        </div>

        {candidatures.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
            padding: '48px 24px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✨</div>
            <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '8px' }}>
              Aucune candidature en attente
            </p>
            <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '20px' }}>
              Consultez les courses disponibles pour candidater
            </p>
            <button
              onClick={() => navigate('/available-rides')}
              style={{
                backgroundColor: '#111827',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Voir les courses disponibles
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {candidatures.map((candidature) => {
              const course = candidature.course
              const anciennete = getAncienneteStyle(course.created_at)
              const tempsEcoule = getTempsEcoule(course.created_at)

              return (
                <div
                  key={candidature.id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    border: '1px solid #e5e7eb',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                  }}
                >
                  {/* Ligne principale */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '16px'
                  }}>
                    {/* Infos course */}
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <span style={{
                          backgroundColor: anciennete.bg,
                          color: anciennete.color,
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          ⏱️ Publiée il y a {tempsEcoule}
                        </span>
                      </div>
                      
                      <div style={{ fontWeight: '600', color: '#111827', fontSize: '16px' }}>
                        {course.depart} → {course.arrivee}
                      </div>
                      
                      <div style={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: '16px', 
                        marginTop: '8px',
                        fontSize: '14px',
                        color: '#6b7280'
                      }}>
                        <span>📅 {formatDate(course.date_heure)}</span>
                        <span>🕐 {formatTime(course.date_heure)}</span>
                        <span>👥 {course.nb_passagers} pax</span>
                      </div>
                    </div>

                    {/* Prix */}
                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        backgroundColor: '#ecfdf5',
                        color: '#059669',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        fontSize: '18px'
                      }}>
                        {course.prix}€
                      </span>
                    </div>
                  </div>

                  {/* Donneur d'ordre + Actions */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    paddingTop: '16px',
                    borderTop: '1px solid #f3f4f6',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                      <span style={{ fontWeight: '500' }}>Donneur d'ordre :</span> {course.societe?.nom || '-'}
                      {course.societe?.note_moyenne > 0 && (
                        <span style={{ marginLeft: '8px', color: '#f59e0b' }}>
                          ⭐ {course.societe.note_moyenne}/5
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => navigate(`/ride/${course.id}`)}
                        style={{
                          backgroundColor: '#f3f4f6',
                          color: '#374151',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: '500',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        Voir détails
                      </button>
                      <button
                        onClick={() => handleAnnulerCandidature(candidature.id)}
                        disabled={actionLoading === `annuler-${candidature.id}`}
                        style={{
                          backgroundColor: '#fee2e2',
                          color: '#dc2626',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: '500',
                          border: 'none',
                          cursor: 'pointer',
                          opacity: actionLoading === `annuler-${candidature.id}` ? 0.7 : 1
                        }}
                      >
                        Retirer
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Historique des candidatures terminées */}
        <HistoriqueCandidatures userId={user?.id} />
      </main>
    </div>
  )
}

// Composant pour l'historique des candidatures (acceptées/refusées)
function HistoriqueCandidatures({ userId }) {
  const [historique, setHistorique] = useState([])
  const [loading, setLoading] = useState(true)
  const [showHistorique, setShowHistorique] = useState(false)

  useEffect(() => {
    if (userId) {
      fetchHistorique()
    }
  }, [userId])

  const fetchHistorique = async () => {
    try {
      const { data, error } = await supabase
        .from('candidatures')
        .select(`
          *,
          course:courses (
            id,
            depart,
            arrivee,
            date_heure,
            prix,
            statut,
            chauffeur_attribue_id,
            societe:users!societe_id (nom)
          )
        `)
        .eq('chauffeur_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Filtrer les candidatures terminées (course attribuée ou terminée)
      const termine = (data || []).filter(c => 
        c.course?.statut === 'attribuee' || c.course?.statut === 'terminee'
      )
      
      setHistorique(termine)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-BE', {
      day: 'numeric',
      month: 'short'
    })
  }

  if (loading || historique.length === 0) return null

  return (
    <div style={{ marginTop: '32px' }}>
      <button
        onClick={() => setShowHistorique(!showHistorique)}
        style={{
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          color: '#6b7280',
          padding: '8px 0'
        }}
      >
        <span style={{ transform: showHistorique ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
          ▶
        </span>
        Historique des candidatures ({historique.length})
      </button>

      {showHistorique && (
        <div style={{
          marginTop: '12px',
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          overflow: 'hidden'
        }}>
          {historique.map((candidature, index) => {
            const course = candidature.course
            const isAccepted = course.chauffeur_attribue_id === userId

            return (
              <div
                key={candidature.id}
                style={{
                  padding: '16px 20px',
                  borderBottom: index < historique.length - 1 ? '1px solid #f3f4f6' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div>
                  <div style={{ fontWeight: '500', color: '#111827', fontSize: '14px' }}>
                    {course.depart} → {course.arrivee}
                  </div>
                  <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                    {formatDate(course.date_heure)} • {course.societe?.nom}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontWeight: '600', color: '#059669' }}>{course.prix}€</span>
                  <span style={{
                    backgroundColor: isAccepted ? '#ecfdf5' : '#fee2e2',
                    color: isAccepted ? '#059669' : '#dc2626',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {isAccepted ? '✅ Acceptée' : '❌ Non retenue'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}