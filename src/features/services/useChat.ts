'use no memo'
import { useEffect, useState } from 'react'
import { supabase } from '~/features/supabase/client'
import type { ChatMessage } from '~/features/supabase/types'

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
    if (!userId) return { data: null, error: new Error('Not authenticated') }

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
        setMessages(prev => {
          const incoming = payload.new as ChatMessage
          // avoid duplicates from optimistic update
          if (prev.some(m => m.id === incoming.id)) return prev
          return [...prev, incoming]
        })
      })
      .subscribe()

    return () => { supabase.removeChannel(sub) }
  }, [conversationId])

  const sendMessage = async (senderId: string, content: string) => {
    if (!conversationId) return { error: new Error('No conversation') }

    // Optimistic update so the message appears immediately
    const tempId = `temp-${Date.now()}`
    const optimistic: ChatMessage = {
      id: tempId,
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      read_at: null,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, optimistic])

    const { data, error } = await supabase
      .from('chat_messages')
      .insert({ conversation_id: conversationId, sender_id: senderId, content })
      .select()
      .single()

    if (error) {
      // roll back optimistic update
      setMessages(prev => prev.filter(m => m.id !== tempId))
      return { error }
    }

    // replace temp entry with the persisted record
    setMessages(prev => prev.map(m => (m.id === tempId ? data : m)))

    // keep conversation list ordered by latest activity
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId)

    return { data, error: null }
  }

  const markAsRead = async (messageId: string) => {
    await supabase
      .from('chat_messages')
      .update({ read_at: new Date().toISOString() })
      .eq('id', messageId)
  }

  const markAllAsRead = async (userId: string) => {
    if (!conversationId) return
    await supabase
      .from('chat_messages')
      .update({ read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .is('read_at', null)
    setMessages(prev =>
      prev.map(m =>
        m.sender_id !== userId && !m.read_at
          ? { ...m, read_at: new Date().toISOString() }
          : m
      )
    )
  }

  return { messages, isLoading, sendMessage, markAsRead, markAllAsRead }
}

/**
 * Returns the unread message count (messages from the other party that the
 * current user has not yet read) for the conversation linked to a specific
 * listing.  Also returns the conversationId so callers can navigate to it.
 */
export function useListingUnreadCount(
  userId: string | undefined,
  listingId: string | undefined,
  listingType: 'request' | 'offer' | undefined
) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [conversationId, setConversationId] = useState<string | null>(null)

  useEffect(() => {
    if (!userId || !listingId || !listingType) return

    let cancelled = false

    const fetchUnread = async () => {
      const { data: conv, error: convError } = await supabase
        .from('conversations')
        .select('id')
        .eq('listing_id', listingId)
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .maybeSingle()

      if (cancelled || convError || !conv) return

      setConversationId(conv.id)

      const { count, error: countError } = await supabase
        .from('chat_messages')
        .select('id', { count: 'exact', head: true })
        .eq('conversation_id', conv.id)
        .neq('sender_id', userId)
        .is('read_at', null)

      if (!cancelled && !countError) {
        setUnreadCount(count || 0)
      }
    }

    fetchUnread()

    return () => { cancelled = true }
  }, [userId, listingId, listingType])

  return { unreadCount, conversationId }
}
