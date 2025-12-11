import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { sendFirstChatMessageNotification } from '../services/emailService'

export default function Chat({ courseId, otherUserName, course, otherUserId }) {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  // Charger les messages
  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!sender_id (id, nom)
        `)
        .eq('course_id', courseId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
      
      // Marquer les messages comme lus
      markAsRead()
    } catch (error) {
      console.error('Erreur chargement messages:', error)
    } finally {
      setLoading(false)
    }
  }

  // Marquer les messages de l'autre personne comme lus
  const markAsRead = async () => {
    if (!user) return
    
    try {
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('course_id', courseId)
        .neq('sender_id', user.id)
        .eq('read', false)
    } catch (error) {
      console.error('Erreur marquage lu:', error)
    }
  }

  // Envoyer un message
  const handleSend = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    const isFirstMessage = messages.length === 0

    setSending(true)
    try {
      const { error } = await supabase
        .from('messages')
        .insert([{
          course_id: courseId,
          sender_id: user.id,
          content: newMessage.trim()
        }])

      if (error) throw error

      // Si c'est le premier message, envoyer une notification email
      if (isFirstMessage && otherUserId && course) {
        try {
          // Récupérer les infos de l'autre utilisateur
          const { data: otherUser } = await supabase
            .from('users')
            .select('email, nom, notif_email')
            .eq('id', otherUserId)
            .single()

          // Récupérer mon nom
          const { data: myProfile } = await supabase
            .from('users')
            .select('nom')
            .eq('id', user.id)
            .single()

          if (otherUser?.notif_email && otherUser?.email) {
            await sendFirstChatMessageNotification({
              course,
              senderName: myProfile?.nom || 'Un utilisateur',
              recipientEmail: otherUser.email,
              recipientName: otherUser.nom
            })
            console.log('📧 Email notification chat envoyé')
          }
        } catch (emailError) {
          console.error('Erreur envoi email chat:', emailError)
          // Ne pas bloquer l'envoi du message si l'email échoue
        }
      }
      
      setNewMessage('')
      fetchMessages()
    } catch (error) {
      console.error('Erreur envoi message:', error)
      alert('Erreur lors de l\'envoi du message')
    } finally {
      setSending(false)
    }
  }

  // Scroll vers le bas quand nouveaux messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    fetchMessages()

    // Abonnement temps réel aux nouveaux messages
    const subscription = supabase
      .channel(`messages-${courseId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `course_id=eq.${courseId}`
      }, (payload) => {
        fetchMessages()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [courseId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    
    if (isToday) {
      return date.toLocaleTimeString('fr-BE', { hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString('fr-BE', { 
        day: 'numeric', 
        month: 'short',
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
  }

  if (loading) {
    return (
      <div style={{ 
        padding: '24px', 
        textAlign: 'center', 
        color: '#6b7280' 
      }}>
        Chargement des messages...
      </div>
    )
  }

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#f9fafb',
        padding: '16px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{ 
          fontSize: '16px', 
          fontWeight: '600', 
          color: '#111827',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          💬 Discussion avec {otherUserName}
        </div>
        <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
          Échangez les informations complémentaires pour cette course
        </div>
      </div>

      {/* Messages */}
      <div style={{
        height: '300px',
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        backgroundColor: '#fafafa'
      }}>
        {messages.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: '#9ca3af',
            fontSize: '14px',
            padding: '40px 20px'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>💬</div>
            Aucun message pour le moment.<br />
            Commencez la conversation !
          </div>
        ) : (
          messages.map((message) => {
            const isMe = message.sender_id === user?.id
            
            return (
              <div
                key={message.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMe ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  maxWidth: '80%',
                  backgroundColor: isMe ? '#059669' : 'white',
                  color: isMe ? 'white' : '#111827',
                  padding: '12px 16px',
                  borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}>
                  {!isMe && (
                    <div style={{ 
                      fontSize: '12px', 
                      fontWeight: '600', 
                      marginBottom: '4px',
                      color: '#059669'
                    }}>
                      {message.sender?.nom}
                    </div>
                  )}
                  <div style={{ 
                    fontSize: '14px', 
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}>
                    {message.content}
                  </div>
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#9ca3af',
                  marginTop: '4px',
                  paddingLeft: isMe ? '0' : '8px',
                  paddingRight: isMe ? '8px' : '0'
                }}>
                  {formatTime(message.created_at)}
                  {isMe && message.read && ' ✓✓'}
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} style={{
        display: 'flex',
        gap: '12px',
        padding: '16px',
        borderTop: '1px solid #e5e7eb',
        backgroundColor: 'white'
      }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Votre message..."
          style={{
            flex: 1,
            padding: '12px 16px',
            border: '1px solid #d1d5db',
            borderRadius: '24px',
            fontSize: '14px',
            outline: 'none'
          }}
          onFocus={(e) => e.target.style.borderColor = '#059669'}
          onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || sending}
          style={{
            backgroundColor: '#059669',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '24px',
            fontSize: '14px',
            fontWeight: '600',
            border: 'none',
            cursor: newMessage.trim() && !sending ? 'pointer' : 'not-allowed',
            opacity: newMessage.trim() && !sending ? 1 : 0.5,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          {sending ? '...' : '➤'}
        </button>
      </form>
    </div>
  )
}