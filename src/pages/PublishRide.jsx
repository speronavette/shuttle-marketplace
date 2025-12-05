import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import Header from '../components/Header'
import { sendNewCourseNotification } from '../services/emailService'

export default function PublishRide() {
  const { user } = useAuth()
  const navigate = useNavigate()
  
const [formData, setFormData] = useState({
  depart: '',
  arrivee: '',
  adresse_depart: '',
  adresse_arrivee: '',
  date: '',
  heure: '',
  nb_passagers: 1,
  nb_bagages: 0,
  prix_initial: '',
  prix: '',
  mode_reglement: 'especes',
  type_course: 'privee',
  numero_vol: '',
  provenance_destination_vol: '',
  commentaires: '',
  delai_attribution_jours: 7,
  auto_attribution_note_min: null,
  priorite_favoris: false,
  client_nom: '',
  client_prenom: '',
  client_telephone: '',
})
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

const handleSubmit = async (e) => {
  e.preventDefault()
  setError('')
  setLoading(true)

  try {
    const dateHeure = `${formData.date}T${formData.heure}:00+01:00`
    const delaiDate = new Date(dateHeure)
    delaiDate.setDate(delaiDate.getDate() - formData.delai_attribution_jours)

const { data: courseData, error } = await supabase
  .from('courses')
  .insert([
    {
      societe_id: user.id,
      depart: formData.depart,
      arrivee: formData.arrivee,
      adresse_depart: formData.adresse_depart,
      adresse_arrivee: formData.adresse_arrivee,
      date_heure: dateHeure,
      nb_passagers: parseInt(formData.nb_passagers),
      nb_bagages: parseInt(formData.nb_bagages),
      prix_initial: formData.prix_initial ? parseFloat(formData.prix_initial) : null,
      prix: parseFloat(formData.prix),
      mode_reglement: formData.mode_reglement,
      type_course: formData.type_course,
      numero_vol: formData.numero_vol || null,
      provenance_destination_vol: formData.provenance_destination_vol || null,
      commentaires: formData.commentaires,
      statut: 'disponible',
      delai_attribution: delaiDate.toISOString(),
      auto_attribution_note_min: formData.auto_attribution_note_min ? parseFloat(formData.auto_attribution_note_min) : null,
      priorite_favoris: formData.priorite_favoris,
      client_nom: formData.client_nom,
      client_prenom: formData.client_prenom,
      client_telephone: formData.client_telephone,
    }
  ])
      .select()
      .single()

    if (error) throw error

    // Vérifier si la course est urgente (< 48h)
    const courseDate = new Date(dateHeure)
    const now = new Date()
    const diffHours = (courseDate - now) / (1000 * 60 * 60)
    const isUrgent = diffHours < 48

    if (isUrgent) {
      // Récupérer tous les utilisateurs qui veulent des notifications immédiates
      const { data: users } = await supabase
        .from('users')
        .select('email')
        .neq('id', user.id)
        .eq('notif_email', true)
        .eq('notif_immediate', true)

      if (users && users.length > 0) {
        const recipients = users.map(u => u.email)
        await sendNewCourseNotification({
          course: courseData,
          recipients
        })
        console.log(`📧 Notification urgente envoyée à ${recipients.length} utilisateurs`)
      }
    }

    alert('Course publiée avec succès !')
    navigate('/dashboard')
  } catch (error) {
    setError(error.message)
  } finally {
    setLoading(false)
  }
}

  const inputStyle = {
    width: '100%',
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '15px',
    boxSizing: 'border-box'
  }

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '6px'
  }

  const sectionStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb',
    padding: '20px',
    marginBottom: '16px'
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Header />

      <main style={{
        maxWidth: '600px',
        margin: '0 auto',
        padding: '32px 16px'
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '24px' }}>
          Publier une course
        </h1>

        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Trajet */}
          <div style={sectionStyle}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
              📍 Trajet
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Ville de départ *</label>
                <input type="text" name="depart" value={formData.depart} onChange={handleChange} placeholder="Ex: Nalinnes" style={inputStyle} required />
              </div>
              <div>
                <label style={labelStyle}>Ville d'arrivée *</label>
                <input type="text" name="arrivee" value={formData.arrivee} onChange={handleChange} placeholder="Ex: Brussels Airport" style={inputStyle} required />
              </div>
              <div>
                <label style={labelStyle}>Adresse complète départ</label>
                <input type="text" name="adresse_depart" value={formData.adresse_depart} onChange={handleChange} placeholder="Rue, numéro, code postal" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Adresse complète arrivée</label>
                <input type="text" name="adresse_arrivee" value={formData.adresse_arrivee} onChange={handleChange} placeholder="Rue, numéro, code postal" style={inputStyle} />
              </div>
            </div>
          </div>

          {/* Date et heure */}
          <div style={sectionStyle}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
              📅 Date et heure
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Date *</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} style={inputStyle} required />
              </div>
              <div>
                <label style={labelStyle}>Heure *</label>
                <input type="time" name="heure" value={formData.heure} onChange={handleChange} style={inputStyle} required />
              </div>
            </div>
          </div>

          {/* Infos vol */}
          <div style={sectionStyle}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
              ✈️ Informations vol (optionnel)
            </h3>
            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>Pour les retours d'aéroport</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Numéro de vol</label>
                <input type="text" name="numero_vol" value={formData.numero_vol} onChange={handleChange} placeholder="Ex: SN3456" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Provenance / Destination</label>
                <input type="text" name="provenance_destination_vol" value={formData.provenance_destination_vol} onChange={handleChange} placeholder="Ex: Paris CDG" style={inputStyle} />
              </div>
            </div>
          </div>

          {/* Détails */}
          <div style={sectionStyle}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
              👥 Détails de la course
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Nombre de passagers *</label>
                <input type="number" name="nb_passagers" value={formData.nb_passagers} onChange={handleChange} min="1" max="8" style={inputStyle} required />
              </div>
              <div>
                <label style={labelStyle}>Nombre de bagages</label>
                <input type="number" name="nb_bagages" value={formData.nb_bagages} onChange={handleChange} min="0" max="10" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Type de course *</label>
                <select name="type_course" value={formData.type_course} onChange={handleChange} style={inputStyle} required>
                  <option value="privee">🚗 Course privée</option>
                  <option value="partagee">👥 Course partagée</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Mode de règlement *</label>
                <select name="mode_reglement" value={formData.mode_reglement} onChange={handleChange} style={inputStyle} required>
                  <option value="especes">💵 Espèces</option>
                  <option value="facture">📄 Facture</option>
                  <option value="carte">💳 Carte bancaire</option>
                </select>
              </div>
            </div>
          </div>

          {/* Prix */}
          <div style={sectionStyle}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
              💰 Prix
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Prix initial (€)</label>
                <input type="number" name="prix_initial" value={formData.prix_initial} onChange={handleChange} min="0" step="0.01" placeholder="Ce que le client paie" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Prix proposé (€) *</label>
                <input type="number" name="prix" value={formData.prix} onChange={handleChange} min="0" step="0.01" placeholder="Ce que le chauffeur reçoit" style={{...inputStyle, fontWeight: 'bold'}} required />
              </div>
            </div>
          </div>

          {/* Commentaires */}
          <div style={sectionStyle}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
              📝 Commentaires
            </h3>
            <textarea
              name="commentaires"
              value={formData.commentaires}
              onChange={handleChange}
              placeholder="Instructions particulières..."
              rows="3"
              style={{...inputStyle, resize: 'vertical'}}
            />
          </div>

          {/* Infos client/passager */}
<div style={sectionStyle}>
  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
    👤 Informations du (des) passager(s)
  </h3>
  <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>
    Ces informations seront visibles par le chauffeur uniquement après acceptation.
  </p>
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
    <div>
      <label style={labelStyle}>Prénom *</label>
      <input 
        type="text" 
        name="client_prenom" 
        value={formData.client_prenom} 
        onChange={handleChange} 
        placeholder="Jean" 
        style={inputStyle} 
        required 
      />
    </div>
    <div>
      <label style={labelStyle}>Nom *</label>
      <input 
        type="text" 
        name="client_nom" 
        value={formData.client_nom} 
        onChange={handleChange} 
        placeholder="Dupont" 
        style={inputStyle} 
        required 
      />
    </div>
    <div style={{ gridColumn: 'span 2' }}>
      <label style={labelStyle}>Téléphone du passager *</label>
      <input 
        type="tel" 
        name="client_telephone" 
        value={formData.client_telephone} 
        onChange={handleChange} 
        placeholder="0470123456" 
        style={inputStyle} 
        required 
      />
    </div>
  </div>
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
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                backgroundColor: '#111827',
                color: 'white',
                padding: '14px',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Publication...' : 'Publier la course'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}