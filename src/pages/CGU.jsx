import Header from '../components/Header'

export default function CGU() {
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
            Conditions Générales d'Utilisation
          </h1>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '32px' }}>
            Dernière mise à jour : Décembre 2025
          </p>

          <Section title="1. Définitions">
            <p>Dans les présentes CGU :</p>
            <ul>
              <li><strong>« Plateforme »</strong> désigne Shuttle Marketplace, service exploité par Spero Navette, dont le siège social est situé rue du Centenaire 87, 6032 Mont-sur-Marchienne, Belgique, inscrite à la BCE sous le numéro BE1007320551.</li>
              <li><strong>« Donneur d'ordre »</strong> désigne tout Utilisateur qui crée une demande de course via la Plateforme.</li>
              <li><strong>« Chauffeur »</strong> désigne tout Utilisateur qui s'inscrit pour réaliser des courses, en tant que prestataire indépendant.</li>
              <li><strong>« Utilisateur(s) »</strong> désigne collectivement les Donneurs d'ordre et Chauffeurs.</li>
              <li><strong>« Course »</strong> désigne le service de transport proposé via la Plateforme.</li>
              <li><strong>« Prix de la Course »</strong> désigne le montant maximum fixé par le Donneur d'ordre au moment de la publication de la demande. Les Chauffeurs peuvent proposer un prix égal ou inférieur (système d'enchères à la baisse).</li>
              <li><strong>« Commission / Abonnement Plateforme »</strong> désigne la rémunération éventuellement due par l'Utilisateur à la Plateforme pour l'usage du service. Durant la phase de lancement, l'utilisation de la Plateforme est gratuite.</li>
            </ul>
          </Section>

          <Section title="2. Objet des CGU">
            <p>
              Les présentes CGU définissent les conditions selon lesquelles la Plateforme met en relation des Donneurs d'ordre et des Chauffeurs afin de permettre la réalisation de Courses.
            </p>
            <p>
              <strong>La Plateforme agit en qualité d'intermédiaire technique uniquement</strong> — elle ne fournit aucun service de transport, n'est pas partie au contrat de transport, et n'assume aucune responsabilité relative à l'exécution des Courses.
            </p>
          </Section>

          <Section title="3. Conditions d'accès et d'inscription">
            <p>Pour s'inscrire sur la Plateforme, tout Utilisateur doit être majeur et fournir des informations exactes, complètes et à jour.</p>
            <p>Le Chauffeur doit attester qu'il dispose de toutes les autorisations, licences, assurances et immatriculations requises pour exercer légalement une activité de transport de personnes en Belgique, notamment :</p>
            <ul>
              <li>Autorisation LVC (Location de Véhicules avec Chauffeur)</li>
              <li>Attestation véhicule</li>
              <li>Attestation d'assurance transport de personnes</li>
              <li>Certificat d'immatriculation</li>
              <li>Carte verte (assurance internationale)</li>
            </ul>
            <p>
              La Plateforme vérifie ces documents avant d'activer le compte du Chauffeur. Elle se réserve le droit de refuser, suspendre ou supprimer un compte en cas de manquement à ces obligations, sans indemnité.
            </p>
          </Section>

          <Section title="4. Fonctionnement de la mise en relation & système d'enchères">
            <p>Le Donneur d'ordre crée une demande de Course sur la Plateforme, en indiquant :</p>
            <ul>
              <li>Le prix maximum qu'il est prêt à payer</li>
              <li>Les détails du trajet (départ, arrivée, adresses)</li>
              <li>Les horaires</li>
              <li>Le nombre de passagers</li>
              <li>Toute information pertinente (numéro de vol, instructions, etc.)</li>
            </ul>
            <p>
              Les Chauffeurs inscrits et validés peuvent consulter les Courses disponibles et soumettre une candidature avec un prix proposé. <strong>Ce prix doit être égal ou inférieur au prix maximum fixé par le Donneur d'ordre</strong> (système d'enchères à la baisse).
            </p>
            <p>
              Le Donneur d'ordre choisit librement le Chauffeur qu'il souhaite parmi les candidatures reçues, en fonction du prix proposé, de la note et de l'expérience du Chauffeur.
            </p>
            <p>
              En acceptant une candidature, le Donneur d'ordre et le Chauffeur s'engagent mutuellement à exécuter la Course selon les conditions convenues.
            </p>
            <p>
              La Plateforme n'intervient ni dans la négociation ni dans l'exécution du contrat de transport établi entre Donneur d'ordre et Chauffeur.
            </p>
          </Section>

          <Section title="5. Paiement et facturation">
            <p>
              Le prix convenu pour la Course est réglé directement entre le Donneur d'ordre et le Chauffeur, selon les modalités définies entre eux (espèces, virement, carte, facture, etc.).
            </p>
            <p>
              <strong>Durant la phase de lancement, l'utilisation de la Plateforme est entièrement gratuite.</strong> Aucune commission n'est prélevée sur les Courses.
            </p>
            <p>
              La Plateforme se réserve le droit d'introduire ultérieurement un système de commission ou d'abonnement. Les Utilisateurs en seront informés préalablement.
            </p>
            <p>
              La Plateforme n'intervient pas comme intermédiaire de paiement, n'encaisse pas les fonds liés aux Courses, et ne garantit pas le paiement.
            </p>
            <p>
              Chaque Utilisateur est responsable de ses obligations fiscales, comptables et sociales liées aux sommes qu'il perçoit ou paie.
            </p>
          </Section>

          <Section title="6. Absence de responsabilité de la Plateforme">
            <p>La Plateforme décline toute responsabilité concernant :</p>
            <ul>
              <li>La bonne exécution de la Course (ponctualité, qualité du transport, sécurité, confort, comportements, conformité, etc.)</li>
              <li>Tout accident, incident, dommage, sinistre, infraction, ou manquement résultant de la Course</li>
              <li>Tout comportement ou manquement du Chauffeur ou du Donneur d'ordre</li>
              <li>Toute information inexacte, trompeuse ou incomplète fournie par un Utilisateur</li>
              <li>Toute défaillance liée aux moyens de paiement ou au non-paiement de la Course</li>
              <li>Toute conséquence, directe ou indirecte, subie par les Utilisateurs ou des tiers du fait de la Course ou de l'utilisation de la Plateforme</li>
            </ul>
            <p>
              La Plateforme n'est ni transporteur, ni employeur, ni mandataire, et ne peut à ce titre être tenue pour responsable des obligations légales, fiscales, sociales ou assurantielles des Chauffeurs.
            </p>
          </Section>

          <Section title="7. Obligations des Utilisateurs">
            <p>Chaque Utilisateur s'engage à :</p>
            <ul>
              <li>Fournir des informations exactes, sincères et à jour</li>
              <li>Respecter les lois, règlements et obligations applicables à son statut (notamment en matière d'assurance, de licences, de fiscalité)</li>
              <li>Ne pas utiliser la Plateforme à des fins frauduleuses ou illégales</li>
              <li>Informer rapidement la Plateforme de tout changement concernant ses données personnelles, statut légal, licence, assurances ou autres obligations</li>
              <li>Assumer seul les conséquences de ses actes, omissions ou manquements</li>
              <li>Respecter les autres Utilisateurs et adopter un comportement professionnel</li>
            </ul>
          </Section>

          <Section title="8. Système de notation">
            <p>
              Après chaque Course terminée, le Donneur d'ordre et le Chauffeur peuvent se noter mutuellement. Ces notes sont publiques et visent à favoriser la confiance entre Utilisateurs.
            </p>
            <p>
              La Plateforme se réserve le droit de supprimer des avis manifestement abusifs, diffamatoires ou contraires aux présentes CGU.
            </p>
          </Section>

          <Section title="9. Litiges, réclamations et traitement des différends">
            <p>
              En cas de litige ou réclamation relative à une Course (non-exécution, retard, comportement, paiement, etc.), le Donneur d'ordre et le Chauffeur doivent s'efforcer de trouver un accord amiable entre eux.
            </p>
            <p>
              La Plateforme ne joue aucun rôle de médiateur, de garant ou d'arbitre. Elle ne peut être saisie pour régler un différend entre Utilisateurs.
            </p>
            <p>
              Pour toute question ou signalement, les Utilisateurs peuvent contacter la Plateforme à l'adresse : <strong>shuttlemarketplace@gmail.com</strong>
            </p>
          </Section>

          <Section title="10. Suspension, résiliation, exclusion">
            <p>La Plateforme peut, à tout moment et sans préavis, suspendre ou supprimer le compte d'un Utilisateur, notamment en cas de :</p>
            <ul>
              <li>Manquement aux présentes CGU</li>
              <li>Fraude, tentative de fraude, activité illégale</li>
              <li>Mise en danger des passagers ou des tiers</li>
              <li>Non-respect des obligations légales, réglementaires, administratives ou assurantielles</li>
              <li>Comportement inapproprié ou plaintes répétées d'autres Utilisateurs</li>
            </ul>
            <p>Cette suspension ou suppression n'ouvre droit à aucune indemnité de la part de la Plateforme.</p>
          </Section>

          <Section title="11. Protection des données personnelles">
            <p>
              Conformément au Règlement Général sur la Protection des Données (RGPD), la Plateforme collecte et traite les données personnelles des Utilisateurs dans le cadre de la fourniture du service.
            </p>
            <p>Les données collectées comprennent notamment :</p>
            <ul>
              <li>Données d'identification (nom, email, téléphone)</li>
              <li>Données professionnelles (raison sociale, numéro TVA, adresse)</li>
              <li>Données de connexion et d'utilisation</li>
            </ul>
            <p>Ces données sont utilisées pour :</p>
            <ul>
              <li>Permettre le fonctionnement de la Plateforme et la mise en relation</li>
              <li>Envoyer des notifications relatives aux Courses</li>
              <li>Améliorer le service</li>
            </ul>
            <p>
              Les données sont conservées pendant la durée de l'inscription et jusqu'à 3 ans après la suppression du compte.
            </p>
            <p>
              Conformément au RGPD, chaque Utilisateur dispose d'un droit d'accès, de rectification, d'effacement et de portabilité de ses données. Ces droits peuvent être exercés en contactant : <strong>shuttlemarketplace@gmail.com</strong>
            </p>
          </Section>

          <Section title="12. Modification des CGU">
            <p>
              La Plateforme se réserve le droit de modifier les présentes CGU à tout moment. Les modifications sont notifiées aux Utilisateurs via email ou notification sur la Plateforme.
            </p>
            <p>
              L'utilisation continue de la Plateforme après modification vaut acceptation des nouvelles CGU.
            </p>
          </Section>

          <Section title="13. Droit applicable – Juridiction compétente">
            <p>
              Les présentes CGU sont régies par le droit belge.
            </p>
            <p>
              En cas de litige, et après échec d'une tentative de résolution amiable, seuls les tribunaux de l'arrondissement judiciaire de Charleroi seront compétents.
            </p>
            <p>
              Si une clause des présentes s'avère nulle ou inapplicable, les autres clauses resteront en vigueur.
            </p>
          </Section>

          <Section title="14. Contact">
            <p>Pour toute question relative aux présentes CGU ou à l'utilisation de la Plateforme :</p>
            <div style={{
              backgroundColor: '#f3f4f6',
              borderRadius: '8px',
              padding: '16px',
              marginTop: '12px'
            }}>
              <p style={{ margin: '0 0 8px 0' }}><strong>Shuttle Marketplace</strong></p>
              <p style={{ margin: '0 0 4px 0' }}>Exploité par Spero Navette</p>
              <p style={{ margin: '0 0 4px 0' }}>Rue du Centenaire 87, 6032 Mont-sur-Marchienne, Belgique</p>
              <p style={{ margin: '0 0 4px 0' }}>BCE : BE1007320551</p>
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