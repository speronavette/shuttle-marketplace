import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'

export default function MyCandidatures() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [candidatures, setCandidatures] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [newPrice, setNewPrice] = useState('')
  const [updateLoading, setUpdateLoading] = useState(false)

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
    }
  }

  const handleStartEdit = (candidature) => {
    setEditingId(candidature.id)
    setNewPrice(candidature.prix_propose.toString())
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setNewPrice('')
  }

  const handleUpdatePrice = async (candidature) => {
    const nouveauPrix = parseFloat(newPrice)
    
    // Validations
    if (isNaN(nouveauPrix) || nouveauPrix <= 0) {
      alert('⚠️ Veuillez entrer un prix valide')
      return
    }
    
    if (nouveauPrix >= candidature.prix_propose) {
      alert('⚠️ Le nouveau prix doit être inférieur à votre offre actuelle (' + candidature.prix_propose + '€)')
      return
    }
    
    if (nouveauPrix > candidature.course.prix) {
      alert('⚠️ Le prix ne peut pas dépasser le prix demandé (' + candidature.course.prix + '€)')
      return
    }

    setUpdateLoading(true)
    
    try {
      const { error } = await supabase
        .from('candidatures')
        .update({ prix_propose: nouveauPrix })
        .eq('id', candidature.id)

      if (error) throw error

      await fetchMyCandidatures()
      setEditingId(null)
      setNewPrice('')
      alert('✅ Offre mise à jour : ' + nouveauPrix + '€')
    } catch (error) {
      alert('❌ Erreur: ' + error.message)
    } finally {
      setUpdateLoading(false)
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

  const getStatutCandidature = (candidature) => {
    const course = candidature.course
    
    if (course.statut === 'attribuee' && course.chauffeur_attribue_id === user.id) {
      return { label: '✅ Acceptée', style: { backgroundColor: '#ecfdf5', color: '#059669' } }
    } else if (course.statut === 'attribuee' && course.chauffeur_attribue_id !== user.id) {
      return { label: '❌ Non retenue', style: { backgroundColor: '#fef2f2', color: '#dc2626' } }
    } else if (course.statut === 'terminee') {
      return { label: '✓ Terminée', style: { backgroundColor: '#f3f4f6', color: '#374151' } }
    } else {
      return { label: '⏳ En attente', style: { backgroundColor: '#fef3c7', color: '#92400e' } }
    }
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
        maxWidth: '600px',
        margin: '0 auto',
        padding: '32px 16px'
      }}>
        {/* Titre */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
            Mes candidatures
          </h1>
          <p style={{ fontSize: '15px', color: '#6b7280', margin: 0 }}>
            {candidatures.length} candidature(s)
          </p>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {candidatures.map((candidature) => {
              const statut = getStatutCandidature(candidature)
              const course = candidature.course
              const isEditing = editingId === candidature.id

              return (
                <div
                  key={candidature.id}
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
                        📅 {formatDate(course.date_heure)} à {formatTime(course.date_heure)}
                      </div>
                      <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '2px' }}>
                        👥 {course.nb_passagers} passager(s) • 🏢 {course.societe?.nom}
                      </div>
                    </div>
                    <div style={{
                      ...statut.style,
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '500'
                    }}>
                      {statut.label}
                    </div>
                  </div>

                  {/* Mon offre vs Prix demandé */}
                  {course.statut === 'disponible' && (
                    <div style={{
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      padding: '12px',
                      marginBottom: '12px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                        <div style={{ textAlign: 'center', flex: 1 }}>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>Prix demandé</div>
                          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#374151' }}>{course.prix}€</div>
                        </div>
                        
                        <div style={{ fontSize: '20px', color: '#9ca3af' }}>→</div>
                        
                        <div style={{ 
                          textAlign: 'center', 
                          flex: 1,
                          backgroundColor: candidature.prix_propose < course.prix ? '#ecfdf5' : '#f3f4f6',
                          padding: '8px',
                          borderRadius: '8px',
                          border: candidature.prix_propose < course.prix ? '2px solid #059669' : 'none'
                        }}>
                          <div style={{ fontSize: '12px', color: candidature.prix_propose < course.prix ? '#059669' : '#6b7280' }}>
                            Mon offre
                          </div>
                          <div style={{ 
                            fontSize: '20px', 
                            fontWeight: 'bold', 
                            color: candidature.prix_propose < course.prix ? '#059669' : '#374151' 
                          }}>
                            {candidature.prix_propose}€
                          </div>
                          {candidature.prix_propose < course.prix && (
                            <div style={{ fontSize: '11px', color: '#059669' }}>
                              -{course.prix - candidature.prix_propose}€
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Zone de modification */}
                      {isEditing ? (
                        <div style={{ 
                          marginTop: '12px', 
                          paddingTop: '12px', 
                          borderTop: '1px solid #e5e7eb' 
                        }}>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                            💰 Modifier mon offre (à la baisse uniquement)
                          </div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input
                              type="number"
                              value={newPrice}
                              onChange={(e) => setNewPrice(e.target.value)}
                              max={candidature.prix_propose - 1}
                              min="1"
                              style={{
                                flex: 1,
                                padding: '10px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '16px',
                                fontWeight: 'bold'
                              }}
                              placeholder="Nouveau prix"
                            />
                            <span style={{ fontSize: '14px', color: '#6b7280' }}>€</span>
                          </div>
                          {newPrice && parseFloat(newPrice) >= candidature.prix_propose && (
                            <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>
                              ⚠️ Le prix doit être inférieur à {candidature.prix_propose}€
                            </p>
                          )}
                          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                            <button
                              onClick={() => handleUpdatePrice(candidature)}
                              disabled={updateLoading || !newPrice || parseFloat(newPrice) >= candidature.prix_propose}
                              style={{
                                flex: 1,
                                backgroundColor: (!newPrice || parseFloat(newPrice) >= candidature.prix_propose) ? '#9ca3af' : '#059669',
                                color: 'white',
                                padding: '10px',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: '500',
                                border: 'none',
                                cursor: (!newPrice || parseFloat(newPrice) >= candidature.prix_propose) ? 'not-allowed' : 'pointer',
                                opacity: updateLoading ? 0.7 : 1
                              }}
                            >
                              {updateLoading ? 'Mise à jour...' : `✓ Confirmer ${newPrice || '...'}€`}
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              style={{
                                backgroundColor: '#f3f4f6',
                                color: '#374151',
                                padding: '10px 16px',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: '500',
                                border: 'none',
                                cursor: 'pointer'
                              }}
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(candidature)}
                          style={{
                            width: '100%',
                            marginTop: '12px',
                            backgroundColor: '#dbeafe',
                            color: '#1e40af',
                            padding: '10px',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '500',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          📉 Baisser mon offre
                        </button>
                      )}
                    </div>
                  )}

                  {/* Détails complets si accepté */}
                  {course.statut === 'attribuee' && course.chauffeur_attribue_id === user.id && (
                    <div style={{
                      backgroundColor: '#ecfdf5',
                      borderRadius: '8px',
                      padding: '16px',
                      marginTop: '12px'
                    }}>
                      <div style={{ fontSize: '15px', fontWeight: '600', color: '#059669', marginBottom: '12px' }}>
                        🎉 Course attribuée - Détails complets
                      </div>
                      
                      {/* Prix accepté */}
                      <div style={{
                        backgroundColor: '#d1fae5',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        marginBottom: '12px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: '#065f46',
                        textAlign: 'center'
                      }}>
                        💰 Prix accepté : {course.prix}€
                      </div>
                      
                      {/* Adresses */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px', color: '#065f46' }}>
                        <div><strong>📍 Départ :</strong> {course.adresse_depart || 'Non précisée'}</div>
                        <div><strong>📍 Arrivée :</strong> {course.adresse_arrivee || 'Non précisée'}</div>
                        <div><strong>🧳 Bagages :</strong> {course.nb_bagages || 0}</div>
                        <div><strong>🚗 Type :</strong> {course.type_course === 'privee' ? 'Privée' : 'Partagée'}</div>
                        <div><strong>💳 Règlement :</strong> {getModeReglement(course.mode_reglement)}</div>
                        {course.prix_initial && (
                          <div><strong>💰 Prix client :</strong> {course.prix_initial}€</div>
                        )}
                      </div>

                      {/* Infos client/passager */}
<div style={{ 
  backgroundColor: '#dbeafe', 
  borderRadius: '8px', 
  padding: '16px', 
  marginBottom: '16px' 
}}>
  <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e40af', marginBottom: '8px' }}>
    👤 Passager à prendre en charge
  </div>
  <div style={{ fontSize: '15px', color: '#1e40af' }}>
    <div style={{ fontWeight: '600', marginBottom: '4px' }}>
      {course.client_prenom} {course.client_nom}
    </div>
    <div>
      📞 <a href={`tel:${course.client_telephone}`} style={{ color: '#1e40af' }}>
        {course.client_telephone}
      </a>
    </div>
  </div>
</div>

                      {/* Infos vol */}
                      {(course.numero_vol || course.provenance_destination_vol) && (
                        <div style={{ marginTop: '12px', padding: '8px', backgroundColor: '#d1fae5', borderRadius: '6px', fontSize: '14px', color: '#065f46' }}>
                          {course.numero_vol && <div><strong>✈️ Vol :</strong> {course.numero_vol}</div>}
                          {course.provenance_destination_vol && <div><strong>🌍 Provenance/Dest :</strong> {course.provenance_destination_vol}</div>}
                        </div>
                      )}

                      {/* Commentaires */}
                      {course.commentaires && (
                        <div style={{ marginTop: '12px', padding: '8px', backgroundColor: '#fef3c7', borderRadius: '6px', fontSize: '14px', color: '#92400e' }}>
                          <strong>📝 Instructions :</strong> {course.commentaires}
                        </div>
                      )}

                      {/* Infos de facturation de la société */}
                      <div style={{ 
                        marginTop: '16px', 
                        paddingTop: '16px', 
                        borderTop: '2px solid #a7f3d0'
                      }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#065f46', marginBottom: '12px' }}>
                          🏢 Informations de facturation
                        </div>
                        
                        <div style={{ 
                          backgroundColor: 'white', 
                          borderRadius: '8px', 
                          padding: '12px',
                          fontSize: '14px',
                          color: '#065f46'
                        }}>
                          <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '8px' }}>
                            {course.societe?.raison_sociale || course.societe?.nom}
                          </div>
                          
                          {course.societe?.numero_tva && (
                            <div style={{ marginBottom: '4px' }}>
                              <strong>TVA :</strong> {course.societe.numero_tva}
                            </div>
                          )}
                          
                          {(course.societe?.rue || course.societe?.commune) && (
                            <div style={{ marginBottom: '4px' }}>
                              <strong>Adresse :</strong> {course.societe.rue} {course.societe.numero}, {course.societe.code_postal} {course.societe.commune}
                            </div>
                          )}
                          
                          <div style={{ marginBottom: '4px' }}>
                            <strong>📞 Téléphone :</strong> {course.societe?.telephone}
                          </div>
                          
                          {course.societe?.email_facturation && (
                            <div>
                              <strong>📧 Email facturation :</strong> {course.societe.email_facturation}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                    {course.statut === 'disponible' && (
                      <button
                        onClick={() => handleAnnulerCandidature(candidature.id)}
                        style={{
                          backgroundColor: '#fef2f2',
                          color: '#dc2626',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: '500',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        Annuler ma candidature
                      </button>
                    )}
                    
                    {course.statut === 'terminee' && course.chauffeur_attribue_id === user.id && (
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
                        ⭐ Noter la société
                      </button>
                    )}
                    
                    <button
                      onClick={() => navigate(`/ride/${course.id}`)}
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
                      Voir détails
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}