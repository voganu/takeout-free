import { useParams } from 'one'
import { useEffect, useRef, useState } from 'react'
import { KeyboardAvoidingView, Platform } from 'react-native'
import { ScrollView, SizableText, Spinner, XStack, YStack } from 'tamagui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useChatMessages } from '~/features/services/useChat'
import { useSupabaseAuth } from '~/features/supabase/useSupabaseAuth'
import { Input } from '~/interface/forms/Input'
import { Button } from '~/interface/buttons/Button'

export default function ChatPage() {
  const params = useParams()
  const conversationId = params?.id as string
  const { user } = useSupabaseAuth()
  const { messages, isLoading, sendMessage, markAllAsRead } = useChatMessages(conversationId)
  const [newMessage, setNewMessage] = useState('')
  const scrollRef = useRef<any>(null)
  const insets = useSafeAreaInsets()

  useEffect(() => {
    if (messages.length > 0 && scrollRef.current) {
      scrollRef.current.scrollToEnd?.({ animated: true })
    }
  }, [messages])

  // mark incoming messages as read when the conversation is open
  useEffect(() => {
    if (!user || messages.length === 0) return
    const hasUnread = messages.some(m => m.sender_id !== user.id && !m.read_at)
    if (hasUnread) {
      markAllAsRead(user.id)
    }
  }, [messages.length])

  const handleSend = async () => {
    if (!newMessage.trim() || !user) return
    const text = newMessage.trim()
    setNewMessage('')
    await sendMessage(user.id, text)
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <YStack flex={1} bg="$color3" pt={insets.top}>
        {/* Header */}
        <XStack
          px="$4"
          py="$3"
          items="center"
          gap="$3"
          bg="$background"
          borderBottomWidth={1}
          borderBottomColor="$borderColor"
        >
          <SizableText size="$5" fontWeight="bold">
            💬 Чат
          </SizableText>
        </XStack>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          flex={1}
          px="$2"
          py="$2"
        >
          {isLoading ? (
            <YStack items="center" py="$8">
              <Spinner size="large" />
            </YStack>
          ) : messages.length === 0 ? (
            <YStack items="center" py="$8" gap="$2">
              <SizableText size="$6">💬</SizableText>
              <SizableText size="$4" color="$color10">Напишіть перше повідомлення</SizableText>
            </YStack>
          ) : (
            <YStack gap="$2" py="$2">
              {messages.map((msg) => {
                const isOwn = msg.sender_id === user?.id
                return (
                  <XStack
                    key={msg.id}
                    justify={isOwn ? 'flex-end' : 'flex-start'}
                    px="$2"
                  >
                    <YStack
                      bg={isOwn ? '$green6' : '$background'}
                      rounded="$4"
                      px="$3"
                      py="$2"
                      maxWidth="80%"
                      borderWidth={1}
                      borderColor={isOwn ? '$green8' : '$borderColor'}
                      style={isOwn
                        ? { borderBottomRightRadius: 4 }
                        : { borderBottomLeftRadius: 4 }
                      }
                    >
                      <SizableText size="$4">{msg.content}</SizableText>
                      <SizableText size="$2" color="$color8" text={isOwn ? 'right' : 'left'}>
                        {new Date(msg.created_at).toLocaleTimeString('uk-UA', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {isOwn && (msg.read_at ? ' ✓✓' : ' ✓')}
                      </SizableText>
                    </YStack>
                  </XStack>
                )
              })}
            </YStack>
          )}
        </ScrollView>

        {/* Input */}
        <XStack
          px="$3"
          py="$2"
          gap="$2"
          items="flex-end"
          bg="$background"
          borderTopWidth={1}
          borderTopColor="$borderColor"
          pb={insets.bottom + 8}
        >
          <Input
            flex={1}
            multiline
            placeholder="Написати повідомлення..."
            value={newMessage}
            onChangeText={setNewMessage}
            size="$4"
            maxHeight={120}
          />
          <Button
            size="$4"
            theme="dark_blue"
            variant="floating"
            onPress={handleSend}
            disabled={!newMessage.trim()}
          >
            ➤
          </Button>
        </XStack>
      </YStack>
    </KeyboardAvoidingView>
  )
}
