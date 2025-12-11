import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../supabaseClient'
import Logo from '../components/Logo'

export default function Login() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  
  const [mode, setMode] = useState('login') // 'login', 'register', 'forgot'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showDocumentsPopup, setShowDocumentsPopup] = useState(false)
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nom: '',
    telephone: '',
    type: 'membre',
    acceptCGU: false
  })

  // Vehicule lors de l'inscription
  const [vehicule, setVehicule] = useState({
    marque: '',
    modele: '',
    nb_places: 4
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleVehiculeChange = (e) => {
    const { name, value } = e.target
    setVehicule({ ...vehicule, [name]: value })
  }

  const handleResendConfirmation = async () => {
    setResendLoading(true)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: formData.email
      })
      if (error) throw error
      setResendSuccess(true)
    } catch (error) {
      setError("Erreur lors de l'envoi. Réessayez dans quelques minutes.")
    } finally {
      setResendLoading(false)
    }
  }

  const checkEmailStatus = async (email) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-email-status`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ email })
        }
      )
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Erreur check email:', error)
      return null
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      
      if (error) throw error
      
      setSuccess('📧 Un email de réinitialisation a été envoyé. Vérifiez votre boîte de réception et vos spams.')
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setEmailNotConfirmed(false)
    setResendSuccess(false)
    setLoading(true)

    try {
      if (mode === 'login') {
        // D'abord essayer de se connecter
        const { error } = await signIn(formData.email, formData.password)
        
        if (error) {
          // Si erreur "Invalid login credentials", vérifier si c'est un problème d'email non confirmé
          if (error.message.includes('Invalid login credentials')) {
            const emailStatus = await checkEmailStatus(formData.email)
            
            if (emailStatus && emailStatus.exists && !emailStatus.email_confirmed) {
              // L'utilisateur existe mais email non confirmé
              setEmailNotConfirmed(true)
              setLoading(false)
              return
            }
          }
          throw error
        }
        
        // Redirection admin si c'est l'email admin
        if (formData.email.toLowerCase() === 'shuttlemarketplace@gmail.com') {
          navigate('/admin')
        } else {
          navigate('/available-rides')
        }
      } else if (mode === 'register') {
        // Verifier que le vehicule est renseigne
        if (!vehicule.marque || !vehicule.modele) {
          setError('Veuillez renseigner au moins un vehicule (marque et modele)')
          setLoading(false)
          return
        }

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

          // Ajouter le vehicule
          const { error: vehiculeError } = await supabase
            .from('vehicules')
            .insert([
              {
                user_id: authData.user.id,
                marque: vehicule.marque,
                modele: vehicule.modele,
                nb_places: parseInt(vehicule.nb_places)
              }
            ])
          if (vehiculeError) {
            console.error('Erreur vehicule:', vehiculeError)
          }
        }

        setShowDocumentsPopup(true)
      }
    } catch (error) {
      // Traduire les erreurs courantes
      if (error.message.includes('Invalid login credentials')) {
        setError('Email ou mot de passe incorrect')
      } else if (error.message.includes('User already registered')) {
        setError('Cet email est déjà utilisé')
      } else {
        setError(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleClosePopup = () => {
    setShowDocumentsPopup(false)
    setMode('login')
    setFormData({ ...formData, password: '' })
    setVehicule({ marque: '', modele: '', nb_places: 4 })
  }

  const switchMode = (newMode) => {
    setMode(newMode)
    setError('')
    setSuccess('')
    setEmailNotConfirmed(false)
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
              Optimisez vos courses.<br />
              Rentabilisez vos trajets.
            </h1>
            
            <p style={{ 
              fontSize: '16px', 
              color: '#4b5563', 
              lineHeight: '1.6', 
              marginBottom: '24px' 
            }}>
              Le réseau belge des navettistes qui s'entraident.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ 
                backgroundColor: '#ecfdf5',
                borderRadius: '10px',
                padding: '16px',
                borderLeft: '4px solid #059669'
              }}>
                <div style={{ fontWeight: '700', color: '#065f46', fontSize: '15px', marginBottom: '6px' }}>
                  📤 Vous avez trop de demandes ?
                </div>
                <div style={{ fontSize: '14px', color: '#047857', lineHeight: '1.5' }}>
                  Sous-traitez vos courses excédentaires à un confrère vérifié. Votre client est servi, vous gardez la relation.
                </div>
              </div>
              
              <div style={{ 
                backgroundColor: '#dbeafe',
                borderRadius: '10px',
                padding: '16px',
                borderLeft: '4px solid #2563eb'
              }}>
                <div style={{ fontWeight: '700', color: '#1e40af', fontSize: '15px', marginBottom: '6px' }}>
                  🚗 Vous avez des disponibilités ?
                </div>
                <div style={{ fontSize: '14px', color: '#1d4ed8', lineHeight: '1.5' }}>
                  Récupérez des courses sur vos zones de passage. Moins de retours à vide, plus de revenus.
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
                <span>✓</span> Vous fixez vos prix
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#059669'
              }}>
                <span>✓</span> Simple et rapide
              </div>
            </div>

            {/* Lien Comment ça marche */}
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <a 
                href="/comment-ca-marche"
                style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                🤔 Comment ça marche exactement ? <span style={{ color: '#2563eb', textDecoration: 'underline' }}>Lire le guide →</span>
              </a>
            </div>
          </div>

          {/* Document requis */}
          <div style={{
            backgroundColor: '#fffbeb',
            borderRadius: '12px',
            border: '1px solid #fcd34d',
            padding: '20px'
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#92400e', marginBottom: '12px' }}>
              📋 Document requis pour valider votre profil
            </h3>
            <div style={{ 
              fontSize: '14px', 
              color: '#78350f',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '18px' }}>📄</span>
              <strong>Autorisation d'exploiter</strong>
            </div>
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
              {mode === 'login' && 'Connexion'}
              {mode === 'register' && 'Inscription'}
              {mode === 'forgot' && 'Mot de passe oublié'}
            </h2>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px', textAlign: 'center' }}>
              {mode === 'login' && 'Accédez à votre compte'}
              {mode === 'register' && 'Rejoignez le réseau'}
              {mode === 'forgot' && 'Recevez un lien de réinitialisation'}
            </p>

            {/* Alerte Email non confirmé */}
            {emailNotConfirmed && (
              <div style={{
                backgroundColor: '#fef3c7',
                border: '1px solid #fcd34d',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px'
              }}>
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#92400e', marginBottom: '8px' }}>
                  📧 Confirmez votre adresse email
                </div>
                <p style={{ fontSize: '13px', color: '#78350f', marginBottom: '12px' }}>
                  Un email de confirmation vous a été envoyé. Vérifiez votre boîte de réception <strong>et vos spams</strong>.
                </p>
                
                {resendSuccess ? (
                  <div style={{
                    backgroundColor: '#ecfdf5',
                    color: '#065f46',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '500'
                  }}>
                    ✅ Email renvoyé ! Vérifiez votre boîte mail.
                  </div>
                ) : (
                  <button
                    onClick={handleResendConfirmation}
                    disabled={resendLoading}
                    style={{
                      backgroundColor: '#92400e',
                      color: 'white',
                      padding: '10px 16px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '500',
                      border: 'none',
                      cursor: resendLoading ? 'not-allowed' : 'pointer',
                      opacity: resendLoading ? 0.7 : 1
                    }}
                  >
                    {resendLoading ? 'Envoi...' : '🔄 Renvoyer l\'email de confirmation'}
                  </button>
                )}
              </div>
            )}

            {/* Message de succès */}
            {success && (
              <div style={{
                backgroundColor: '#ecfdf5',
                color: '#065f46',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '14px'
              }}>
                {success}
              </div>
            )}

            {/* Message d'erreur */}
            {error && !emailNotConfirmed && (
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

            {/* Formulaire Mot de passe oublié */}
            {mode === 'forgot' ? (
              <form onSubmit={handleForgotPassword}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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

                  <button
                    type="submit"
                    disabled={loading}
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
                      opacity: loading ? 0.6 : 1,
                      marginTop: '8px'
                    }}
                  >
                    {loading ? 'Envoi...' : 'Envoyer le lien de réinitialisation'}
                  </button>
                </div>
              </form>
            ) : (
              /* Formulaire Login / Register */
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {mode === 'register' && (
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
                          placeholder="0470123456"
                          style={inputStyle}
                          required
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

                  {/* Lien mot de passe oublié */}
                  {mode === 'login' && (
                    <div style={{ textAlign: 'right', marginTop: '-8px' }}>
                      <button
                        type="button"
                        onClick={() => switchMode('forgot')}
                        style={{
                          backgroundColor: 'transparent',
                          color: '#6b7280',
                          fontSize: '13px',
                          border: 'none',
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                      >
                        Mot de passe oublié ?
                      </button>
                    </div>
                  )}

                  {/* Section vehicule pour inscription */}
                  {mode === 'register' && (
                    <div style={{
                      backgroundColor: '#f0f9ff',
                      borderRadius: '8px',
                      padding: '16px',
                      border: '1px solid #bae6fd'
                    }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#0369a1', marginBottom: '12px' }}>
                        🚗 Votre vehicule principal *
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                          <label style={{ ...labelStyle, fontSize: '12px', color: '#0369a1' }}>Marque *</label>
                          <input
                            type="text"
                            name="marque"
                            value={vehicule.marque}
                            onChange={handleVehiculeChange}
                            placeholder="Mercedes, VW..."
                            style={{ ...inputStyle, padding: '10px', fontSize: '14px' }}
                            required
                          />
                        </div>
                        <div>
                          <label style={{ ...labelStyle, fontSize: '12px', color: '#0369a1' }}>Modele *</label>
                          <input
                            type="text"
                            name="modele"
                            value={vehicule.modele}
                            onChange={handleVehiculeChange}
                            placeholder="Vito, Transporter..."
                            style={{ ...inputStyle, padding: '10px', fontSize: '14px' }}
                            required
                          />
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                          <label style={{ ...labelStyle, fontSize: '12px', color: '#0369a1' }}>Nombre de places (hors chauffeur) *</label>
                          <select
                            name="nb_places"
                            value={vehicule.nb_places}
                            onChange={handleVehiculeChange}
                            style={{ ...inputStyle, padding: '10px', fontSize: '14px' }}
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                              <option key={n} value={n}>{n} place{n > 1 ? 's' : ''}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <p style={{ fontSize: '11px', color: '#0284c7', marginTop: '8px', marginBottom: 0 }}>
                        Vous pourrez ajouter d'autres vehicules dans votre profil
                      </p>
                    </div>
                  )}

                  {/* Case CGU pour inscription */}
                  {mode === 'register' && (
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
                    disabled={loading || (mode === 'register' && !formData.acceptCGU)}
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
                      opacity: loading || (mode === 'register' && !formData.acceptCGU) ? 0.6 : 1,
                      marginTop: '8px'
                    }}
                  >
                    {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : "Créer mon compte"}
                  </button>
                </div>
              </form>
            )}

            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              {mode === 'forgot' ? (
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  style={{
                    backgroundColor: 'transparent',
                    color: '#6b7280',
                    fontSize: '14px',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  ← Retour à la connexion
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                  style={{
                    backgroundColor: 'transparent',
                    color: '#6b7280',
                    fontSize: '14px',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  {mode === 'login' ? "Pas encore inscrit ? Rejoindre" : 'Déjà un compte ? Se connecter'}
                </button>
              )}
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
                Dernières étapes pour activer votre compte...
              </p>
            </div>

            {/* Étape 1 - Email */}
            <div style={{
              backgroundColor: '#dbeafe',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px',
              border: '1px solid #93c5fd'
            }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1e40af', marginBottom: '8px' }}>
                1️⃣ Confirmez votre email
              </h3>
              <p style={{ fontSize: '13px', color: '#1d4ed8' }}>
                Un email de confirmation vient d'être envoyé à <strong>{formData.email}</strong>. 
                Cliquez sur le lien pour activer votre compte. <strong>Vérifiez aussi vos spams !</strong>
              </p>
            </div>

            {/* Étape 2 - Document */}
            <div style={{
              backgroundColor: '#fef3c7',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
              border: '1px solid #fcd34d'
            }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#92400e', marginBottom: '8px' }}>
                2️⃣ Envoyez votre autorisation d'exploiter
              </h3>
              <p style={{ fontSize: '13px', color: '#78350f', marginBottom: '12px' }}>
                Pour valider votre profil et pouvoir candidater aux courses, envoyez simplement votre <strong>autorisation d'exploiter</strong> :
              </p>
              
              <div style={{
                backgroundColor: 'white',
                padding: '12px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <a 
                  href="mailto:shuttlemarketplace@gmail.com?subject=Autorisation%20d'exploiter%20-%20Validation%20profil&body=Bonjour,%0A%0AVeuillez%20trouver%20ci-joint%20mon%20autorisation%20d'exploiter%20pour%20la%20validation%20de%20mon%20profil.%0A%0ANom%20:%20%0ATéléphone%20:%20%0A%0ACordialement"
                  style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#1e40af',
                    textDecoration: 'none'
                  }}
                >
                  📧 shuttlemarketplace@gmail.com
                </a>
              </div>
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