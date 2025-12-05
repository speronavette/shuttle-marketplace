import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'

// Liste des emails admin autorisés
const ADMIN_EMAILS = ['shuttlemarketplace@gmail.com']

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [courses, setCourses] = useState([])
  const [societes, setSocietes] = useState([])
  const [chauffeurs, setChauffeurs] = useState([])
  const [activeTab, setActiveTab] = useState('global')

  // Vérifier si l'utilisateur est admin
  const isAdmin = user && ADMIN_EMAILS.includes(user.email)

  useEffect(() => {
    if (user && isAdmin) {
      fetchAllData()
    }
  }, [user, isAdmin])

  const fetchAllData = async () => {
    try {
      // Récupérer toutes les courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select(`
          *,
          societe:users!societe_id (id, nom, email, raison_sociale),
          chauffeur_attribue:users!chauffeur_attribue_id (id, nom, email),
          candidatures (id, chauffeur_id, prix_propose)
        `)
        .order('created_at', { ascending: false })

      if (coursesError) throw coursesError

      // Récupérer tous les utilisateurs
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (usersError) throw usersError

      // Séparer sociétés et chauffeurs
      const societesData = usersData.filter(u => u.type === 'societe')
      const chauffeursData = usersData.filter(u => u.type === 'chauffeur')

      setCourses(coursesData || [])
      setSocietes(societesData || [])
      setChauffeurs(chauffeursData || [])

      // Calculer les stats globales
      const totalCourses = coursesData?.length || 0
      const coursesAttribuees = coursesData?.filter(c => c.statut === 'attribuee' || c.statut === 'terminee').length || 0
      const coursesDisponibles = coursesData?.filter(c => c.statut === 'disponible').length || 0
      const coursesTerminees = coursesData?.filter(c => c.statut === 'terminee').length || 0
      const coursesSansCandidature = coursesData?.filter(c => c.statut === 'disponible' && (!c.candidatures || c.candidatures.length === 0)).length || 0
      
      const totalCandidatures = coursesData?.reduce((acc, c) => acc + (c.candidatures?.length || 0), 0) || 0
      
      const prixTotal = coursesData?.filter(c => c.statut === 'terminee').reduce((acc, c) => acc + (c.prix || 0), 0) || 0

      setStats({
        totalCourses,
        coursesAttribuees,
        coursesDisponibles,
        coursesTerminees,
        coursesSansCandidature,
        totalCandidatures,
        prixTotal,
        tauxAttribution: totalCourses > 0 ? Math.round((coursesAttribuees / totalCourses) * 100) : 0,
        totalSocietes: societesData?.length || 0,
        totalChauffeurs: chauffeursData?.length || 0,
        societesActives: new Set(coursesData?.map(c => c.societe_id)).size,
        chauffeursActifs: new Set(coursesData?.flatMap(c => c.candidatures?.map(cand => cand.chauffeur_id) || [])).size
      })

    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-BE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-BE', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatutBadge = (statut) => {
    const styles = {
      disponible: { bg: '#fef3c7', color: '#d97706', label: '⏳ Disponible' },
      attribuee: { bg: '#dbeafe', color: '#1e40af', label: '🚗 Attribuée' },
      terminee: { bg: '#ecfdf5', color: '#059669', label: '✅ Terminée' },
      annulee: { bg: '#fef2f2', color: '#dc2626', label: '❌ Annulée' }
    }
    const style = styles[statut] || styles.disponible
    return (
      <span style={{
        backgroundColor: style.bg,
        color: style.color,
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '500'
      }}>
        {style.label}
      </span>
    )
  }

  // Si pas admin, rediriger
  if (!loading && !isAdmin) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <Header />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          padding: '80px 20px',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
            <h1 style={{ fontSize: '24px', color: '#111827', marginBottom: '8px' }}>Accès refusé</h1>
            <p style={{ color: '#6b7280' }}>Cette page est réservée aux administrateurs.</p>
            <button
              onClick={() => navigate('/')}
              style={{
                marginTop: '24px',
                backgroundColor: '#111827',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '15px'
              }}
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <Header />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px 0' }}>
          <div style={{ fontSize: '18px', color: '#6b7280' }}>Chargement du dashboard...</div>
        </div>
      </div>
    )
  }

  // Calculer stats par société
  const statsBySociete = societes.map(societe => {
    const societeCourses = courses.filter(c => c.societe_id === societe.id)
    const attribuees = societeCourses.filter(c => c.statut === 'attribuee' || c.statut === 'terminee').length
    const terminees = societeCourses.filter(c => c.statut === 'terminee').length
    const prixMoyen = societeCourses.length > 0 
      ? Math.round(societeCourses.reduce((acc, c) => acc + (c.prix || 0), 0) / societeCourses.length)
      : 0

    return {
      ...societe,
      totalCourses: societeCourses.length,
      attribuees,
      terminees,
      tauxAttribution: societeCourses.length > 0 ? Math.round((attribuees / societeCourses.length) * 100) : 0,
      prixMoyen
    }
  }).sort((a, b) => b.totalCourses - a.totalCourses)

  // Calculer stats par chauffeur
  const statsByChauffeur = chauffeurs.map(chauffeur => {
    const candidatures = courses.flatMap(c => 
      (c.candidatures || []).filter(cand => cand.chauffeur_id === chauffeur.id)
    )
    const coursesGagnees = courses.filter(c => c.chauffeur_attribue_id === chauffeur.id)
    const coursesTerminees = coursesGagnees.filter(c => c.statut === 'terminee')

    return {
      ...chauffeur,
      totalCandidatures: candidatures.length,
      coursesGagnees: coursesGagnees.length,
      coursesTerminees: coursesTerminees.length,
      tauxReussite: candidatures.length > 0 ? Math.round((coursesGagnees.length / candidatures.length) * 100) : 0
    }
  }).sort((a, b) => b.coursesGagnees - a.coursesGagnees)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Header />

      <main style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '32px 16px'
      }}>
        {/* Titre */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
            🎛️ Dashboard Admin
          </h1>
          <p style={{ fontSize: '15px', color: '#6b7280', margin: 0 }}>
            Vue d'ensemble de la plateforme Shuttle Marketplace
          </p>
        </div>

        {/* Onglets */}
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          marginBottom: '24px',
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '12px'
        }}>
          {[
            { id: 'global', label: '📊 Vue globale' },
            { id: 'courses', label: '🚗 Courses' },
            { id: 'societes', label: '🏢 Sociétés' },
            { id: 'chauffeurs', label: '👤 Chauffeurs' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === tab.id ? '#111827' : '#f3f4f6',
                color: activeTab === tab.id ? 'white' : '#374151',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenu selon l'onglet */}
        {activeTab === 'global' && (
          <div>
            {/* Stats globales */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '16px',
              marginBottom: '32px'
            }}>
              <StatCard label="Total courses" value={stats.totalCourses} icon="📋" color="#6366f1" />
              <StatCard label="Attribuées" value={stats.coursesAttribuees} icon="🚗" color="#1e40af" />
              <StatCard label="Terminées" value={stats.coursesTerminees} icon="✅" color="#059669" />
              <StatCard label="Disponibles" value={stats.coursesDisponibles} icon="⏳" color="#d97706" />
              <StatCard label="Sans candidature" value={stats.coursesSansCandidature} icon="😢" color="#dc2626" />
              <StatCard label="Taux attribution" value={`${stats.tauxAttribution}%`} icon="📈" color="#059669" />
            </div>

            {/* Stats utilisateurs */}
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
              👥 Utilisateurs
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '16px',
              marginBottom: '32px'
            }}>
              <StatCard label="Sociétés inscrites" value={stats.totalSocietes} icon="🏢" color="#6366f1" />
              <StatCard label="Sociétés actives" value={stats.societesActives} icon="🏢" color="#059669" />
              <StatCard label="Chauffeurs inscrits" value={stats.totalChauffeurs} icon="👤" color="#6366f1" />
              <StatCard label="Chauffeurs actifs" value={stats.chauffeursActifs} icon="👤" color="#059669" />
            </div>

            {/* Stats financières */}
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
              💰 Volume
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '16px'
            }}>
              <StatCard label="Total candidatures" value={stats.totalCandidatures} icon="📨" color="#6366f1" />
              <StatCard label="Volume terminé" value={`${stats.prixTotal}€`} icon="💶" color="#059669" />
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
              📋 Toutes les courses ({courses.length})
            </h2>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Date</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Trajet</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Société</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Prix</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Candidatures</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map(course => (
                      <tr key={course.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '12px', color: '#6b7280' }}>{formatDateTime(course.date_heure)}</td>
                        <td style={{ padding: '12px', fontWeight: '500', color: '#111827' }}>
                          {course.depart} → {course.arrivee}
                        </td>
                        <td style={{ padding: '12px', color: '#6b7280' }}>
                          {course.societe?.raison_sociale || course.societe?.nom || '-'}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#059669' }}>
                          {course.prix}€
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <span style={{
                            backgroundColor: course.candidatures?.length > 0 ? '#ecfdf5' : '#fef2f2',
                            color: course.candidatures?.length > 0 ? '#059669' : '#dc2626',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {course.candidatures?.length || 0}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          {getStatutBadge(course.statut)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'societes' && (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
              🏢 Sociétés ({societes.length})
            </h2>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Société</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Email</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Courses</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Attribuées</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Taux</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Prix moyen</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Inscrit le</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statsBySociete.map(societe => (
                      <tr key={societe.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '12px', fontWeight: '500', color: '#111827' }}>
                          {societe.raison_sociale || societe.nom}
                        </td>
                        <td style={{ padding: '12px', color: '#6b7280', fontSize: '13px' }}>
                          {societe.email}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>
                          {societe.totalCourses}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', color: '#059669', fontWeight: '600' }}>
                          {societe.attribuees}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <span style={{
                            backgroundColor: societe.tauxAttribution >= 50 ? '#ecfdf5' : '#fef3c7',
                            color: societe.tauxAttribution >= 50 ? '#059669' : '#d97706',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {societe.tauxAttribution}%
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#059669' }}>
                          {societe.prixMoyen}€
                        </td>
                        <td style={{ padding: '12px', color: '#6b7280' }}>
                          {formatDate(societe.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chauffeurs' && (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
              👤 Chauffeurs ({chauffeurs.length})
            </h2>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Chauffeur</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Email</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Candidatures</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Gagnées</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Taux</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Note</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Inscrit le</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statsByChauffeur.map(chauffeur => (
                      <tr key={chauffeur.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '12px', fontWeight: '500', color: '#111827' }}>
                          {chauffeur.nom}
                        </td>
                        <td style={{ padding: '12px', color: '#6b7280', fontSize: '13px' }}>
                          {chauffeur.email}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>
                          {chauffeur.totalCandidatures}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', color: '#059669', fontWeight: '600' }}>
                          {chauffeur.coursesGagnees}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <span style={{
                            backgroundColor: chauffeur.tauxReussite >= 30 ? '#ecfdf5' : '#fef3c7',
                            color: chauffeur.tauxReussite >= 30 ? '#059669' : '#d97706',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {chauffeur.tauxReussite}%
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          {chauffeur.note_moyenne_chauffeur > 0 ? (
                            <span style={{ color: '#f59e0b' }}>⭐ {chauffeur.note_moyenne_chauffeur}/5</span>
                          ) : (
                            <span style={{ color: '#9ca3af' }}>-</span>
                          )}
                        </td>
                        <td style={{ padding: '12px', color: '#6b7280' }}>
                          {formatDate(chauffeur.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

// Composant pour les cartes de stats
function StatCard({ label, value, icon, color }) {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <span style={{ fontSize: '24px' }}>{icon}</span>
        <span style={{ fontSize: '28px', fontWeight: 'bold', color }}>{value}</span>
      </div>
      <div style={{ fontSize: '14px', color: '#6b7280' }}>{label}</div>
    </div>
  )
}