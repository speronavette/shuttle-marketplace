import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'
import Chat from '../components/Chat'
import { sendCandidatureNotification } from '../services/emailService'

export default function RideDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [candidatureLoading, setCandidatureLoading] = useState(false)
  const [hasCandidature, setHasCandidature] = useState(false)
  const [message, setMessage] = useState('')
  const [userProfile, setUserProfile] = useState(null)

  useEffect(() => {
    fetchCourse()
    checkCandidature()
    fetchUserProfile()
  }, [id, user])

  const fetchCourse = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          societe:users!societe_id (id, nom, telephone, note_moyenne, nb_courses_total, raison_sociale, numero_tva, rue, numero, code_postal, commune, email_facturation),
          chauffeur_attribue:users!chauffeur_attribue_id (id, nom, telephone)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      setCourse(data)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserProfile = async () => {
    if (!user) return
    
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

  const checkCandidature = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('candidatures')
        .select('id')
        .eq('course_id', id)
        .eq('chauffeur_id', user.id)
        .maybeSingle()  // maybeSingle() ne génère pas d'erreur si 0 résultat

      if (!error && data) {
        setHasCandidature(true)
      }
    } catch (error) {
      console.error('Erreur vérification candidature:', error)
    }
  }

  const handleCandidature = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    // Vérifier si l'utilisateur est validé
    if (!userProfile?.valide) {
      setMessage('⚠️ Votre profil n\'est pas encore validé. Veuillez envoyer vos documents à shuttlemarketplace@gmail.com')
      return
    }

    setCandidatureLoading(true)
    setMessage('')

    try {
      // Si mode "premier arrivé", on attribue directement la course
      if (course.mode_attribution === 'premier_arrive') {
        // Vérifier qu'il n'y a pas déjà un chauffeur attribué
        const { data: checkCourse } = await supabase
          .from('courses')
          .select('chauffeur_attribue_id, statut')
          .eq('id', id)
          .single()

        if (checkCourse?.chauffeur_attribue_id || checkCourse?.statut !== 'disponible') {
          setMessage('⚠️ Cette course a déjà été attribuée à un autre chauffeur')
          setCandidatureLoading(false)
          return
        }

        // Créer la candidature ET attribuer la course en même temps
        const { error: candError } = await supabase
          .from('candidatures')
          .insert([
            {
              course_id: id,
              chauffeur_id: user.id,
              prix_propose: course.prix
            }
          ])

        if (candError) throw candError

        // Attribuer la course
        const { error: updateError } = await supabase
          .from('courses')
          .update({
            chauffeur_attribue_id: user.id,
            statut: 'attribuee'
          })
          .eq('id', id)

        if (updateError) throw updateError

        // Envoyer notification au donneur d'ordre
        const { data: societe } = await supabase
          .from('users')
          .select('email, notif_email')
          .eq('id', course.societe_id)
          .single()

        const { data: candidat } = await supabase
          .from('users')
          .select('nom, telephone')
          .eq('id', user.id)
          .single()

        if (societe?.notif_email) {
          await sendCandidatureNotification({
            course,
            candidat,
            prixPropose: course.prix,
            sociétéEmail: societe.email,
            autoAttribue: true
          })
        }

        setHasCandidature(true)
        setMessage('🎉 Course attribuée ! Vous avez obtenu cette course.')
        
        // Rafraîchir pour afficher les détails
        setTimeout(() => {
          fetchCourse()
        }, 1000)

      } else {
        // Mode "choix" - candidature normale
        const { error } = await supabase
          .from('candidatures')
          .insert([
            {
              course_id: id,
              chauffeur_id: user.id,
              prix_propose: course.prix
            }
          ])

        if (error) throw error

        // Récupérer les infos du candidat
        const { data: candidat } = await supabase
          .from('users')
          .select('nom, note_moyenne_chauffeur, nb_courses_chauffeur')
          .eq('id', user.id)
          .single()

        // Récupérer l'email de la société
        const { data: societe } = await supabase
          .from('users')
          .select('email, notif_email, notif_immediate')
          .eq('id', course.societe_id)
          .single()

        // Envoyer notification à la société si elle veut des notifications immédiates
        if (societe?.notif_email && societe?.notif_immediate) {
          await sendCandidatureNotification({
            course,
            candidat,
            prixPropose: course.prix,
            sociétéEmail: societe.email
          })
          console.log('📧 Notification de candidature envoyée')
        }

        setHasCandidature(true)
        setMessage('✅ Candidature envoyée ! Le donneur d\'ordre vous répondra sous 48h.')
      }
    } catch (error) {
      if (error.code === '23505') {
        setMessage('⚠️ Vous avez déjà candidaté pour cette course')
      } else {
        setMessage('❌ Erreur: ' + error.message)
      }
    } finally {
      setCandidatureLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-BE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('fr-BE', {
      hour: '2-digit',
      minute: '2-digit'
    })
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

  if (!course) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <Header />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px 0' }}>
          <div style={{ fontSize: '18px', color: '#dc2626' }}>Course non trouvée</div>
        </div>
      </div>
    )
  }

  const isOwner = user?.id === course.societe_id
  const isAttributedToMe = course.chauffeur_attribue_id === user?.id
  const isValidated = userProfile?.valide === true

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Header />

      <main style={{
        maxWidth: '600px',
        margin: '0 auto',
        padding: '32px 16px'
      }}>
        {/* Alerte profil non validé */}
        {user && !isOwner && !isValidated && (
          <div style={{
            backgroundColor: '#fef3c7',
            border: '1px solid #fcd34d',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <span style={{ fontSize: '24px' }}>⚠️</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#92400e', marginBottom: '8px' }}>
                  Profil en attente de validation
                </div>
                <p style={{ fontSize: '14px', color: '#78350f', margin: '0 0 12px 0' }}>
                  Pour pouvoir candidater aux courses, envoyez vos documents :
                </p>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '6px',
                  marginBottom: '16px'
                }}>
                  <div style={{ fontSize: '13px', color: '#78350f' }}>📄 Autorisation d'exploiter</div>
                  <div style={{ fontSize: '13px', color: '#78350f' }}>🚗 Attestation véhicule</div>
                  <div style={{ fontSize: '13px', color: '#78350f' }}>🛡️ Assurance transport de personnes</div>
                  <div style={{ fontSize: '13px', color: '#78350f' }}>📋 Certificat d'immatriculation</div>
                  <div style={{ fontSize: '13px', color: '#78350f' }}>💳 Carte verte</div>
                </div>
                <a
                  href="mailto:shuttlemarketplace@gmail.com?subject=Documents%20-%20Validation%20profil&body=Bonjour,%0A%0AVeuillez%20trouver%20ci-joint%20mes%20documents%20pour%20la%20validation%20de%20mon%20profil.%0A%0ANom%20:%20%0ATéléphone%20:%20%0A%0ACordialement"
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
                  📧 Envoyer mes documents
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Carte principale */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb',
          padding: '24px'
        }}>
          {/* Trajet */}
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
            {course.depart} → {course.arrivee}
          </h1>
          <div style={{
            display: 'inline-block',
            backgroundColor: course.statut === 'attribuee' ? '#dbeafe' : course.statut === 'terminee' ? '#f3f4f6' : '#ecfdf5',
            color: course.statut === 'attribuee' ? '#1e40af' : course.statut === 'terminee' ? '#374151' : '#059669',
            padding: '4px 12px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '500',
            marginBottom: '24px'
          }}>
            {course.statut === 'disponible' ? 'Disponible' : course.statut === 'attribuee' ? 'Attribuée' : course.statut === 'terminee' ? 'Terminée' : course.statut}
          </div>

          {/* Détails de base */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px' }}>
              <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>📅 Date</div>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>{formatDate(course.date_heure)}</div>
            </div>
            <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px' }}>
              <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>🕐 Heure</div>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>{formatTime(course.date_heure)}</div>
            </div>
            <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px' }}>
              <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>👥 Passagers</div>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>{course.nb_passagers} personne(s)</div>
            </div>
            <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px' }}>
              <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>🧳 Bagages</div>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>{course.nb_bagages || 0}</div>
            </div>
            <div style={{ backgroundColor: '#ecfdf5', padding: '16px', borderRadius: '8px' }}>
              <div style={{ fontSize: '13px', color: '#059669', marginBottom: '4px' }}>💰 Prix</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>{course.prix}€</div>
            </div>
          </div>

          {/* Infos supplémentaires de base */}
          {(course.type_course || course.mode_reglement || course.mode_attribution) && (
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
              {course.mode_attribution === 'premier_arrive' && (
                <div style={{
                  backgroundColor: '#fef3c7',
                  color: '#92400e',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  ⚡ Premier arrivé
                </div>
              )}
              {course.type_course && (
                <div style={{
                  backgroundColor: course.type_course === 'privee' ? '#fef3c7' : '#dbeafe',
                  color: course.type_course === 'privee' ? '#92400e' : '#1e40af',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}>
                  {course.type_course === 'privee' ? '🚗 Course privée' : '👥 Course partagée'}
                </div>
              )}
              {course.mode_reglement && (
                <div style={{
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}>
                  {getModeReglement(course.mode_reglement)}
                </div>
              )}
            </div>
          )}

          {/* SECTION DÉTAILS COMPLETS - Visible uniquement si la course m'est attribuée */}
          {isAttributedToMe && (
            <div style={{
              backgroundColor: '#ecfdf5',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px',
              border: '2px solid #059669'
            }}>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#059669', marginBottom: '16px' }}>
                🎉 Course attribuée - Détails complets
              </div>

              {/* Adresses complètes */}
              <div style={{ 
                backgroundColor: 'white', 
                borderRadius: '8px', 
                padding: '16px', 
                marginBottom: '16px' 
              }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#065f46', marginBottom: '12px' }}>
                  📍 Adresses
                </div>
                <div style={{ display: 'grid', gap: '8px', fontSize: '14px', color: '#065f46' }}>
                  <div>
                    <strong>Départ :</strong> {course.adresse_depart || course.depart}
                  </div>
                  <div>
                    <strong>Arrivée :</strong> {course.adresse_arrivee || course.arrivee}
                  </div>
                </div>
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

              {/* Détails course */}
              <div style={{ 
                backgroundColor: 'white', 
                borderRadius: '8px', 
                padding: '16px', 
                marginBottom: '16px' 
              }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#065f46', marginBottom: '12px' }}>
                  🚗 Détails de la course
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px', color: '#065f46' }}>
                  <div><strong>Passagers :</strong> {course.nb_passagers}</div>
                  <div><strong>Bagages :</strong> {course.nb_bagages || 0}</div>
                  <div><strong>Type :</strong> {course.type_course === 'privee' ? 'Privée' : 'Partagée'}</div>
                  <div><strong>Règlement :</strong> {getModeReglement(course.mode_reglement)}</div>
                </div>
              </div>

              {/* Infos vol si présentes */}
              {(course.numero_vol || course.provenance_destination_vol) && (
                <div style={{ 
                  backgroundColor: '#d1fae5', 
                  borderRadius: '8px', 
                  padding: '16px', 
                  marginBottom: '16px' 
                }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#065f46', marginBottom: '8px' }}>
                    ✈️ Informations vol
                  </div>
                  {course.numero_vol && (
                    <div style={{ fontSize: '14px', color: '#065f46' }}>
                      <strong>Numéro de vol :</strong> {course.numero_vol}
                    </div>
                  )}
                  {course.provenance_destination_vol && (
                    <div style={{ fontSize: '14px', color: '#065f46', marginTop: '4px' }}>
                      <strong>Provenance/Destination :</strong> {course.provenance_destination_vol}
                    </div>
                  )}
                </div>
              )}

              {/* Commentaires/Instructions */}
              {course.commentaires && (
                <div style={{ 
                  backgroundColor: '#fef3c7', 
                  borderRadius: '8px', 
                  padding: '16px', 
                  marginBottom: '16px' 
                }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#92400e', marginBottom: '8px' }}>
                    📝 Instructions particulières
                  </div>
                  <div style={{ fontSize: '14px', color: '#92400e' }}>
                    {course.commentaires}
                  </div>
                </div>
              )}

              {/* Infos de facturation de la société */}
              <div style={{ 
                backgroundColor: 'white', 
                borderRadius: '8px', 
                padding: '16px',
                border: '1px solid #a7f3d0'
              }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#065f46', marginBottom: '12px' }}>
                  🏢 Informations de facturation
                </div>
                <div style={{ fontSize: '14px', color: '#065f46' }}>
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

          {/* Chat - visible si course attribuée (pour chauffeur attribué OU donneur d'ordre) */}
          {course.statut !== 'disponible' && (isAttributedToMe || isOwner) && course.chauffeur_attribue_id && (
            <div style={{ marginBottom: '24px' }}>
              <Chat 
                courseId={course.id} 
                otherUserName={isOwner ? course.chauffeur_attribue?.nom : course.societe?.nom}
              />
            </div>
          )}

          {/* Publié par - Toujours visible */}
          {!isAttributedToMe && (
            <div style={{
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                Publié par
              </div>
              <div style={{ fontSize: '15px', color: '#111827' }}>
                <strong>{course.societe?.nom}</strong>
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                ⭐ {course.societe?.note_moyenne > 0 ? `${course.societe.note_moyenne}/5` : 'Pas encore de note'} • 
                🚗 {course.societe?.nb_courses_total || 0} courses
              </div>
            </div>
          )}

          {/* Message */}
          {message && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '16px',
              backgroundColor: message.includes('✅') ? '#ecfdf5' : message.includes('⚠️') ? '#fef3c7' : '#fef2f2',
              color: message.includes('✅') ? '#059669' : message.includes('⚠️') ? '#92400e' : '#dc2626',
              fontSize: '14px'
            }}>
              {message}
            </div>
          )}

          {/* Actions */}
          {isOwner ? (
            <div style={{
              backgroundColor: '#f3f4f6',
              padding: '16px',
              borderRadius: '8px',
              textAlign: 'center',
              color: '#6b7280',
              fontSize: '15px'
            }}>
              C'est votre propre course
            </div>
          ) : isAttributedToMe ? (
            <div style={{
              backgroundColor: '#dbeafe',
              padding: '16px',
              borderRadius: '8px',
              textAlign: 'center',
              color: '#1e40af',
              fontSize: '15px'
            }}>
              ✅ Cette course vous a été attribuée
              {course.statut === 'terminee' && (
                <button
                  onClick={() => navigate(`/rate/${course.id}`)}
                  style={{
                    display: 'block',
                    width: '100%',
                    marginTop: '12px',
                    backgroundColor: '#f59e0b',
                    color: 'white',
                    padding: '12px',
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
            </div>
          ) : hasCandidature ? (
            <div style={{
              backgroundColor: '#ecfdf5',
              padding: '16px',
              borderRadius: '8px',
              textAlign: 'center',
              color: '#059669',
              fontSize: '15px'
            }}>
              ✅ Vous avez déjà candidaté pour cette course
            </div>
          ) : course.statut === 'disponible' ? (
            // Bouton de candidature - désactivé si non validé
            !isValidated ? (
              <div style={{
                backgroundColor: '#fef2f2',
                padding: '20px',
                borderRadius: '8px',
                textAlign: 'center',
                border: '1px solid #fecaca'
              }}>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#dc2626', marginBottom: '8px' }}>
                  🔒 Candidature bloquée
                </div>
                <p style={{ fontSize: '14px', color: '#991b1b', marginBottom: '16px' }}>
                  Votre profil doit être validé avant de pouvoir candidater aux courses.
                </p>
                <a
                  href="mailto:shuttlemarketplace@gmail.com?subject=Documents%20-%20Validation%20profil"
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontWeight: '500',
                    textDecoration: 'none'
                  }}
                >
                  📧 Envoyer mes documents
                </a>
              </div>
            ) : (
              <div>
                {course.mode_attribution === 'premier_arrive' && (
                  <div style={{
                    backgroundColor: '#fef3c7',
                    border: '1px solid #fcd34d',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    marginBottom: '16px',
                    textAlign: 'center'
                  }}>
                    <span style={{ fontSize: '14px', color: '#92400e', fontWeight: '500' }}>
                      ⚡ Mode "Premier arrivé" — Si vous candidatez, la course vous est attribuée immédiatement !
                    </span>
                  </div>
                )}
                <button
                  onClick={handleCandidature}
                  disabled={candidatureLoading}
                  style={{
                    width: '100%',
                    backgroundColor: '#059669',
                    color: 'white',
                    padding: '18px',
                    borderRadius: '8px',
                    fontSize: '18px',
                    fontWeight: '600',
                    border: 'none',
                    cursor: candidatureLoading ? 'not-allowed' : 'pointer',
                    opacity: candidatureLoading ? 0.7 : 1
                  }}
                >
                  {candidatureLoading 
                    ? 'Envoi en cours...' 
                    : course.mode_attribution === 'premier_arrive'
                      ? `⚡ Prendre cette course pour ${course.prix}€`
                      : `🚗 Candidater pour ${course.prix}€`
                  }
                </button>
              </div>
            )
          ) : (
            <div style={{
              backgroundColor: '#f3f4f6',
              padding: '16px',
              borderRadius: '8px',
              textAlign: 'center',
              color: '#6b7280',
              fontSize: '15px'
            }}>
              Cette course n'est plus disponible
            </div>
          )}
        </div>
      </main>
    </div>
  )
}