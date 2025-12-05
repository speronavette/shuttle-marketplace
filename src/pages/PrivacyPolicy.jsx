import Header from '../components/Header'

export default function PrivacyPolicy() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Header />

      <main style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '32px 16px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb',
          padding: '32px'
        }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
            Politique de Confidentialité
          </h1>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '32px' }}>
            Dernière mise à jour : Décembre 2025
          </p>

          <Section title="1. Responsable du traitement">
            <p>Le responsable du traitement des données personnelles est :</p>
            <div style={{
              backgroundColor: '#f3f4f6',
              borderRadius: '8px',
              padding: '16px',
              marginTop: '12px'
            }}>
              <p style={{ margin: '0 0 4px 0' }}><strong>Spero Navette</strong></p>
              <p style={{ margin: '0 0 4px 0' }}>Rue du Centenaire 87, 6032 Mont-sur-Marchienne, Belgique</p>
              <p style={{ margin: '0 0 4px 0' }}>BCE : BE1007320551</p>
              <p style={{ margin: '0' }}>Email : <a href="mailto:shuttlemarketplace@gmail.com" style={{ color: '#1e40af' }}>shuttlemarketplace@gmail.com</a></p>
            </div>
          </Section>

          <Section title="2. Données collectées">
            <p>Dans le cadre de l'utilisation de la plateforme Shuttle Marketplace, nous collectons les données suivantes :</p>
            
            <h4 style={{ fontWeight: '600', marginTop: '16px', marginBottom: '8px' }}>Données d'identification :</h4>
            <ul>
              <li>Nom et prénom / Raison sociale</li>
              <li>Adresse email</li>
              <li>Numéro de téléphone</li>
              <li>Mot de passe (stocké de manière chiffrée)</li>
            </ul>

            <h4 style={{ fontWeight: '600', marginTop: '16px', marginBottom: '8px' }}>Données professionnelles (pour les sociétés) :</h4>
            <ul>
              <li>Raison sociale</li>
              <li>Numéro de TVA</li>
              <li>Adresse du siège social</li>
              <li>Email de facturation</li>
            </ul>

            <h4 style={{ fontWeight: '600', marginTop: '16px', marginBottom: '8px' }}>Données relatives aux courses :</h4>
            <ul>
              <li>Adresses de départ et d'arrivée</li>
              <li>Dates et heures des courses</li>
              <li>Nombre de passagers</li>
              <li>Prix des courses</li>
              <li>Informations de vol (si applicable)</li>
              <li>Nom et téléphone du passager</li>
            </ul>

            <h4 style={{ fontWeight: '600', marginTop: '16px', marginBottom: '8px' }}>Données techniques :</h4>
            <ul>
              <li>Adresse IP</li>
              <li>Type de navigateur</li>
              <li>Date et heure de connexion</li>
            </ul>
          </Section>

          <Section title="3. Finalités du traitement">
            <p>Vos données personnelles sont traitées pour les finalités suivantes :</p>
            <ul>
              <li><strong>Gestion des comptes utilisateurs</strong> : création, authentification, gestion du profil</li>
              <li><strong>Mise en relation</strong> : permettre aux donneurs d'ordre et chauffeurs de se connecter</li>
              <li><strong>Gestion des courses</strong> : publication, candidatures, attribution, suivi</li>
              <li><strong>Communication</strong> : notifications par email relatives aux courses (nouvelles courses, acceptation, rappels)</li>
              <li><strong>Facturation</strong> : permettre aux utilisateurs d'échanger leurs informations de facturation</li>
              <li><strong>Amélioration du service</strong> : analyse anonymisée de l'utilisation pour améliorer la plateforme</li>
              <li><strong>Sécurité</strong> : prévention des fraudes et protection de la plateforme</li>
            </ul>
          </Section>

          <Section title="4. Base légale du traitement">
            <p>Le traitement de vos données repose sur les bases légales suivantes :</p>
            <ul>
              <li><strong>Exécution du contrat</strong> : le traitement est nécessaire à l'exécution des services de la plateforme (Article 6.1.b du RGPD)</li>
              <li><strong>Consentement</strong> : pour l'envoi de communications marketing, si applicable (Article 6.1.a du RGPD)</li>
              <li><strong>Intérêt légitime</strong> : pour la sécurité de la plateforme et la prévention des fraudes (Article 6.1.f du RGPD)</li>
              <li><strong>Obligation légale</strong> : pour répondre à nos obligations fiscales et légales (Article 6.1.c du RGPD)</li>
            </ul>
          </Section>

          <Section title="5. Destinataires des données">
            <p>Vos données personnelles peuvent être partagées avec :</p>
            <ul>
              <li><strong>Les autres utilisateurs de la plateforme</strong> : dans le cadre de la mise en relation (nom, téléphone, informations de facturation pour les courses attribuées)</li>
              <li><strong>Nos sous-traitants techniques</strong> :
                <ul style={{ marginTop: '8px' }}>
                  <li>Supabase (hébergement et base de données) - serveurs en Europe</li>
                  <li>Resend (envoi d'emails) - serveurs en Europe (Irlande)</li>
                  <li>Render (hébergement du site) - conforme RGPD</li>
                </ul>
              </li>
              <li><strong>Autorités compétentes</strong> : en cas d'obligation légale ou de réquisition judiciaire</li>
            </ul>
            <p style={{ marginTop: '12px' }}>
              <strong>Nous ne vendons jamais vos données personnelles à des tiers.</strong>
            </p>
          </Section>

          <Section title="6. Transferts hors UE">
            <p>
              Nous privilégions des sous-traitants dont les serveurs sont situés dans l'Union Européenne. 
              Dans le cas où un transfert hors UE serait nécessaire, nous nous assurons que des garanties 
              appropriées sont en place (clauses contractuelles types, décision d'adéquation, etc.).
            </p>
          </Section>

          <Section title="7. Durée de conservation">
            <p>Vos données sont conservées pendant les durées suivantes :</p>
            <ul>
              <li><strong>Données du compte</strong> : pendant toute la durée de votre inscription, puis 3 ans après la suppression du compte</li>
              <li><strong>Données des courses</strong> : 5 ans à compter de la réalisation de la course (obligations comptables)</li>
              <li><strong>Données de connexion</strong> : 1 an</li>
              <li><strong>Documents d'identité/professionnels</strong> : pendant la durée de l'inscription + 1 an</li>
            </ul>
            <p style={{ marginTop: '12px' }}>
              À l'issue de ces durées, vos données sont supprimées ou anonymisées de manière irréversible.
            </p>
          </Section>

          <Section title="8. Vos droits">
            <p>Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul>
              <li><strong>Droit d'accès</strong> : obtenir une copie de vos données personnelles</li>
              <li><strong>Droit de rectification</strong> : corriger des données inexactes ou incomplètes</li>
              <li><strong>Droit à l'effacement</strong> : demander la suppression de vos données (dans les limites légales)</li>
              <li><strong>Droit à la limitation</strong> : limiter temporairement le traitement de vos données</li>
              <li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format structuré et lisible</li>
              <li><strong>Droit d'opposition</strong> : vous opposer au traitement de vos données pour des motifs légitimes</li>
              <li><strong>Droit de retirer votre consentement</strong> : à tout moment, pour les traitements basés sur le consentement</li>
            </ul>
            <p style={{ marginTop: '16px' }}>
              Pour exercer vos droits, contactez-nous à : <strong>shuttlemarketplace@gmail.com</strong>
            </p>
            <p>
              Nous répondrons à votre demande dans un délai d'un mois. Ce délai peut être prolongé de deux mois 
              en cas de demande complexe, auquel cas vous serez informé.
            </p>
          </Section>

          <Section title="9. Sécurité des données">
            <p>Nous mettons en œuvre les mesures techniques et organisationnelles appropriées pour protéger vos données :</p>
            <ul>
              <li>Chiffrement des données en transit (HTTPS/TLS)</li>
              <li>Chiffrement des mots de passe</li>
              <li>Accès restreint aux données personnelles</li>
              <li>Hébergement sécurisé chez des prestataires certifiés</li>
              <li>Sauvegardes régulières</li>
            </ul>
          </Section>

          <Section title="10. Cookies">
            <p>
              La plateforme utilise uniquement des <strong>cookies techniques strictement nécessaires</strong> au fonctionnement du service :
            </p>
            <ul>
              <li><strong>Cookies d'authentification</strong> : permettent de maintenir votre session connectée</li>
              <li><strong>Cookies de sécurité</strong> : protection contre les attaques CSRF</li>
            </ul>
            <p style={{ marginTop: '12px' }}>
              Ces cookies sont exemptés de consentement car ils sont indispensables au fonctionnement de la plateforme.
            </p>
            <p>
              <strong>Nous n'utilisons pas de cookies publicitaires ni de cookies de tracking/analytics.</strong>
            </p>
          </Section>

          <Section title="11. Modifications">
            <p>
              Nous pouvons modifier cette politique de confidentialité à tout moment. 
              En cas de modification substantielle, vous serez informé par email ou par une notification sur la plateforme.
            </p>
            <p>
              La date de dernière mise à jour est indiquée en haut de cette page.
            </p>
          </Section>

          <Section title="12. Réclamation">
            <p>
              Si vous estimez que le traitement de vos données personnelles constitue une violation du RGPD, 
              vous avez le droit d'introduire une réclamation auprès de l'autorité de contrôle compétente :
            </p>
            <div style={{
              backgroundColor: '#f3f4f6',
              borderRadius: '8px',
              padding: '16px',
              marginTop: '12px'
            }}>
              <p style={{ margin: '0 0 4px 0' }}><strong>Autorité de Protection des Données (APD)</strong></p>
              <p style={{ margin: '0 0 4px 0' }}>Rue de la Presse 35, 1000 Bruxelles</p>
              <p style={{ margin: '0 0 4px 0' }}>Tél : +32 2 274 48 00</p>
              <p style={{ margin: '0' }}>Site : <a href="https://www.autoriteprotectiondonnees.be" target="_blank" rel="noopener noreferrer" style={{ color: '#1e40af' }}>www.autoriteprotectiondonnees.be</a></p>
            </div>
          </Section>

          <Section title="13. Contact">
            <p>Pour toute question relative à cette politique de confidentialité ou à vos données personnelles :</p>
            <div style={{
              backgroundColor: '#f3f4f6',
              borderRadius: '8px',
              padding: '16px',
              marginTop: '12px'
            }}>
              <p style={{ margin: '0 0 8px 0' }}><strong>Shuttle Marketplace</strong></p>
              <p style={{ margin: '0 0 4px 0' }}>Exploité par Spero Navette</p>
              <p style={{ margin: '0 0 4px 0' }}>Rue du Centenaire 87, 6032 Mont-sur-Marchienne, Belgique</p>
              <p style={{ margin: '0' }}>Email : <a href="mailto:shuttlemarketplace@gmail.com" style={{ color: '#1e40af' }}>shuttlemarketplace@gmail.com</a></p>
            </div>
          </Section>

        </div>
      </main>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <h2 style={{ 
        fontSize: '18px', 
        fontWeight: '600', 
        color: '#111827', 
        marginBottom: '12px',
        paddingBottom: '8px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        {title}
      </h2>
      <div style={{ 
        fontSize: '14px', 
        color: '#374151', 
        lineHeight: '1.7'
      }}>
        {children}
      </div>
      <style>{`
        div ul {
          margin: 12px 0;
          padding-left: 24px;
        }
        div li {
          margin-bottom: 6px;
        }
        div p {
          margin: 12px 0;
        }
      `}</style>
    </div>
  )
}