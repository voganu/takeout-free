'use no memo'
import { useEffect, useState } from 'react'
import { supabase } from '~/features/supabase/client'
import type { ChatMessage, Conversation } from '~/features/supabase/types'

export function useConversations(userId: string | undefined) {
  const [conversations, setConversations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    const fetchConversations = () => {
      supabase
        .from('conversations')
        .select('*, profiles!conversations_user1_id_fkey(*), profiles!conversations_user2_id_fkey(*)')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .order('updated_at', { ascending: false })
        .then(({ data }) => {
          setIsLoading(false)
          setConversations(data || [])
        })
    }

    fetchConversations()

    const sub = supabase
      .channel(`conversations:${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, fetchConversations)
      .subscribe()

    return () => { supabase.removeChannel(sub) }
  }, [userId])

  const startConversation = async (otherUserId: string, listingId?: string, listingType?: 'request' | 'offer') => {
    if (!userId) return { error: new Error('Not authenticated') }

    const [user1Id, user2Id] = [userId, otherUserId].sort()

    const { data, error } = await supabase
      .from('conversations')
      .upsert({
        user1_id: user1Id,
        user2_id: user2Id,
        listing_id: listingId || null,
        listing_type: listingType || null,
      }, { onConflict: 'user1_id,user2_id,listing_id' })
      .select()
      .single()

    return { data, error }
  }

  return { conversations, isLoading, startConversation }
}

export function useChatMessages(conversationId: string | undefined) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!conversationId) {
      setIsLoading(false)
      return
    }

    supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setIsLoading(false)
        setMessages(data || [])
      })

    const sub = supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as ChatMessage])
      })
      .subscribe()

    return () => { supabase.removeChannel(sub) }
  }, [conversationId])

  const sendMessage = async (senderId: string, content: string) => {
    if (!conversationId) return

    await supabase.from('chat_messages').insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
    })
  }

  const markAsRead = async (messageId: string) => {
    await supabase
      .from('chat_messages')
      .update({ read_at: new Date().toISOString() })
      .eq('id', messageId)
  }

  return { messages, isLoading, sendMessage, markAsRead }
}
