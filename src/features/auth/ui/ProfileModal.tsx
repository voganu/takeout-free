import { router } from 'one'
import { useState } from 'react'
import { isWeb, SizableText, XStack, YStack } from 'tamagui'

import { useSupabaseAuth, signOut } from '~/features/supabase/useSupabaseAuth'
import { useSubscriptions } from '~/features/services/useSubscriptions'
import { Button } from '~/interface/buttons/Button'
import { showToast } from '~/interface/toast/helpers'

interface ProfileModalProps {
  onClose: () => void
}

export function ProfileModal({ onClose }: ProfileModalProps) {
  const { user } = useSupabaseAuth()
  const { subscriptions } = useSubscriptions(user?.id)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    await signOut()
    setIsSigningOut(false)
    onClose()
    router.replace('/auth/login')
    showToast('Ви вийшли з системи', { type: 'info' })
  }

  if (!user) return null

  return (
    <YStack
      bg="$background"
      borderRadius={28}
      p="$5"
      gap="$4"
      width={isWeb ? 360 : '100%'}
      shadowColor="$shadowColor"
      shadowRadius={20}
      borderWidth={1}
      borderColor="$borderColor"
    >
      {/* Header */}
      <XStack justify="space-between" items="center">
        <SizableText size="$3" cursor="pointer" onPress={onClose}>✕</SizableText>
        <SizableText size="$3" color="$color8">{user.email}</SizableText>
        <YStack
          width={40}
          height={40}
          rounded={100}
          bg="$color4"
          items="center"
          justify="center"
        >
          <SizableText size="$5">👤</SizableText>
        </YStack>
      </XStack>

      {/* Welcome text */}
      <SizableText size="$5" fontWeight="bold">
        Вітаємо, {user.user_metadata?.full_name?.split(' ')[0] || 'Друже'}! 👋
      </SizableText>

      {/* Info panel */}
      <YStack bg="$color3" rounded="$4" p="$3" gap="$2">
        <XStack items="center" gap="$2">
          <SizableText>📍</SizableText>
          <SizableText size="$3" color="$color10">
            {user.user_metadata?.location || 'Локацію не вказано'}
          </SizableText>
        </XStack>
        <XStack items="center" gap="$2">
          <SizableText>🔔</SizableText>
          <SizableText size="$3" color="$color10">
            {subscriptions.length} {subscriptions.length === 1 ? 'підписка' : 'підписок'}
          </SizableText>
        </XStack>
      </YStack>

      {/* Action buttons */}
      <XStack gap="$2">
        <Button flex={1} size="$4" variant="outlined" onPress={() => { onClose(); router.push('/home/my-listings') }}>
          📝 Мої записи
        </Button>
        <Button flex={1} size="$4" variant="outlined" onPress={() => { onClose(); router.push('/home/subscriptions') }}>
          🔔 Підписки
        </Button>
      </XStack>

      {/* Settings list */}
      <YStack gap="$1">
        {[
          { icon: '🔍', label: 'Історія пошуку' },
          { icon: '⊞', label: 'Категорії', onPress: () => { onClose(); router.push('/home/categories') } },
          { icon: '🌐', label: 'Мова: Українська' },
          { icon: '🔒', label: 'Безпечний пошук' },
        ].map((item, i) => (
          <XStack
            key={i}
            px="$3"
            py="$2"
            items="center"
            gap="$3"
            cursor="pointer"
            rounded="$3"
            hoverStyle={{ bg: '$color3' }}
            onPress={item.onPress}
          >
            <SizableText>{item.icon}</SizableText>
            <SizableText size="$4" flex={1}>{item.label}</SizableText>
            <SizableText color="$color8">›</SizableText>
          </XStack>
        ))}
      </YStack>

      {/* Footer */}
      <YStack gap="$2" borderTopWidth={1} borderTopColor="$borderColor" pt="$3">
        <XStack gap="$3" flexWrap="wrap">
          <SizableText size="$2" color="$color8" cursor="pointer">Додаткові налаштування</SizableText>
          <SizableText size="$2" color="$color8" cursor="pointer">Довідка</SizableText>
          <SizableText size="$2" color="$color8" cursor="pointer">Конфіденційність</SizableText>
        </XStack>
        <Button
          size="$4"
          theme="red"
          variant="outlined"
          onPress={handleSignOut}
          disabled={isSigningOut}
        >
          Вийти
        </Button>
      </YStack>
    </YStack>
  )
}
