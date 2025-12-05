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

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
  .from('courses')
  .select(`
    *,
    societe:users!societe_id (nom, note_moyenne),
    candidatures (prix_propose)
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
            Courses disponibles
          </h1>
          <p style={{ fontSize: '15px', color: '#6b7280', margin: 0 }}>
            {courses.length} course(s) disponible(s)
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
              Aucune course disponible pour le moment
            </p>
            <button
              onClick={() => navigate('/dashboard')}
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
              Retour au Dashboard
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {courses.map((course) => (
              <div
                key={course.id}
                onClick={() => navigate(`/ride/${course.id}`)}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  border: '1px solid #e5e7eb',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'}
                onMouseOut={(e) => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'}
              >
                {/* Trajet */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                      {course.depart} → {course.arrivee}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                      par {course.societe?.nom || 'Inconnu'}
                      {course.societe?.note_moyenne > 0 && ` • ⭐ ${course.societe.note_moyenne}/5`}
                    </div>
                  </div>
<div style={{ textAlign: 'right' }}>
  <div style={{
    backgroundColor: '#ecfdf5',
    color: '#059669',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '18px',
    fontWeight: 'bold'
  }}>
    {course.prix}€
  </div>
  {course.candidatures && course.candidatures.length > 0 && (
    <div style={{
      fontSize: '12px',
      color: '#6b7280',
      marginTop: '4px'
    }}>
      🔥 Meilleure offre : {Math.min(...course.candidatures.map(c => c.prix_propose))}€
    </div>
  )}
</div>
                </div>

                {/* Détails */}
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#f3f4f6',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    color: '#374151'
                  }}>
                    📅 {formatDate(course.date_heure)}
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#f3f4f6',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    color: '#374151'
                  }}>
                    🕐 {formatTime(course.date_heure)}
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#f3f4f6',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    color: '#374151'
                  }}>
                    👥 {course.nb_passagers}
                  </div>
                  {course.type_course && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: course.type_course === 'privee' ? '#fef3c7' : '#dbeafe',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      color: course.type_course === 'privee' ? '#92400e' : '#1e40af'
                    }}>
                      {course.type_course === 'privee' ? '🚗 Privée' : '👥 Partagée'}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}