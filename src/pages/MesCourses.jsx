import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'
import { sendAcceptationNotification, sendNonRetenuNotification } from '../services/emailService'

export default function MesCourses() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [activeTab, setActiveTab] = useState('a-effectuer')
  const [coursesPubliees, setCoursesPubliees] = useState([])
  const [coursesAEffectuer, setCoursesAEffectuer] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [expandedCourse, setExpandedCourse] = useState(null)
  const [candidatsVehicules, setCandidatsVehicules] = useState({})
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (user) fetchAllCourses()
  }, [user])

  const fetchAllCourses = async () => {
    setLoading(true)
    try {
      const { data: publiees } = await supabase.from('courses').select(`*, candidatures (id, prix_propose, chauffeur:users!chauffeur_id (id, nom, telephone, email, notif_email, note_moyenne_chauffeur, nb_courses_chauffeur)), chauffeur_attribue:users!chauffeur_attribue_id (id, nom, telephone, raison_sociale, numero_tva, rue, numero, code_postal, commune, email_facturation)`).eq('societe_id', user.id).order('date_heure', { ascending: true })
      setCoursesPubliees(publiees || [])

      const { data: aEffectuer } = await supabase.from('courses').select(`*, societe:users!societe_id (nom, telephone, note_moyenne, raison_sociale, numero_tva, rue, numero, code_postal, commune, email_facturation)`).eq('chauffeur_attribue_id', user.id).in('statut', ['attribuee', 'terminee']).order('date_heure', { ascending: true })
      setCoursesAEffectuer(aEffectuer || [])
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadVehiculesForCandidats = async (candidatures) => {
    if (!candidatures?.length) return
    const chauffeurIds = candidatures.map(c => c.chauffeur?.id).filter(id => id && !candidatsVehicules[id])
    if (!chauffeurIds.length) return
    const { data } = await supabase.from('vehicules').select('*').in('user_id', chauffeurIds)
    const vehiculesParChauffeur = {}
    chauffeurIds.forEach(id => vehiculesParChauffeur[id] = [])
    data?.forEach(v => { if (!vehiculesParChauffeur[v.user_id]) vehiculesParChauffeur[v.user_id] = []; vehiculesParChauffeur[v.user_id].push(v) })
    setCandidatsVehicules(prev => ({ ...prev, ...vehiculesParChauffeur }))
  }

  const handleExpandCourse = async (courseId, candidatures) => {
    if (expandedCourse === courseId) setExpandedCourse(null)
    else { setExpandedCourse(courseId); await loadVehiculesForCandidats(candidatures) }
  }

  const handleAcceptCandidature = async (courseId, chauffeurId, prixAccepte, allCandidatures) => {
    setActionLoading(`accept-${courseId}-${chauffeurId}`)
    try {
      await supabase.from('courses').update({ chauffeur_attribue_id: chauffeurId, statut: 'attribuee', prix: prixAccepte }).eq('id', courseId)
      const { data: courseData } = await supabase.from('courses').select('*').eq('id', courseId).single()
      const { data: chauffeur } = await supabase.from('users').select('email, notif_email').eq('id', chauffeurId).single()
      const { data: societe } = await supabase.from('users').select('nom, telephone, raison_sociale, numero_tva, rue, numero, code_postal, commune, email_facturation').eq('id', user.id).single()
      if (chauffeur?.notif_email) await sendAcceptationNotification({ course: courseData, chauffeurEmail: chauffeur.email, societe })
      for (const c of allCandidatures.filter(c => c.chauffeur?.id !== chauffeurId)) {
        if (c.chauffeur?.notif_email && c.chauffeur?.email) await sendNonRetenuNotification({ course: courseData, chauffeurEmail: c.chauffeur.email, chauffeurNom: c.chauffeur.nom })
      }
      await fetchAllCourses(); setExpandedCourse(null); alert('✅ Chauffeur accepté !')
    } catch (error) { alert('❌ Erreur: ' + error.message) }
    finally { setActionLoading(null) }
  }

  const handleTerminerCourse = async (courseId) => {
    if (!confirm('Confirmer que cette course est terminée ?')) return
    setActionLoading(`terminer-${courseId}`)
    try {
      await supabase.from('courses').update({ statut: 'terminee' }).eq('id', courseId)
      await fetchAllCourses(); alert('✅ Course terminée !')
    } catch (error) { alert('❌ Erreur: ' + error.message) }
    finally { setActionLoading(null) }
  }

  const handleAnnulerCourse = async (courseId) => {
    if (!confirm('Annuler cette course ?')) return
    setActionLoading(`annuler-${courseId}`)
    try {
      await supabase.from('candidatures').delete().eq('course_id', courseId)
      await supabase.from('courses').delete().eq('id', courseId)
      await fetchAllCourses(); alert('Course annulée')
    } catch (error) { alert('Erreur: ' + error.message) }
    finally { setActionLoading(null) }
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('fr-BE', { weekday: 'short', day: 'numeric', month: 'short' })
  const formatTime = (d) => new Date(d).toLocaleTimeString('fr-BE', { hour: '2-digit', minute: '2-digit' })
  const getStatutBadge = (c) => {
    if (c.statut === 'disponible') return { label: '🟢 Disponible', bg: '#ecfdf5', color: '#059669' }
    if (c.statut === 'attribuee') return { label: '🔵 Attribuée', bg: '#dbeafe', color: '#1e40af' }
    return { label: '✓ Terminée', bg: '#f3f4f6', color: '#374151' }
  }
  const getModeReglement = (m) => m === 'especes' ? '💵 Espèces' : m === 'facture' ? '📄 Facture' : '💳 Carte'

  const countPublieesActives = coursesPubliees.filter(c => c.statut !== 'terminee').length
  const countAEffectuerActives = coursesAEffectuer.filter(c => c.statut !== 'terminee').length

  if (loading) return <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}><Header /><div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0', color: '#6b7280' }}>Chargement...</div></div>

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Header />
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px', paddingBottom: isMobile ? '90px' : '24px' }}>
        <h1 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 'bold', color: '#111827', margin: '0 0 20px 0' }}>Mes courses</h1>

        {/* Onglets */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '2px solid #e5e7eb' }}>
          <button onClick={() => setActiveTab('a-effectuer')} style={{
            padding: isMobile ? '10px 12px' : '12px 20px', fontSize: isMobile ? '13px' : '15px', fontWeight: '600', border: 'none', cursor: 'pointer',
            backgroundColor: activeTab === 'a-effectuer' ? '#111827' : 'transparent', color: activeTab === 'a-effectuer' ? 'white' : '#6b7280',
            borderRadius: '8px 8px 0 0', marginBottom: '-2px', borderBottom: activeTab === 'a-effectuer' ? '2px solid #111827' : '2px solid transparent',
            display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap'
          }}>
            📥 {isMobile ? 'À faire' : 'À effectuer'}
            {countAEffectuerActives > 0 && <span style={{ backgroundColor: activeTab === 'a-effectuer' ? 'white' : '#e5e7eb', color: activeTab === 'a-effectuer' ? '#111827' : '#6b7280', padding: '2px 8px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold' }}>{countAEffectuerActives}</span>}
          </button>
          <button onClick={() => setActiveTab('publiees')} style={{
            padding: isMobile ? '10px 12px' : '12px 20px', fontSize: isMobile ? '13px' : '15px', fontWeight: '600', border: 'none', cursor: 'pointer',
            backgroundColor: activeTab === 'publiees' ? '#111827' : 'transparent', color: activeTab === 'publiees' ? 'white' : '#6b7280',
            borderRadius: '8px 8px 0 0', marginBottom: '-2px', borderBottom: activeTab === 'publiees' ? '2px solid #111827' : '2px solid transparent',
            display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap'
          }}>
            📤 {isMobile ? 'Publiées' : 'Publiées'}
            {countPublieesActives > 0 && <span style={{ backgroundColor: activeTab === 'publiees' ? 'white' : '#e5e7eb', color: activeTab === 'publiees' ? '#111827' : '#6b7280', padding: '2px 8px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold' }}>{countPublieesActives}</span>}
          </button>
        </div>

        {activeTab === 'publiees' ? (
          <CoursesPublieesView courses={coursesPubliees} expanded={expandedCourse} vehicules={candidatsVehicules} actionLoading={actionLoading} onExpand={handleExpandCourse} onAccept={handleAcceptCandidature} onTerminer={handleTerminerCourse} onAnnuler={handleAnnulerCourse} formatDate={formatDate} formatTime={formatTime} getStatutBadge={getStatutBadge} navigate={navigate} isMobile={isMobile} />
        ) : (
          <CoursesAEffectuerView courses={coursesAEffectuer} formatDate={formatDate} formatTime={formatTime} getStatutBadge={getStatutBadge} getModeReglement={getModeReglement} navigate={navigate} isMobile={isMobile} />
        )}
      </main>
    </div>
  )
}

function CoursesPublieesView({ courses, expanded, vehicules, actionLoading, onExpand, onAccept, onTerminer, onAnnuler, formatDate, formatTime, getStatutBadge, navigate, isMobile }) {
  if (!courses.length) return <EmptyState icon="📤" text="Vous n'avez publié aucune course" btnText="+ Publier une course" onClick={() => navigate('/publish-ride')} />

  if (isMobile) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {courses.map((course) => {
        const statut = getStatutBadge(course), hasCand = course.candidatures?.length > 0, isExp = expanded === course.id
        return (
          <div key={course.id} style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ padding: '16px', cursor: hasCand && course.statut === 'disponible' ? 'pointer' : 'default' }} onClick={() => hasCand && course.statut === 'disponible' && onExpand(course.id, course.candidatures)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ fontSize: '14px', color: '#6b7280' }}><span style={{ fontWeight: '600', color: '#111827' }}>{formatDate(course.date_heure)}</span> • {formatTime(course.date_heure)}</div>
                <span style={{ backgroundColor: statut.bg, color: statut.color, padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '500' }}>{statut.label}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div><div style={{ fontWeight: '600', color: '#111827', fontSize: '16px' }}>{course.depart}</div><div style={{ color: '#6b7280', fontSize: '14px' }}>↓ {course.arrivee}</div></div>
                <span style={{ backgroundColor: '#ecfdf5', color: '#059669', padding: '6px 12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px' }}>{course.prix}€</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #f3f4f6' }}>
                <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#6b7280' }}>
                  <span>👥 {course.nb_passagers}</span>
                  {course.statut === 'disponible' && <span style={{ backgroundColor: hasCand ? '#dbeafe' : '#f3f4f6', color: hasCand ? '#1e40af' : '#6b7280', padding: '2px 8px', borderRadius: '10px', fontWeight: '600' }}>{course.candidatures?.length || 0} cand.</span>}
                  {course.chauffeur_attribue && <span style={{ color: '#059669' }}>🚗 {course.chauffeur_attribue.nom}</span>}
                </div>
                <div style={{ display: 'flex', gap: '8px' }} onClick={e => e.stopPropagation()}>
                  {course.statut === 'attribuee' && <button onClick={() => onTerminer(course.id)} style={{ backgroundColor: '#059669', color: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '500', border: 'none', cursor: 'pointer' }}>Terminer</button>}
                  {course.statut === 'disponible' && <button onClick={() => onAnnuler(course.id)} style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '500', border: 'none', cursor: 'pointer' }}>Annuler</button>}
                </div>
              </div>
            </div>
            {isExp && hasCand && course.statut === 'disponible' && (
              <div style={{ padding: '16px', backgroundColor: '#f0f9ff', borderTop: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e40af', marginBottom: '12px' }}>Choisir un chauffeur</div>
                {course.candidatures?.map(cand => {
                  const vehs = vehicules[cand.chauffeur?.id] || []
                  return (
                    <div key={cand.id} style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                          <div style={{ fontWeight: '600', color: '#111827' }}>{cand.chauffeur?.nom}</div>
                          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>⭐ {cand.chauffeur?.note_moyenne_chauffeur > 0 ? `${cand.chauffeur.note_moyenne_chauffeur}/5` : 'Nouveau'} • {cand.chauffeur?.nb_courses_chauffeur || 0} courses</div>
                          {vehs.length > 0 && <div style={{ fontSize: '12px', color: '#047857', marginTop: '4px' }}>🚐 {vehs[0].marque} {vehs[0].modele} • {vehs[0].nb_places} pl.</div>}
                        </div>
                        <button onClick={() => onAccept(course.id, cand.chauffeur?.id, course.prix, course.candidatures)} style={{ backgroundColor: '#059669', color: 'white', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', border: 'none', cursor: 'pointer' }}>Accepter</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )

  // Desktop table view
  return (
    <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
        <thead><tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
          {['Date', 'Heure', 'Trajet', 'Pax', 'Prix', 'Statut', 'Candidats', 'Actions'].map(h => <th key={h} style={{ padding: '14px 16px', textAlign: h === 'Prix' ? 'right' : h === 'Pax' || h === 'Candidats' || h === 'Actions' ? 'center' : 'left', fontWeight: '600', color: '#374151' }}>{h}</th>)}
        </tr></thead>
        <tbody>
          {courses.map((course, i) => {
            const statut = getStatutBadge(course), hasCand = course.candidatures?.length > 0, isExp = expanded === course.id, canExp = course.statut === 'disponible' && hasCand
            return (
              <React.Fragment key={course.id}>
                <tr style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: i % 2 === 0 ? 'white' : '#fafafa', cursor: canExp ? 'pointer' : 'default' }} onClick={() => canExp && onExpand(course.id, course.candidatures)}>
                  <td style={{ padding: '14px 16px', fontWeight: '500' }}>{formatDate(course.date_heure)}</td>
                  <td style={{ padding: '14px 16px' }}>{formatTime(course.date_heure)}</td>
                  <td style={{ padding: '14px 16px' }}><div style={{ fontWeight: '600' }}>{course.depart}</div><div style={{ color: '#6b7280', fontSize: '13px' }}>→ {course.arrivee}</div></td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>{course.nb_passagers}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}><span style={{ backgroundColor: '#ecfdf5', color: '#059669', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold' }}>{course.prix}€</span></td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}><span style={{ backgroundColor: statut.bg, color: statut.color, padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '500' }}>{statut.label}</span></td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>{course.statut === 'disponible' ? <span style={{ backgroundColor: hasCand ? '#dbeafe' : '#f3f4f6', color: hasCand ? '#1e40af' : '#6b7280', padding: '4px 10px', borderRadius: '12px', fontWeight: '600' }}>{course.candidatures?.length || 0}</span> : course.chauffeur_attribue ? <span style={{ color: '#059669' }}>{course.chauffeur_attribue.nom}</span> : '-'}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                    {course.statut === 'attribuee' && <button onClick={() => onTerminer(course.id)} style={{ backgroundColor: '#059669', color: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', border: 'none', cursor: 'pointer' }}>Terminer</button>}
                    {course.statut === 'disponible' && <button onClick={() => onAnnuler(course.id)} style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', border: 'none', cursor: 'pointer' }}>Annuler</button>}
                    {course.statut === 'terminee' && <span style={{ color: '#9ca3af' }}>—</span>}
                  </td>
                </tr>
                {isExp && canExp && (
                  <tr><td colSpan="8" style={{ padding: 0, backgroundColor: '#f0f9ff', borderBottom: '1px solid #e5e7eb' }}>
                    <div style={{ padding: '16px 24px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e40af', marginBottom: '12px' }}>Choisir un chauffeur</div>
                      {course.candidatures?.map(cand => {
                        const vehs = vehicules[cand.chauffeur?.id] || []
                        return (
                          <div key={cand.id} style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                            <div>
                              <div style={{ fontWeight: '600', fontSize: '16px' }}>{cand.chauffeur?.nom}</div>
                              <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>📞 {cand.chauffeur?.telephone} • ⭐ {cand.chauffeur?.note_moyenne_chauffeur > 0 ? `${cand.chauffeur.note_moyenne_chauffeur}/5` : 'Nouveau'} • 🚗 {cand.chauffeur?.nb_courses_chauffeur || 0} courses</div>
                              {vehs.length > 0 && <div style={{ fontSize: '12px', color: '#047857', marginTop: '6px', backgroundColor: '#f0fdf4', padding: '6px 10px', borderRadius: '6px', display: 'inline-block' }}>🚐 {vehs.map(v => `${v.marque} ${v.modele} (${v.nb_places}pl)`).join(', ')}</div>}
                            </div>
                            <button onClick={() => onAccept(course.id, cand.chauffeur?.id, course.prix, course.candidatures)} style={{ backgroundColor: '#059669', color: 'white', padding: '12px 24px', borderRadius: '6px', fontSize: '14px', fontWeight: '600', border: 'none', cursor: 'pointer' }}>Accepter</button>
                          </div>
                        )
                      })}
                    </div>
                  </td></tr>
                )}
              </React.Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function CoursesAEffectuerView({ courses, formatDate, formatTime, getStatutBadge, getModeReglement, navigate, isMobile }) {
  const [expanded, setExpanded] = useState(null)
  
  if (!courses.length) return <EmptyState icon="📥" text="Aucune course à effectuer" btnText="Voir les courses" onClick={() => navigate('/available-rides')} />

  if (isMobile) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {courses.map((course) => {
        const statut = getStatutBadge(course), isExp = expanded === course.id
        return (
          <div key={course.id} style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ padding: '16px', cursor: 'pointer' }} onClick={() => setExpanded(isExp ? null : course.id)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ fontSize: '14px', color: '#6b7280' }}><span style={{ fontWeight: '600', color: '#111827' }}>{formatDate(course.date_heure)}</span> • {formatTime(course.date_heure)}</div>
                <span style={{ backgroundColor: statut.bg, color: statut.color, padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '500' }}>{statut.label}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div><div style={{ fontWeight: '600', color: '#111827', fontSize: '16px' }}>{course.depart}</div><div style={{ color: '#6b7280', fontSize: '14px' }}>↓ {course.arrivee}</div></div>
                <span style={{ backgroundColor: '#ecfdf5', color: '#059669', padding: '6px 12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px' }}>{course.prix}€</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #f3f4f6', fontSize: '13px', color: '#6b7280' }}>
                <div>👥 {course.nb_passagers} • 🏢 {course.societe?.nom}</div>
                <span>{isExp ? '▲' : '▼'} Détails</span>
              </div>
            </div>
            {isExp && (
              <div style={{ padding: '16px', backgroundColor: '#ecfdf5', borderTop: '1px solid #e5e7eb' }}>
                <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', marginBottom: '10px' }}>
                  <div style={{ fontWeight: '600', color: '#065f46', marginBottom: '6px', fontSize: '13px' }}>📍 Adresses</div>
                  <div style={{ fontSize: '13px', color: '#065f46' }}><strong>Départ:</strong> {course.adresse_depart || course.depart}<br/><strong>Arrivée:</strong> {course.adresse_arrivee || course.arrivee}</div>
                </div>
                {(course.client_nom || course.client_telephone) && (
                  <div style={{ backgroundColor: '#dbeafe', padding: '12px', borderRadius: '8px', marginBottom: '10px' }}>
                    <div style={{ fontWeight: '600', color: '#1e40af', marginBottom: '6px', fontSize: '13px' }}>👤 Passager</div>
                    <div style={{ fontSize: '13px', color: '#1e40af' }}>{course.client_prenom} {course.client_nom}<br/>{course.client_telephone && <a href={`tel:${course.client_telephone}`} style={{ color: '#1e40af' }}>📞 {course.client_telephone}</a>}</div>
                  </div>
                )}
                <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontWeight: '600', color: '#065f46', marginBottom: '6px', fontSize: '13px' }}>🏢 Donneur d'ordre</div>
                  <div style={{ fontSize: '13px', color: '#065f46' }}>{course.societe?.raison_sociale || course.societe?.nom}<br/>📞 {course.societe?.telephone}<br/>{getModeReglement(course.mode_reglement)}</div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )

  // Desktop table
  return (
    <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
        <thead><tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
          {['Date', 'Heure', 'Trajet', 'Pax', 'Donneur d\'ordre', 'Prix', 'Statut'].map(h => <th key={h} style={{ padding: '14px 16px', textAlign: h === 'Prix' ? 'right' : h === 'Pax' || h === 'Statut' ? 'center' : 'left', fontWeight: '600', color: '#374151' }}>{h}</th>)}
        </tr></thead>
        <tbody>
          {courses.map((course, i) => {
            const statut = getStatutBadge(course), isExp = expanded === course.id
            return (
              <React.Fragment key={course.id}>
                <tr style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: i % 2 === 0 ? 'white' : '#fafafa', cursor: 'pointer' }} onClick={() => setExpanded(isExp ? null : course.id)}>
                  <td style={{ padding: '14px 16px', fontWeight: '500' }}>{formatDate(course.date_heure)}</td>
                  <td style={{ padding: '14px 16px' }}>{formatTime(course.date_heure)}</td>
                  <td style={{ padding: '14px 16px' }}><div style={{ fontWeight: '600' }}>{course.depart}</div><div style={{ color: '#6b7280', fontSize: '13px' }}>→ {course.arrivee}</div></td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>{course.nb_passagers}</td>
                  <td style={{ padding: '14px 16px' }}><div>{course.societe?.nom}</div>{course.societe?.note_moyenne > 0 && <div style={{ fontSize: '12px', color: '#f59e0b' }}>⭐ {course.societe.note_moyenne}/5</div>}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}><span style={{ backgroundColor: '#ecfdf5', color: '#059669', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold' }}>{course.prix}€</span></td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}><span style={{ backgroundColor: statut.bg, color: statut.color, padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '500' }}>{statut.label}</span></td>
                </tr>
                {isExp && (
                  <tr><td colSpan="7" style={{ padding: 0, backgroundColor: '#ecfdf5', borderBottom: '1px solid #e5e7eb' }}>
                    <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                      <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                        <div style={{ fontWeight: '600', color: '#065f46', marginBottom: '8px' }}>📍 Adresses</div>
                        <div style={{ fontSize: '14px', color: '#065f46' }}><strong>Départ:</strong> {course.adresse_depart || course.depart}<br/><strong>Arrivée:</strong> {course.adresse_arrivee || course.arrivee}</div>
                      </div>
                      {(course.client_nom || course.client_telephone) && (
                        <div style={{ backgroundColor: '#dbeafe', padding: '16px', borderRadius: '8px' }}>
                          <div style={{ fontWeight: '600', color: '#1e40af', marginBottom: '8px' }}>👤 Passager</div>
                          <div style={{ fontSize: '14px', color: '#1e40af' }}><strong>{course.client_prenom} {course.client_nom}</strong><br/>{course.client_telephone && <a href={`tel:${course.client_telephone}`} style={{ color: '#1e40af' }}>📞 {course.client_telephone}</a>}</div>
                        </div>
                      )}
                      <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                        <div style={{ fontWeight: '600', color: '#065f46', marginBottom: '8px' }}>🏢 Donneur d'ordre</div>
                        <div style={{ fontSize: '14px', color: '#065f46' }}><strong>{course.societe?.raison_sociale || course.societe?.nom}</strong><br/>📞 {course.societe?.telephone}<br/>{getModeReglement(course.mode_reglement)}</div>
                      </div>
                    </div>
                  </td></tr>
                )}
              </React.Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function EmptyState({ icon, text, btnText, onClick }) {
  return (
    <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', padding: '48px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>{icon}</div>
      <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '16px' }}>{text}</p>
      <button onClick={onClick} style={{ backgroundColor: '#111827', color: 'white', padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', border: 'none', cursor: 'pointer' }}>{btnText}</button>
    </div>
  )
}