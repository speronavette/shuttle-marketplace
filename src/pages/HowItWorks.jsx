import Header from '../components/Header'

export default function HowItWorks() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Header />

      <main style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '32px 16px'
      }}>
        {/* Hero */}
        <div style={{
          textAlign: 'center',
          marginBottom: '48px'
        }}>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            color: '#111827',
            marginBottom: '16px'
          }}>
            🚐 Comment fonctionne Shuttle Marketplace ?
          </h1>
          <p style={{ 
            fontSize: '18px', 
            color: '#6b7280',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            La plateforme qui connecte les navettistes belges pour optimiser les courses et réduire les trajets à vide.
          </p>
        </div>

        {/* Le concept */}
        <section style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '32px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{ 
            fontSize: '22px', 
            fontWeight: 'bold', 
            color: '#111827',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '28px' }}>💡</span>
            Le concept
          </h2>
          <p style={{ fontSize: '15px', color: '#374151', lineHeight: '1.7', marginBottom: '16px' }}>
            Shuttle Marketplace est une plateforme <strong>B2B entre professionnels du transport</strong>. 
            Elle permet aux sociétés de navettes de publier des courses qu'elles ne peuvent pas assurer 
            elles-mêmes, et à d'autres chauffeurs indépendants ou sociétés de les récupérer.
          </p>
          <p style={{ fontSize: '15px', color: '#374151', lineHeight: '1.7' }}>
            L'objectif ? <strong>Réduire les trajets à vide</strong> et permettre à chacun d'optimiser 
            son planning en trouvant des courses complémentaires sur ses zones de passage.
          </p>
        </section>

        {/* Comment ça marche - Donneur d'ordre */}
        <section style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '32px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{ 
            fontSize: '22px', 
            fontWeight: 'bold', 
            color: '#1e40af',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '28px' }}>📤</span>
            Vous avez une course à sous-traiter ?
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{
                backgroundColor: '#dbeafe',
                color: '#1e40af',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                flexShrink: 0
              }}>1</div>
              <div>
                <div style={{ fontWeight: '600', color: '#111827', marginBottom: '4px' }}>Publiez votre course</div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  Indiquez le trajet, la date, le nombre de passagers et le prix que vous proposez au chauffeur.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{
                backgroundColor: '#dbeafe',
                color: '#1e40af',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                flexShrink: 0
              }}>2</div>
              <div>
                <div style={{ fontWeight: '600', color: '#111827', marginBottom: '4px' }}>Recevez des candidatures</div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  Les chauffeurs intéressés se manifestent. Vous voyez leur profil, note et véhicule.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{
                backgroundColor: '#dbeafe',
                color: '#1e40af',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                flexShrink: 0
              }}>3</div>
              <div>
                <div style={{ fontWeight: '600', color: '#111827', marginBottom: '4px' }}>Choisissez votre chauffeur</div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  Acceptez la candidature qui vous convient. Le chauffeur reçoit les détails complets de la course.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Comment ça marche - Chauffeur */}
        <section style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '32px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{ 
            fontSize: '22px', 
            fontWeight: 'bold', 
            color: '#059669',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '28px' }}>🚗</span>
            Vous cherchez des courses ?
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{
                backgroundColor: '#ecfdf5',
                color: '#059669',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                flexShrink: 0
              }}>1</div>
              <div>
                <div style={{ fontWeight: '600', color: '#111827', marginBottom: '4px' }}>Parcourez les courses disponibles</div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  Consultez les trajets, dates et prix proposés par les donneurs d'ordre.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{
                backgroundColor: '#ecfdf5',
                color: '#059669',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                flexShrink: 0
              }}>2</div>
              <div>
                <div style={{ fontWeight: '600', color: '#111827', marginBottom: '4px' }}>Candidatez aux courses qui vous intéressent</div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  Un clic suffit. Le donneur d'ordre est notifié de votre candidature.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{
                backgroundColor: '#ecfdf5',
                color: '#059669',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                flexShrink: 0
              }}>3</div>
              <div>
                <div style={{ fontWeight: '600', color: '#111827', marginBottom: '4px' }}>Effectuez la course</div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  Une fois accepté, vous recevez toutes les infos : adresses, contact client, détails vol, etc.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Le système de prix */}
        <section style={{
          backgroundColor: '#fef3c7',
          borderRadius: '12px',
          padding: '32px',
          marginBottom: '24px',
          border: '2px solid #fcd34d'
        }}>
          <h2 style={{ 
            fontSize: '22px', 
            fontWeight: 'bold', 
            color: '#92400e',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '28px' }}>💰</span>
            Le système de prix et marges
          </h2>
          
          <p style={{ fontSize: '15px', color: '#78350f', lineHeight: '1.7', marginBottom: '16px' }}>
            <strong>Shuttle Marketplace ne prend aucune commission.</strong> Les prix affichés sont ceux 
            que le donneur d'ordre propose au chauffeur qui effectuera la course.
          </p>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '15px', color: '#78350f', marginBottom: '12px' }}>
              <strong>Exemple concret :</strong>
            </div>
            <ul style={{ 
              margin: 0, 
              paddingLeft: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '14px',
              color: '#78350f'
            }}>
              <li>La société A facture 150€ à son client pour un transfert Charleroi → Zaventem</li>
              <li>Elle publie la course sur Shuttle Marketplace à 80€</li>
              <li>Le chauffeur B accepte et effectue la course pour 80€</li>
              <li>La société A conserve sa marge de 70€, le chauffeur B gagne 80€</li>
            </ul>
          </div>

          <p style={{ fontSize: '15px', color: '#78350f', lineHeight: '1.7' }}>
            <strong>C'est à vous de définir vos prix.</strong> Le donneur d'ordre fixe le montant qu'il 
            est prêt à payer. Les chauffeurs décident si ce montant leur convient. Tout est transparent.
          </p>
        </section>

        {/* Règlement entre professionnels */}
        <section style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '32px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{ 
            fontSize: '22px', 
            fontWeight: 'bold', 
            color: '#111827',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '28px' }}>🤝</span>
            Règlement entre professionnels
          </h2>
          
          <p style={{ fontSize: '15px', color: '#374151', lineHeight: '1.7', marginBottom: '16px' }}>
            <strong>Shuttle Marketplace ne gère pas les paiements.</strong> Les transactions se font 
            directement entre professionnels, selon le mode de règlement indiqué sur chaque course :
          </p>

          <div style={{ display: 'grid', gap: '12px', marginBottom: '16px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              backgroundColor: '#f9fafb',
              padding: '12px 16px',
              borderRadius: '8px'
            }}>
              <span style={{ fontSize: '24px' }}>💵</span>
              <div>
                <div style={{ fontWeight: '600', color: '#111827' }}>Espèces</div>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>Le client paie le chauffeur en main propre</div>
              </div>
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              backgroundColor: '#f9fafb',
              padding: '12px 16px',
              borderRadius: '8px'
            }}>
              <span style={{ fontSize: '24px' }}>📄</span>
              <div>
                <div style={{ fontWeight: '600', color: '#111827' }}>Facture</div>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>Le chauffeur facture le donneur d'ordre après la course</div>
              </div>
            </div>
          </div>

          <p style={{ fontSize: '14px', color: '#6b7280', fontStyle: 'italic' }}>
            Les informations de facturation (raison sociale, TVA, adresse) sont partagées une fois la course attribuée.
          </p>
        </section>

        {/* Ce que la plateforme ne fait PAS */}
        <section style={{
          backgroundColor: '#fef2f2',
          borderRadius: '12px',
          padding: '32px',
          marginBottom: '24px',
          border: '2px solid #fecaca'
        }}>
          <h2 style={{ 
            fontSize: '22px', 
            fontWeight: 'bold', 
            color: '#dc2626',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '28px' }}>⚠️</span>
            Limites et responsabilités
          </h2>
          
          <p style={{ fontSize: '15px', color: '#991b1b', lineHeight: '1.7', marginBottom: '16px' }}>
            Shuttle Marketplace est un <strong>outil de mise en relation</strong>. La plateforme ne peut être 
            tenue responsable des éléments suivants :
          </p>

          <ul style={{ 
            margin: 0, 
            paddingLeft: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            fontSize: '14px',
            color: '#991b1b'
          }}>
            <li><strong>Exécution des courses</strong> — Annulations, retards, qualité du service</li>
            <li><strong>Paiements</strong> — Litiges financiers entre donneurs d'ordre et chauffeurs</li>
            <li><strong>Assurances</strong> — Chaque professionnel doit avoir ses propres assurances</li>
            <li><strong>Conformité légale</strong> — Autorisations, licences, documents à jour</li>
            <li><strong>Litiges</strong> — Tout différend est à régler directement entre les parties</li>
          </ul>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '16px',
            marginTop: '20px'
          }}>
            <p style={{ fontSize: '14px', color: '#991b1b', margin: 0 }}>
              <strong>En utilisant Shuttle Marketplace, vous acceptez d'être un professionnel en règle</strong> 
              (autorisation d'exploiter, assurance transport de personnes, véhicule conforme) et de régler 
              tout différend directement avec l'autre partie.
            </p>
          </div>
        </section>

        {/* Validation des profils */}
        <section style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '32px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{ 
            fontSize: '22px', 
            fontWeight: 'bold', 
            color: '#111827',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '28px' }}>✅</span>
            Validation des profils
          </h2>
          
          <p style={{ fontSize: '15px', color: '#374151', lineHeight: '1.7', marginBottom: '16px' }}>
            Pour garantir un minimum de sérieux, chaque chauffeur doit faire valider son profil 
            avant de pouvoir candidater aux courses. Documents requis :
          </p>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px'
          }}>
            {[
              { icon: '📄', text: 'Autorisation d\'exploiter' },
              { icon: '🚗', text: 'Attestation véhicule' },
              { icon: '🛡️', text: 'Assurance transport de personnes' },
              { icon: '📋', text: 'Certificat d\'immatriculation' },
              { icon: '💳', text: 'Carte verte' }
            ].map((doc, i) => (
              <div key={i} style={{
                backgroundColor: '#f9fafb',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#374151'
              }}>
                {doc.icon} {doc.text}
              </div>
            ))}
          </div>

          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '16px' }}>
            Envoyez vos documents à <strong>shuttlemarketplace@gmail.com</strong> — Validation sous 24-48h.
          </p>
        </section>

        {/* FAQ rapide */}
        <section style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '32px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{ 
            fontSize: '22px', 
            fontWeight: 'bold', 
            color: '#111827',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '28px' }}>❓</span>
            Questions fréquentes
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <div style={{ fontWeight: '600', color: '#111827', marginBottom: '6px' }}>
                La plateforme est-elle gratuite ?
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                Oui, Shuttle Marketplace est 100% gratuit. Aucune commission, aucun frais d'inscription.
              </div>
            </div>

            <div>
              <div style={{ fontWeight: '600', color: '#111827', marginBottom: '6px' }}>
                Qui peut s'inscrire ?
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                Uniquement les professionnels du transport de personnes (sociétés de navettes, 
                chauffeurs indépendants avec autorisation).
              </div>
            </div>

            <div>
              <div style={{ fontWeight: '600', color: '#111827', marginBottom: '6px' }}>
                Comment fonctionne le mode "Premier arrivé" ?
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                Certaines courses sont en mode "Premier arrivé" : le premier chauffeur qui candidate 
                obtient automatiquement la course, sans attendre la validation du donneur d'ordre.
              </div>
            </div>

            <div>
              <div style={{ fontWeight: '600', color: '#111827', marginBottom: '6px' }}>
                Puis-je annuler une course après l'avoir acceptée ?
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                Les annulations doivent être gérées directement avec l'autre partie. Contactez le donneur 
                d'ordre ou le chauffeur le plus tôt possible. Les annulations répétées peuvent affecter 
                votre réputation sur la plateforme.
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div style={{
          textAlign: 'center',
          padding: '32px',
          backgroundColor: '#059669',
          borderRadius: '12px',
          color: 'white'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' }}>
            Prêt à rejoindre le réseau ?
          </h2>
          <p style={{ fontSize: '16px', marginBottom: '24px', opacity: 0.9 }}>
            Inscrivez-vous gratuitement et commencez à optimiser vos courses.
          </p>
          <a
            href="/login"
            style={{
              display: 'inline-block',
              backgroundColor: 'white',
              color: '#059669',
              padding: '14px 32px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              textDecoration: 'none'
            }}
          >
            Créer mon compte →
          </a>
        </div>
      </main>

      {/* Footer simple */}
      <footer style={{
        textAlign: 'center',
        padding: '24px',
        color: '#9ca3af',
        fontSize: '13px'
      }}>
        Une initiative de professionnels, pour les professionnels 🚐
      </footer>
    </div>
  )
}