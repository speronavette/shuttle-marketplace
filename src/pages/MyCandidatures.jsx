import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'

export default function MyCandidatures() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [candidatures, setCandidatures] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [expandedCandidature, setExpandedCandidature] = useState(null)

  useEffect(() => {
    if (user) {
      fetchMyCandidatures()
    }
  }, [user])

  const fetchMyCandidatures = async () => {
    try {
      const { data, error } = await supabase
        .from('candidatures')
        .select(`
          *,
          course:courses (
            id,
            depart,
            arrivee,
            adresse_depart,
            adresse_arrivee,
            date_heure,
            nb_passagers,
            nb_bagages,
            prix,
            prix_initial,
            mode_reglement,
            type_course,
            numero_vol,
            provenance_destination_vol,
            commentaires,
            statut,
            chauffeur_attribue_id,
            client_nom,
            client_prenom,
            client_telephone,
            societe:users!societe_id (nom, telephone, note_moyenne, raison_sociale, numero_tva, rue, numero, code_postal, commune, email_facturation)
          )
        `)
        .eq('chauffeur_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setCandidatures(data || [])
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnnulerCandidature = async (candidatureId) => {
    if (!confirm('Voulez-vous vraiment annuler cette candidature ?')) return

    setActionLoading(`annuler-${candidatureId}`)
    
    try {
      const { error } = await supabase
        .from('candidatures')
        .delete()
        .eq('id', candidatureId)

      if (error) throw error

      await fetchMyCandidatures()
      alert('Candidature annulée')
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

  const getStatutBadge = (candidature) => {
    const course = candidature.course
    const isAttributedToMe = course.chauffeur_attribue_id === user.id

    if (course.statut === 'attribuee' && isAttributedToMe) {
      return { label: '✅ Acceptée', bg: '#ecfdf5', color: '#059669' }
    } else if (course.statut === 'attribuee' && !isAttributedToMe) {
      return { label: '❌ Non retenue', bg: '#fef2f2', color: '#dc2626' }
    } else if (course.statut === 'terminee' && isAttributedToMe) {
      return { label: '✓ Terminée', bg: '#f3f4f6', color: '#374151' }
    } else if (course.statut === 'disponible') {
      return { label: '⏳ En attente', bg: '#fef3c7', color: '#d97706' }
    }
    return { label: course.statut, bg: '#f3f4f6', color: '#374151' }
  }

  const getModeReglement = (mode) => {
    switch (mode) {
      case 'especes': return '💵 Espèces'
      case 'facture': return '📄 Facture'
      case 'carte': return '💳 Carte bancaire'
      default: return mode
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
              Mes candidatures
            </h1>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
              {candidatures.length} candidature{candidatures.length > 1 ? 's' : ''}
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

        {candidatures.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
            padding: '48px 24px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📨</div>
            <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '16px' }}>
              Vous n'avez pas encore candidaté pour une course
            </p>
            <button
              onClick={() => navigate('/available-rides')}
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
              Voir les courses disponibles
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
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Société</th>
                    <th style={{ padding: '14px 16px', textAlign: 'right', fontWeight: '600', color: '#374151' }}>Prix</th>
                    <th style={{ padding: '14px 16px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Statut</th>
                    <th style={{ padding: '14px 16px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {candidatures.map((candidature, index) => {
                    const course = candidature.course
                    const statut = getStatutBadge(candidature)
                    const isExpanded = expandedCandidature === candidature.id
                    const isAttributedToMe = course.chauffeur_attribue_id === user.id
                    const canExpand = isAttributedToMe && (course.statut === 'attribuee' || course.statut === 'terminee')
                    
return (
                      <React.Fragment key={candidature.id}>
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
                              <button
                                onClick={() => handleAnnulerCandidature(candidature.id)}
                                disabled={actionLoading === `annuler-${candidature.id}`}
                                style={{
                                  backgroundColor: '#fef2f2',
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
                                Annuler
                              </button>
                            ) : canExpand ? (
                              <button
                                onClick={() => setExpandedCandidature(isExpanded ? null : candidature.id)}
                                style={{
                                  backgroundColor: '#059669',
                                  color: 'white',
                                  padding: '8px 16px',
                                  borderRadius: '6px',
                                  fontSize: '13px',
                                  fontWeight: '500',
                                  border: 'none',
                                  cursor: 'pointer'
                                }}
                              >
                                {isExpanded ? '▲ Fermer' : '▼ Détails'}
                              </button>
                            ) : course.statut === 'terminee' && isAttributedToMe ? (
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
                            ) : (
                              <span style={{ color: '#9ca3af', fontSize: '13px' }}>-</span>
                            )}
                          </td>
                        </tr>
                        
                        {/* Ligne expandable pour les détails */}
                        {isExpanded && canExpand && (
                          <tr key={`${candidature.id}-expanded`}>
                            <td colSpan="8" style={{ 
                              padding: '0',
                              backgroundColor: '#ecfdf5',
                              borderBottom: '1px solid #e5e7eb'
                            }}>
                              <div style={{ padding: '20px 24px' }}>
                                <div style={{ 
                                  fontSize: '15px', 
                                  fontWeight: '600', 
                                  color: '#059669', 
                                  marginBottom: '16px' 
                                }}>
                                  🎉 Détails de la course
                                </div>
                                
                                <div style={{ 
                                  display: 'grid', 
                                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                                  gap: '16px' 
                                }}>
                                  {/* Adresses */}
                                  <div style={{
                                    backgroundColor: 'white',
                                    padding: '16px',
                                    borderRadius: '8px',
                                    border: '1px solid #a7f3d0'
                                  }}>
                                    <div style={{ fontWeight: '600', color: '#065f46', marginBottom: '8px' }}>📍 Adresses</div>
                                    <div style={{ fontSize: '14px', color: '#065f46' }}>
                                      <div><strong>Départ :</strong> {course.adresse_depart || course.depart}</div>
                                      <div style={{ marginTop: '4px' }}><strong>Arrivée :</strong> {course.adresse_arrivee || course.arrivee}</div>
                                    </div>
                                  </div>

                                  {/* Passager */}
                                  {(course.client_nom || course.client_telephone) && (
                                    <div style={{
                                      backgroundColor: '#dbeafe',
                                      padding: '16px',
                                      borderRadius: '8px'
                                    }}>
                                      <div style={{ fontWeight: '600', color: '#1e40af', marginBottom: '8px' }}>👤 Passager</div>
                                      <div style={{ fontSize: '14px', color: '#1e40af' }}>
                                        <div style={{ fontWeight: '600' }}>{course.client_prenom} {course.client_nom}</div>
                                        {course.client_telephone && (
                                          <div>📞 <a href={`tel:${course.client_telephone}`} style={{ color: '#1e40af' }}>{course.client_telephone}</a></div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* Infos course */}
                                  <div style={{
                                    backgroundColor: 'white',
                                    padding: '16px',
                                    borderRadius: '8px',
                                    border: '1px solid #a7f3d0'
                                  }}>
                                    <div style={{ fontWeight: '600', color: '#065f46', marginBottom: '8px' }}>🚗 Détails</div>
                                    <div style={{ fontSize: '14px', color: '#065f46' }}>
                                      <div>Bagages : {course.nb_bagages || 0}</div>
                                      <div>Type : {course.type_course === 'privee' ? 'Privée' : 'Partagée'}</div>
                                      <div>Règlement : {getModeReglement(course.mode_reglement)}</div>
                                    </div>
                                  </div>

                                  {/* Société */}
                                  <div style={{
                                    backgroundColor: 'white',
                                    padding: '16px',
                                    borderRadius: '8px',
                                    border: '1px solid #a7f3d0'
                                  }}>
                                    <div style={{ fontWeight: '600', color: '#065f46', marginBottom: '8px' }}>🏢 Facturation</div>
                                    <div style={{ fontSize: '14px', color: '#065f46' }}>
                                      <div style={{ fontWeight: '600' }}>{course.societe?.raison_sociale || course.societe?.nom}</div>
                                      {course.societe?.numero_tva && <div>TVA : {course.societe.numero_tva}</div>}
                                      {course.societe?.rue && (
                                        <div>{course.societe.rue} {course.societe.numero}, {course.societe.code_postal} {course.societe.commune}</div>
                                      )}
                                      <div>📞 {course.societe?.telephone}</div>
                                      {course.societe?.email_facturation && <div>📧 {course.societe.email_facturation}</div>}
                                    </div>
                                  </div>
                                </div>

                                {/* Vol + Commentaires */}
                                {(course.numero_vol || course.commentaires) && (
                                  <div style={{ 
                                    display: 'flex', 
                                    gap: '16px', 
                                    marginTop: '16px',
                                    flexWrap: 'wrap'
                                  }}>
                                    {course.numero_vol && (
                                      <div style={{
                                        backgroundColor: '#d1fae5',
                                        padding: '12px 16px',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        color: '#065f46'
                                      }}>
                                        ✈️ Vol : {course.numero_vol} {course.provenance_destination_vol && `(${course.provenance_destination_vol})`}
                                      </div>
                                    )}
                                    {course.commentaires && (
                                      <div style={{
                                        backgroundColor: '#fef3c7',
                                        padding: '12px 16px',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        color: '#92400e',
                                        flex: 1
                                      }}>
                                        📝 {course.commentaires}
                                      </div>
                                    )}
                                  </div>
                                )}
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