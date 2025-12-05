import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-BE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  })
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('fr-BE', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

serve(async (req) => {
  try {
    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const { data: newCourses, error: coursesError } = await supabase
      .from('courses')
      .select('*')
      .eq('statut', 'disponible')
      .gte('created_at', yesterday.toISOString())
      .order('date_heure', { ascending: true })

    if (coursesError) throw coursesError

    if (!newCourses || newCourses.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Aucune nouvelle course' 
      }), { headers: { 'Content-Type': 'application/json' } })
    }

    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('email')
      .eq('notif_email', true)
      .eq('notif_resume_quotidien', true)

    if (usersError) throw usersError

    if (!users || users.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Aucun abonné' 
      }), { headers: { 'Content-Type': 'application/json' } })
    }

    const coursesHtml = newCourses.map(course => `
      <div style="background-color: white; border-radius: 8px; padding: 16px; margin-bottom: 12px; border: 1px solid #e5e7eb;">
        <div style="font-size: 16px; font-weight: 600; color: #111827; margin-bottom: 8px;">
          ${course.depart} → ${course.arrivee}
        </div>
        <div style="font-size: 14px; color: #6b7280;">
          📅 ${formatDate(course.date_heure)} • 🕐 ${formatTime(course.date_heure)} • 👥 ${course.nb_passagers} pers. • <span style="color: #059669; font-weight: bold;">💰 ${course.prix}€</span>
        </div>
        <a href="https://shuttle-marketplace.vercel.app/ride/${course.id}" 
           style="display: inline-block; margin-top: 12px; background-color: #111827; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 14px;">
          Voir la course
        </a>
      </div>
    `).join('')

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #111827; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">🚐 Shuttle Marketplace</h1>
        </div>
        <div style="padding: 30px; background-color: #f9fafb;">
          <h2 style="color: #111827; margin-top: 0;">📋 Résumé du jour - ${newCourses.length} nouvelle(s) course(s)</h2>
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">Voici les courses publiées dans les dernières 24 heures :</p>
          ${coursesHtml}
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://shuttle-marketplace.vercel.app/available-rides" 
               style="background-color: #059669; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 500; display: inline-block;">
              Voir toutes les courses
            </a>
          </div>
        </div>
        <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
          <p>Vous recevez cet email car vous êtes abonné au résumé quotidien.</p>
        </div>
      </div>
    `

    const recipients = ['spero.navette@gmail.com']
    
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Shuttle Marketplace <onboarding@resend.dev>',
        to: recipients,
        subject: `📋 ${newCourses.length} nouvelle(s) course(s) disponible(s)`,
        html: html
      })
    })

    const emailResult = await emailResponse.json()

    return new Response(JSON.stringify({ 
      success: true, 
      coursesCount: newCourses.length,
      recipientsCount: recipients.length,
      emailResult 
    }), { headers: { 'Content-Type': 'application/json' } })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})