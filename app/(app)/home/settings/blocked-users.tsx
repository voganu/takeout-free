import { router } from 'one'
import { ScrollView, SizableText, XStack, YStack } from 'tamagui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useSupabaseAuth } from '~/features/supabase/useSupabaseAuth'
import { supabase } from '~/features/supabase/client'
import { Button } from '~/interface/buttons/Button'
import { showToast } from '~/interface/toast/helpers'
import { useEffect, useState } from 'react'

export default function BlockedUsersPage() {
  const { user } = useSupabaseAuth()
  const [blocked, setBlocked] = useState<any[]>([])
  const insets = useSafeAreaInsets()

  useEffect(() => {
    if (!user) return
    supabase
      .from('blocked_users')
      .select('*, profiles!blocked_users_blocked_id_fkey(full_name, email)')
      .eq('blocker_id', user.id)
      .then(({ data }) => setBlocked(data || []))
  }, [user])

  const handleUnblock = async (blockedId: string) => {
    if (!user) return
    await supabase
      .from('blocked_users')
      .delete()
      .eq('blocker_id', user.id)
      .eq('blocked_id', blockedId)
    setBlocked(prev => prev.filter(b => b.blocked_id !== blockedId))
    showToast('Користувача розблоковано', { type: 'success' })
  }

  return (
    <YStack flex={1} bg="$background" pt={insets.top}>
      <XStack px="$4" py="$3" items="center" gap="$3" borderBottomWidth={1} borderBottomColor="$borderColor">
        <SizableText size="$3" cursor="pointer" color="$color8" onPress={() => router.back()}>
          ‹ Назад
        </SizableText>
        <SizableText size="$6" fontWeight="bold" flex={1}>
          🔒 Заблоковані
        </SizableText>
      </XStack>

      <ScrollView flex={1}>
        <YStack px="$4" py="$4" gap="$3" maxW={600} mx="auto" width="100%">
          {blocked.length === 0 ? (
            <YStack items="center" py="$8" gap="$3">
              <SizableText size="$6">✓</SizableText>
              <SizableText size="$5">Немає заблокованих</SizableText>
            </YStack>
          ) : (
            blocked.map((b) => (
              <XStack
                key={b.id}
                bg="$color2"
                rounded="$4"
                p="$3"
                items="center"
                gap="$3"
                borderWidth={1}
                borderColor="$borderColor"
              >
                <YStack
                  width={40}
                  height={40}
                  rounded={100}
                  bg="$color4"
                  items="center"
                  justify="center"
                >
                  <SizableText>👤</SizableText>
                </YStack>
                <YStack flex={1}>
                  <SizableText size="$4" fontWeight="600">
                    {b.profiles?.full_name || 'Користувач'}
                  </SizableText>
                  <SizableText size="$3" color="$color10">
                    {b.profiles?.email}
                  </SizableText>
                </YStack>
                <Button
                  size="$3"
                  variant="outlined"
                  onPress={() => handleUnblock(b.blocked_id)}
                >
                  Розблокувати
                </Button>
              </XStack>
            ))
          )}
        </YStack>
      </ScrollView>
    </YStack>
  )
}
