import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../supabaseClient'
import Logo from '../components/Logo'

export default function Login() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showDocumentsPopup, setShowDocumentsPopup] = useState(false)
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nom: '',
    telephone: '',
    type: 'membre',
    acceptCGU: false
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password)
        if (error) throw error
        navigate('/available-rides')
      } else {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password
        })
        if (authError) throw authError

        if (authData.user) {
          const { error: profileError } = await supabase
            .from('users')
            .insert([
              {
                id: authData.user.id,
                email: formData.email,
                nom: formData.nom,
                telephone: formData.telephone,
                type: formData.type,
                valide: false
              }
            ])
          if (profileError) throw profileError
        }

        setShowDocumentsPopup(true)
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClosePopup = () => {
    setShowDocumentsPopup(false)
    setIsLogin(true)
    setFormData({ ...formData, password: '' })
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

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '900px',
        display: 'flex',
        gap: '32px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        
        {/* Colonne gauche - Pitch */}
        <div style={{
          flex: '1',
          minWidth: '300px',
          maxWidth: '450px'
        }}>
          {/* Logo */}
          <div style={{ marginBottom: '24px' }}>
            <Logo size="large" />
          </div>

          {/* Accroche principale */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
            padding: '28px',
            marginBottom: '16px'
          }}>
            <h1 style={{ 
              fontSize: '28px', 
              fontWeight: '800', 
              color: '#111827', 
              marginBottom: '12px',
              lineHeight: '1.2'
            }}>
              Fini les courses perdues.<br />
              Fini les retours à vide.
            </h1>
            
            <p style={{ 
              fontSize: '16px', 
              color: '#4b5563', 
              lineHeight: '1.6', 
              marginBottom: '24px' 
            }}>
              La première plateforme belge d'entraide entre professionnels de la navette aéroport.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ 
                backgroundColor: '#ecfdf5',
                borderRadius: '10px',
                padding: '16px',
                borderLeft: '4px solid #059669'
              }}>
                <div style={{ fontWeight: '700', color: '#065f46', fontSize: '15px', marginBottom: '6px' }}>
                  🚐 Trop de demandes ?
                </div>
                <div style={{ fontSize: '14px', color: '#047857', lineHeight: '1.5' }}>
                  Publiez vos courses excédentaires. Un confrère de confiance les effectue, votre client est servi, vous gardez la relation.
                </div>
              </div>
              
              <div style={{ 
                backgroundColor: '#dbeafe',
                borderRadius: '10px',
                padding: '16px',
                borderLeft: '4px solid #2563eb'
              }}>
                <div style={{ fontWeight: '700', color: '#1e40af', fontSize: '15px', marginBottom: '6px' }}>
                  📅 Un creux dans le planning ?
                </div>
                <div style={{ fontSize: '14px', color: '#1d4ed8', lineHeight: '1.5' }}>
                  Consultez les courses disponibles en temps réel. Candidatez en un clic. Roulez plus, gagnez plus.
                </div>
              </div>
            </div>

            {/* Points clés */}
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap',
              gap: '12px',
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: '1px solid #e5e7eb'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#059669'
              }}>
                <span>✓</span> Entre pros agréés
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#059669'
              }}>
                <span>✓</span> Vous fixez votre prix
              </div>
            </div>
          </div>

          {/* Documents requis */}
          <div style={{
            backgroundColor: '#fffbeb',
            borderRadius: '12px',
            border: '1px solid #fcd34d',
            padding: '20px'
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#92400e', marginBottom: '12px' }}>
              📋 Documents requis pour valider votre profil
            </h3>
            <ul style={{ 
              fontSize: '13px', 
              color: '#78350f', 
              paddingLeft: '20px',
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <li>Autorisation</li>
              <li>Attestation véhicule</li>
              <li>Attestation d'assurance transport de personnes</li>
              <li>Certificat d'immatriculation</li>
              <li>Carte verte</li>
            </ul>
          </div>
        </div>

        {/* Colonne droite - Formulaire */}
        <div style={{
          flex: '1',
          minWidth: '300px',
          maxWidth: '400px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
            padding: '32px'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '8px', textAlign: 'center' }}>
              {isLogin ? 'Connexion' : 'Inscription'}
            </h2>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px', textAlign: 'center' }}>
              {isLogin ? 'Accédez à votre compte' : 'Rejoignez le réseau gratuitement'}
            </p>

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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {!isLogin && (
                  <>
                    <div>
                      <label style={labelStyle}>Nom / Raison sociale *</label>
                      <input
                        type="text"
                        name="nom"
                        value={formData.nom}
                        onChange={handleChange}
                        placeholder="Votre nom ou société"
                        style={inputStyle}
                        required={!isLogin}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Téléphone *</label>
                      <input
                        type="tel"
                        name="telephone"
                        value={formData.telephone}
                        onChange={handleChange}
                        placeholder="0470123456"
                        style={inputStyle}
                        required={!isLogin}
                      />
                    </div>
                  </>
                )}
                
                <div>
                  <label style={labelStyle}>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="votre@email.com"
                    style={inputStyle}
                    required
                  />
                </div>
                
                <div>
                  <label style={labelStyle}>Mot de passe *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    style={inputStyle}
                    required
                  />
                </div>

                {/* Case CGU pour inscription */}
                {!isLogin && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <input
                      type="checkbox"
                      name="acceptCGU"
                      checked={formData.acceptCGU}
                      onChange={(e) => setFormData({ ...formData, acceptCGU: e.target.checked })}
                      style={{ marginTop: '4px' }}
                      required
                    />
                    <label style={{ fontSize: '13px', color: '#374151' }}>
                      J'accepte les{' '}
                      <a 
                        href="/cgu" 
                        target="_blank" 
                        style={{ color: '#1e40af', textDecoration: 'underline' }}
                      >
                        CGU
                      </a>
                      {' '}et la{' '}
                      <a 
                        href="/privacy" 
                        target="_blank" 
                        style={{ color: '#1e40af', textDecoration: 'underline' }}
                      >
                        Politique de Confidentialité
                      </a>
                      {' '}*
                    </label>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || (!isLogin && !formData.acceptCGU)}
                  style={{
                    width: '100%',
                    backgroundColor: '#059669',
                    color: 'white',
                    padding: '16px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    border: 'none',
                    cursor: 'pointer',
                    opacity: loading || (!isLogin && !formData.acceptCGU) ? 0.6 : 1,
                    marginTop: '8px'
                  }}
                >
                  {loading ? 'Chargement...' : isLogin ? 'Se connecter' : "Créer mon compte"}
                </button>
              </div>
            </form>

            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                style={{
                  backgroundColor: 'transparent',
                  color: '#6b7280',
                  fontSize: '14px',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                {isLogin ? "Pas encore inscrit ? Rejoindre" : 'Déjà un compte ? Se connecter'}
              </button>
            </div>
          </div>

          {/* Témoignage / Confiance */}
          <div style={{
            marginTop: '16px',
            textAlign: 'center',
            padding: '16px',
            color: '#6b7280',
            fontSize: '13px'
          }}>
            <div style={{ marginBottom: '8px' }}>
              🚐 Déjà utilisé par des navettistes en Belgique
            </div>
            <div style={{ color: '#9ca3af', fontSize: '12px' }}>
              Une initiative de professionnels, pour les professionnels
            </div>
          </div>
        </div>
      </div>

      {/* Popup Documents */}
      {showDocumentsPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
              <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
                Bienvenue dans le réseau !
              </h2>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>
                Une dernière étape pour activer votre compte...
              </p>
            </div>

            <div style={{
              backgroundColor: '#fef3c7',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#92400e', marginBottom: '12px' }}>
                📧 Envoyez vos documents par email
              </h3>
              <p style={{ fontSize: '14px', color: '#78350f', marginBottom: '16px' }}>
                Pour valider votre profil et commencer à utiliser la plateforme :
              </p>
              
              <div style={{
                backgroundColor: 'white',
                padding: '12px',
                borderRadius: '8px',
                textAlign: 'center',
                marginBottom: '16px'
              }}>
                <a 
                  href="mailto:shuttlemarketplace@gmail.com?subject=Documents%20-%20Validation%20profil&body=Bonjour,%0A%0AVeuillez%20trouver%20ci-joint%20mes%20documents%20pour%20la%20validation%20de%20mon%20profil.%0A%0ANom%20:%20%0ATéléphone%20:%20%0A%0ACordialement"
                  style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#1e40af',
                    textDecoration: 'none'
                  }}
                >
                  shuttlemarketplace@gmail.com
                </a>
              </div>

              <ul style={{ 
                fontSize: '13px', 
                color: '#78350f', 
                paddingLeft: '20px',
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <li>Autorisation</li>
                <li>Attestation véhicule</li>
                <li>Attestation d'assurance transport de personnes</li>
                <li>Certificat d'immatriculation</li>
                <li>Carte verte</li>
              </ul>
            </div>

            <div style={{
              backgroundColor: '#ecfdf5',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '24px',
              fontSize: '13px',
              color: '#065f46',
              textAlign: 'center'
            }}>
              ⏱️ Validation sous <strong>24-48h</strong> après réception
            </div>

            <button
              onClick={handleClosePopup}
              style={{
                width: '100%',
                backgroundColor: '#059669',
                color: 'white',
                padding: '14px',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Compris, me connecter
            </button>
          </div>
        </div>
      )}
    </div>
  )
}