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
    type: 'membre'
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
        navigate('/dashboard')
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
                valide: false // Nouveau champ - profil non validé par défaut
              }
            ])
          if (profileError) throw profileError
        }

        // Afficher le popup des documents
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
        
        {/* Colonne gauche - Mission & Infos */}
        <div style={{
          flex: '1',
          minWidth: '300px',
          maxWidth: '450px'
        }}>
          {/* Logo */}
          <div style={{ marginBottom: '24px' }}>
            <Logo size="large" />
          </div>

          {/* Mission */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
            padding: '24px',
            marginBottom: '16px'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>
              🚐 Notre mission
            </h2>
            <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.6', marginBottom: '16px' }}>
              <strong>Shuttle Marketplace</strong> connecte les sociétés de navettes aéroport avec des chauffeurs indépendants pour optimiser chaque trajet.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ fontSize: '20px' }}>🚗</span>
                <div>
                  <div style={{ fontWeight: '600', color: '#111827', fontSize: '14px' }}>Pour les chauffeurs</div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>
                    Maximisez votre rentabilité en étant chargé à l'aller comme au retour. Fini les retours à vide !
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ fontSize: '20px' }}>🏢</span>
                <div>
                  <div style={{ fontWeight: '600', color: '#111827', fontSize: '14px' }}>Pour les sociétés</div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>
                    Rentabilisez vos courses en les confiant à des chauffeurs qualifiés quand vous êtes surchargés.
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ fontSize: '20px' }}>💰</span>
                <div>
                  <div style={{ fontWeight: '600', color: '#111827', fontSize: '14px' }}>Système d'enchères</div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>
                    Les chauffeurs proposent leur prix, vous choisissez la meilleure offre.
                  </div>
                </div>
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
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#92400e', marginBottom: '12px' }}>
              📋 Documents requis pour les chauffeurs
            </h3>
            <p style={{ fontSize: '13px', color: '#92400e', marginBottom: '12px' }}>
              Pour exercer légalement le transport de personnes en Belgique, vous devez fournir :
            </p>
            <ul style={{ 
              fontSize: '13px', 
              color: '#78350f', 
              paddingLeft: '20px',
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <li><strong>Autorisation LVC</strong> (Location de Véhicules avec Chauffeur)</li>
              <li><strong>Attestation véhicule</strong></li>
              <li><strong>Attestation d'assurance</strong> transport de personnes</li>
              <li><strong>Certificat d'immatriculation</strong></li>
              <li><strong>Carte verte</strong> (assurance internationale)</li>
            </ul>
            <p style={{ fontSize: '12px', color: '#92400e', marginTop: '12px', fontStyle: 'italic' }}>
              Ces documents seront vérifiés avant l'activation de votre compte.
            </p>
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
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '8px', textAlign: 'center' }}>
              {isLogin ? 'Connexion' : 'Inscription'}
            </h1>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px', textAlign: 'center' }}>
              {isLogin ? 'Connectez-vous à votre compte' : 'Créez votre compte gratuitement'}
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
                      <label style={labelStyle}>Nom complet / Raison sociale *</label>
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
                    <div>
                      <label style={labelStyle}>Type de compte</label>
                      <select name="type" value={formData.type} onChange={handleChange} style={inputStyle}>
                        <option value="membre">Chauffeur / Société</option>
                      </select>
                      <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                        Vous pourrez publier ET prendre des courses
                      </p>
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

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    backgroundColor: '#111827',
                    color: 'white',
                    padding: '14px',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontWeight: '500',
                    border: 'none',
                    cursor: 'pointer',
                    opacity: loading ? 0.7 : 1,
                    marginTop: '8px'
                  }}
                >
                  {loading ? 'Chargement...' : isLogin ? 'Se connecter' : "S'inscrire"}
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
                  cursor: 'pointer'
                }}
              >
                {isLogin ? "Pas encore de compte ? S'inscrire" : 'Déjà un compte ? Se connecter'}
              </button>
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
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
              <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
                Compte créé avec succès !
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
                Pour valider votre profil, envoyez les documents suivants à :
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
                <li>Autorisation LVC</li>
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
              color: '#065f46'
            }}>
              ⏱️ Votre profil sera validé sous <strong>24-48h</strong> après réception des documents.
            </div>

            <button
              onClick={handleClosePopup}
              style={{
                width: '100%',
                backgroundColor: '#111827',
                color: 'white',
                padding: '14px',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: '500',
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