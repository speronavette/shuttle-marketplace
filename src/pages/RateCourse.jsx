import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'

export default function RateCourse() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [alreadyRated, setAlreadyRated] = useState(false)
  const [note, setNote] = useState(5)
  const [commentaire, setCommentaire] = useState('')
  const [personToRate, setPersonToRate] = useState(null)

  useEffect(() => {
    if (user) {
      fetchCourse()
    }
  }, [id, user])

  const fetchCourse = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          societe:users!societe_id (id, nom),
          chauffeur_attribue:users!chauffeur_attribue_id (id, nom)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      setCourse(data)

      // Déterminer qui noter et le type d'évaluation
      if (user.id === data.societe_id) {
        // Je suis la société, je note le chauffeur (en tant que chauffeur)
        setPersonToRate({
          id: data.chauffeur_attribue?.id,
          nom: data.chauffeur_attribue?.nom,
          role: 'chauffeur',
          type_evaluation: 'chauffeur'
        })
      } else if (user.id === data.chauffeur_attribue_id) {
        // Je suis le chauffeur, je note la société (en tant que société/donneur d'ordre)
        setPersonToRate({
          id: data.societe?.id,
          nom: data.societe?.nom,
          role: 'donneur d\'ordre',
          type_evaluation: 'societe'
        })
      }

      // Vérifier si déjà noté
      const { data: existingRating } = await supabase
        .from('avis')
        .select('id')
        .eq('course_id', id)
        .eq('evaluateur_id', user.id)
        .single()

      if (existingRating) {
        setAlreadyRated(true)
      }

    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!personToRate) return

    setSubmitting(true)

    try {
      // Insérer l'avis avec le type d'évaluation
      const { error: avisError } = await supabase
        .from('avis')
        .insert([
          {
            course_id: id,
            evaluateur_id: user.id,
            evalue_id: personToRate.id,
            note: note,
            commentaire: commentaire,
            type_evaluation: personToRate.type_evaluation
          }
        ])

      if (avisError) throw avisError

      // Calculer la nouvelle moyenne selon le type
      const { data: allAvis } = await supabase
        .from('avis')
        .select('note')
        .eq('evalue_id', personToRate.id)
        .eq('type_evaluation', personToRate.type_evaluation)

      if (allAvis && allAvis.length > 0) {
        const moyenne = allAvis.reduce((sum, a) => sum + a.note, 0) / allAvis.length
        const moyenneArrondie = Math.round(moyenne * 10) / 10

        // Mettre à jour la bonne colonne selon le type
        if (personToRate.type_evaluation === 'chauffeur') {
          await supabase
            .from('users')
            .update({ 
              note_moyenne_chauffeur: moyenneArrondie,
              nb_courses_chauffeur: allAvis.length
            })
            .eq('id', personToRate.id)
        } else {
          await supabase
            .from('users')
            .update({ 
              note_moyenne_societe: moyenneArrondie,
              nb_courses_societe: allAvis.length
            })
            .eq('id', personToRate.id)
        }
      }

      alert('✅ Merci pour votre évaluation !')
      navigate('/dashboard')

    } catch (error) {
      if (error.code === '23505') {
        alert('⚠️ Vous avez déjà noté cette course')
      } else {
        alert('❌ Erreur: ' + error.message)
      }
    } finally {
      setSubmitting(false)
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

  if (!course || !personToRate) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <Header />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px 0' }}>
          <div style={{ fontSize: '18px', color: '#dc2626' }}>Course non trouvée ou vous n'êtes pas autorisé</div>
        </div>
      </div>
    )
  }

  if (alreadyRated) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <Header />
        <main style={{ maxWidth: '600px', margin: '0 auto', padding: '32px 16px' }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
            padding: '48px 24px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
              Déjà évalué
            </h2>
            <p style={{ fontSize: '15px', color: '#6b7280', marginBottom: '24px' }}>
              Vous avez déjà noté cette course
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
        </main>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Header />

      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '32px 16px' }}>
        {/* Titre */}
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
          Évaluer la course
        </h1>
        <p style={{ fontSize: '15px', color: '#6b7280', marginBottom: '24px' }}>
          {course.depart} → {course.arrivee}
        </p>

        {/* Formulaire */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb',
          padding: '24px'
        }}>
          <form onSubmit={handleSubmit}>
            {/* Personne à noter */}
            <div style={{
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                Vous évaluez en tant que {personToRate.type_evaluation === 'chauffeur' ? 'chauffeur' : 'donneur d\'ordre'}
              </div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                {personToRate.nom}
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: 'white',
                backgroundColor: personToRate.type_evaluation === 'chauffeur' ? '#3b82f6' : '#8b5cf6',
                padding: '4px 12px',
                borderRadius: '12px',
                display: 'inline-block',
                marginTop: '8px'
              }}>
                {personToRate.type_evaluation === 'chauffeur' ? '🚗 Note chauffeur' : '🏢 Note donneur d\'ordre'}
              </div>
            </div>

            {/* Note */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '12px' }}>
                Note *
              </label>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNote(star)}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      fontSize: '36px',
                      cursor: 'pointer',
                      opacity: star <= note ? 1 : 0.3,
                      transition: 'opacity 0.2s'
                    }}
                  >
                    ⭐
                  </button>
                ))}
              </div>
              <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '15px', color: '#374151' }}>
                {note}/5
              </div>
            </div>

            {/* Commentaire */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Commentaire (optionnel)
              </label>
              <textarea
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                placeholder="Partagez votre expérience..."
                rows="4"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '15px',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Boutons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                style={{
                  flex: 1,
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  padding: '14px',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '500',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Plus tard
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  flex: 1,
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  padding: '14px',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '500',
                  border: 'none',
                  cursor: 'pointer',
                  opacity: submitting ? 0.7 : 1
                }}
              >
                {submitting ? 'Envoi...' : '⭐ Envoyer mon avis'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}