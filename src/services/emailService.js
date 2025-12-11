const SUPABASE_URL = 'https://cfhgmbcrzjtsehqiywwm.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmaGdtYmNyemp0c2VocWl5d3dtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMxNTQ1MDMsImV4cCI6MjA0ODczMDUwM30.TGnhvnS3RkHT6E4zx0lP_KlhQaVxCU8VxSj4zDVgGXc'

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ to, subject, html })
    })

    const data = await response.json()
    
    if (!response.ok) {
      console.error('Erreur envoi email:', data)
      return { success: false, error: data }
    }

    console.log('📧 Email envoyé:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Erreur:', error)
    return { success: false, error }
  }
}

export const sendNewCourseNotification = async ({ course, recipients }) => {
  const subject = `🚗 Nouvelle course : ${course.depart} → ${course.arrivee}`
  
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-BE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('fr-BE', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #111827; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">🚐 Shuttle Marketplace</h1>
      </div>
      
      <div style="padding: 30px; background-color: #f9fafb;">
        <h2 style="color: #111827; margin-top: 0;">Nouvelle course disponible !</h2>
        
        <div style="background-color: white; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb;">
          <h3 style="margin-top: 0; color: #111827; font-size: 20px;">
            ${course.depart} → ${course.arrivee}
          </h3>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">📅 Date</td>
              <td style="padding: 8px 0; color: #111827; font-weight: 500;">${formatDate(course.date_heure)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">🕐 Heure</td>
              <td style="padding: 8px 0; color: #111827; font-weight: 500;">${formatTime(course.date_heure)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">👥 Passagers</td>
              <td style="padding: 8px 0; color: #111827; font-weight: 500;">${course.nb_passagers}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">💰 Prix</td>
              <td style="padding: 8px 0; color: #059669; font-weight: bold; font-size: 18px;">${course.prix}€</td>
            </tr>
          </table>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://shuttle-marketplace.be/ride/${course.id}" 
             style="background-color: #111827; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 500; display: inline-block;">
            Voir la course
          </a>
        </div>
      </div>
      
      <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
        <p>Vous recevez cet email car vous êtes inscrit sur Shuttle Marketplace.</p>
      </div>
    </div>
  `

  const results = []
  for (const email of recipients) {
    const result = await sendEmail({ to: email, subject, html })
    results.push({ email, ...result })
  }

  return results
}

export const sendCandidatureNotification = async ({ course, candidat, prixPropose, sociétéEmail }) => {
  const subject = `📨 Nouvelle candidature pour ${course.depart} → ${course.arrivee}`

  const isSousEnchere = prixPropose < course.prix
  const economie = course.prix - prixPropose

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #111827; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">🚐 Shuttle Marketplace</h1>
      </div>
      
      <div style="padding: 30px; background-color: #f9fafb;">
        <h2 style="color: #111827; margin-top: 0;">Nouvelle candidature !</h2>
        
        <p style="color: #374151; font-size: 16px;">
          <strong>${candidat.nom}</strong> a candidaté pour votre course :
        </p>
        
        <div style="background-color: white; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb;">
          <h3 style="margin-top: 0; color: #111827;">
            ${course.depart} → ${course.arrivee}
          </h3>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 12px; margin-top: 12px;">
            <div style="font-size: 14px; color: #374151;">
              <strong>👤 ${candidat.nom}</strong>
            </div>
            <div style="font-size: 13px; color: #6b7280; margin-top: 4px;">
              ${candidat.note_moyenne_chauffeur > 0 ? `⭐ ${candidat.note_moyenne_chauffeur}/5` : 'Nouveau chauffeur'} 
              • ${candidat.nb_courses_chauffeur || 0} courses effectuées
            </div>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://shuttle-marketplace.be/my-courses" 
             style="background-color: #059669; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 500; display: inline-block;">
            Voir les candidatures
          </a>
        </div>
      </div>
    </div>
  `

  return await sendEmail({ to: sociétéEmail, subject, html })
}

export const sendAcceptationNotification = async ({ course, chauffeurEmail, societe }) => {
  const subject = `✅ Candidature acceptée : ${course.depart} → ${course.arrivee}`

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-BE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('fr-BE', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const adresseComplete = [societe.rue, societe.numero].filter(Boolean).join(' ') + 
    (societe.code_postal || societe.commune ? ', ' : '') +
    [societe.code_postal, societe.commune].filter(Boolean).join(' ')

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #059669; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">✅ Candidature acceptée !</h1>
      </div>
      
      <div style="padding: 30px; background-color: #f9fafb;">
        <h2 style="color: #111827; margin-top: 0;">Félicitations !</h2>
        
        <p style="color: #374151; font-size: 16px;">
          Votre candidature a été acceptée pour la course suivante :
        </p>
        
        <div style="background-color: white; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb;">
          <h3 style="margin-top: 0; color: #111827; font-size: 20px;">
            ${course.depart} → ${course.arrivee}
          </h3>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">📅 Date</td>
              <td style="padding: 8px 0; color: #111827; font-weight: 500;">${formatDate(course.date_heure)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">🕐 Heure</td>
              <td style="padding: 8px 0; color: #111827; font-weight: 500;">${formatTime(course.date_heure)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">👥 Passagers</td>
              <td style="padding: 8px 0; color: #111827; font-weight: 500;">${course.nb_passagers}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">💰 Prix</td>
              <td style="padding: 8px 0; color: #059669; font-weight: bold; font-size: 18px;">${course.prix}€</td>
            </tr>
          </table>
        </div>
        
        <div style="background-color: white; border-radius: 12px; padding: 20px; margin: 20px 0; border: 2px solid #059669;">
          <h4 style="margin-top: 0; color: #059669; font-size: 16px;">🏢 Informations de facturation</h4>
          
          <p style="margin: 8px 0; color: #111827; font-weight: 600; font-size: 16px;">
            ${societe.raison_sociale || societe.nom}
          </p>
          
          ${societe.numero_tva ? `<p style="margin: 4px 0; color: #374151;">TVA : ${societe.numero_tva}</p>` : ''}
          
          ${adresseComplete ? `<p style="margin: 4px 0; color: #374151;">📍 ${adresseComplete}</p>` : ''}
          
          <p style="margin: 4px 0; color: #374151;">📞 ${societe.telephone}</p>
          
          ${societe.email_facturation ? `<p style="margin: 4px 0; color: #374151;">📧 ${societe.email_facturation}</p>` : ''}
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://shuttle-marketplace.be/my-candidatures" 
             style="background-color: #111827; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 500; display: inline-block;">
            Voir mes candidatures
          </a>
        </div>
      </div>
    </div>
  `

  return await sendEmail({ to: chauffeurEmail, subject, html })
}

export const sendNonRetenuNotification = async ({ course, chauffeurEmail, chauffeurNom }) => {
  const subject = `❌ Candidature non retenue : ${course.depart} → ${course.arrivee}`

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-BE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #6b7280; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">🚐 Shuttle Marketplace</h1>
      </div>
      
      <div style="padding: 30px; background-color: #f9fafb;">
        <h2 style="color: #374151; margin-top: 0;">Candidature non retenue</h2>
        
        <p style="color: #374151; font-size: 16px;">
          Bonjour ${chauffeurNom},
        </p>
        
        <p style="color: #374151; font-size: 16px;">
          Malheureusement, votre candidature pour la course suivante n'a pas été retenue :
        </p>
        
        <div style="background-color: white; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb;">
          <h3 style="margin-top: 0; color: #111827; font-size: 18px;">
            ${course.depart} → ${course.arrivee}
          </h3>
          <p style="color: #6b7280; margin: 8px 0 0 0;">
            📅 ${formatDate(course.date_heure)}
          </p>
        </div>
        
        <div style="background-color: #ecfdf5; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #a7f3d0;">
          <p style="color: #065f46; margin: 0; font-size: 15px;">
            💪 <strong>Ne vous découragez pas !</strong><br><br>
            D'autres courses vous attendent sur Shuttle Marketplace.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://shuttle-marketplace.be/available-rides" 
             style="background-color: #059669; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 500; display: inline-block;">
            Voir les courses disponibles
          </a>
        </div>
      </div>
    </div>
  `

  return await sendEmail({ to: chauffeurEmail, subject, html })
}

// NOUVELLE FONCTION - Notification premier message chat
export const sendFirstChatMessageNotification = async ({ course, senderName, recipientEmail, recipientName }) => {
  const subject = `💬 Nouveau message pour la course ${course.depart} → ${course.arrivee}`

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-BE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    })
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #2563eb; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">💬 Nouveau message</h1>
      </div>
      
      <div style="padding: 30px; background-color: #f9fafb;">
        <p style="color: #374151; font-size: 16px;">
          Bonjour ${recipientName},
        </p>
        
        <p style="color: #374151; font-size: 16px;">
          <strong>${senderName}</strong> vous a envoyé un message concernant la course :
        </p>
        
        <div style="background-color: white; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb;">
          <h3 style="margin-top: 0; color: #111827; font-size: 18px;">
            ${course.depart} → ${course.arrivee}
          </h3>
          <p style="color: #6b7280; margin: 8px 0 0 0;">
            📅 ${formatDate(course.date_heure)}
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://shuttle-marketplace.be/ride/${course.id}" 
             style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 500; display: inline-block;">
            Voir la conversation
          </a>
        </div>
      </div>
      
      <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
        <p>Vous recevez cet email car vous êtes inscrit sur Shuttle Marketplace.</p>
      </div>
    </div>
  `

  return await sendEmail({ to: recipientEmail, subject, html })
}