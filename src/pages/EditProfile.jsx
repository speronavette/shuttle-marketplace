import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'

export default function EditProfile() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  
  const [formData, setFormData] = useState({
    nom: '',
    telephone: '',
    zone_geographique: '',
    // Infos de facturation
    raison_sociale: '',
    numero_tva: '',
    rue: '',
    numero: '',
    code_postal: '',
    commune: '',
    email_facturation: '',
    // Notifications
    notif_email: true,
    notif_immediate: true,
    notif_resume_quotidien: true
  })

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error

      if (data) {
        setFormData({
          nom: data.nom || '',
          telephone: data.telephone || '',
          zone_geographique: data.zone_geographique || '',
          raison_sociale: data.raison_sociale || '',
          numero_tva: data.numero_tva || '',
          rue: data.rue || '',
          numero: data.numero || '',
          code_postal: data.code_postal || '',
          commune: data.commune || '',
          email_facturation: data.email_facturation || '',
          notif_email: data.notif_email !== false,
          notif_immediate: data.notif_immediate !== false,
          notif_resume_quotidien: data.notif_resume_quotidien !== false
        })
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const { error } = await supabase
        .from('users')
        .update({
          nom: formData.nom,
          telephone: formData.telephone,
          zone_geographique: formData.zone_geographique,
          raison_sociale: formData.raison_sociale,
          numero_tva: formData.numero_tva,
          rue: formData.rue,
          numero: formData.numero,
          code_postal: formData.code_postal,
          commune: formData.commune,
          email_facturation: formData.email_facturation,
          notif_email: formData.notif_email,
          notif_immediate: formData.notif_immediate,
          notif_resume_quotidien: formData.notif_resume_quotidien
        })
        .eq('id', user.id)

      if (error) throw error

      setMessage('✅ Profil mis à jour avec succès !')
    } catch (error) {
      setMessage('❌ Erreur: ' + error.message)
    } finally {
      setSaving(false)
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
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '24px' }}>
          Mon profil
        </h1>

        {message && (
          <div style={{
            backgroundColor: message.includes('✅') ? '#ecfdf5' : '#fef2f2',
            color: message.includes('✅') ? '#059669' : '#dc2626',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Informations générales */}
          <div style={sectionStyle}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
              👤 Informations générales
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Nom / Société *</label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Téléphone *</label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Zone géographique</label>
                <input
                  type="text"
                  name="zone_geographique"
                  value={formData.zone_geographique}
                  onChange={handleChange}
                  placeholder="Ex: Charleroi, Hainaut, Bruxelles..."
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Informations de facturation */}
          <div style={sectionStyle}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
              🏢 Informations de facturation
            </h3>
            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>
              Ces informations seront partagées avec vos partenaires après acceptation d'une course.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Raison sociale</label>
                <input
                  type="text"
                  name="raison_sociale"
                  value={formData.raison_sociale}
                  onChange={handleChange}
                  placeholder="Nom officiel de votre société"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Numéro de TVA</label>
                <input
                  type="text"
                  name="numero_tva"
                  value={formData.numero_tva}
                  onChange={handleChange}
                  placeholder="BE0123.456.789"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Email de facturation</label>
                <input
                  type="email"
                  name="email_facturation"
                  value={formData.email_facturation}
                  onChange={handleChange}
                  placeholder="facturation@votresociete.be"
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
              <label style={{ ...labelStyle, marginBottom: '12px' }}>Adresse de facturation</label>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ ...labelStyle, fontSize: '12px', color: '#6b7280' }}>Rue</label>
                  <input
                    type="text"
                    name="rue"
                    value={formData.rue}
                    onChange={handleChange}
                    placeholder="Rue de la Gare"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ ...labelStyle, fontSize: '12px', color: '#6b7280' }}>Numéro</label>
                  <input
                    type="text"
                    name="numero"
                    value={formData.numero}
                    onChange={handleChange}
                    placeholder="123"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ ...labelStyle, fontSize: '12px', color: '#6b7280' }}>Code postal</label>
                  <input
                    type="text"
                    name="code_postal"
                    value={formData.code_postal}
                    onChange={handleChange}
                    placeholder="6000"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ ...labelStyle, fontSize: '12px', color: '#6b7280' }}>Commune</label>
                  <input
                    type="text"
                    name="commune"
                    value={formData.commune}
                    onChange={handleChange}
                    placeholder="Charleroi"
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Préférences de notification */}
          <div style={sectionStyle}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
              🔔 Notifications par email
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="notif_email"
                  checked={formData.notif_email}
                  onChange={handleChange}
                  style={{ width: '20px', height: '20px' }}
                />
                <div>
                  <div style={{ fontSize: '15px', color: '#111827', fontWeight: '500' }}>
                    Activer les notifications email
                  </div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>
                    Recevoir des emails de Shuttle Marketplace
                  </div>
                </div>
              </label>

              {formData.notif_email && (
                <>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', marginLeft: '32px' }}>
                    <input
                      type="checkbox"
                      name="notif_immediate"
                      checked={formData.notif_immediate}
                      onChange={handleChange}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <div>
                      <div style={{ fontSize: '14px', color: '#111827' }}>
                        Notifications immédiates
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        Courses urgentes (&lt;48h), candidatures, acceptations
                      </div>
                    </div>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', marginLeft: '32px' }}>
                    <input
                      type="checkbox"
                      name="notif_resume_quotidien"
                      checked={formData.notif_resume_quotidien}
                      onChange={handleChange}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <div>
                      <div style={{ fontSize: '14px', color: '#111827' }}>
                        Résumé quotidien (19h00)
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        Récapitulatif des nouvelles courses de la journée
                      </div>
                    </div>
                  </label>
                </>
              )}
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
              disabled={saving}
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
                opacity: saving ? 0.7 : 1
              }}
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}