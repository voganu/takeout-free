import { router } from 'one'
import { ScrollView, SizableText, XStack, YStack } from 'tamagui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useSupabaseAuth, signOut } from '~/features/supabase/useSupabaseAuth'
import { Button } from '~/interface/buttons/Button'
import { showToast } from '~/interface/toast/helpers'

export default function SettingsPage() {
  const { user } = useSupabaseAuth()
  const insets = useSafeAreaInsets()

  const handleSignOut = async () => {
    await signOut()
    router.replace('/auth/login')
    showToast('Ви вийшли з системи', { type: 'info' })
  }

  return (
    <YStack flex={1} bg="$background" pt={insets.top}>
      <XStack px="$4" py="$3" items="center" gap="$3" borderBottomWidth={1} borderBottomColor="$borderColor">
        <SizableText size="$3" cursor="pointer" color="$color8" onPress={() => router.back()}>
          ‹ Назад
        </SizableText>
        <SizableText size="$6" fontWeight="bold" flex={1}>Налаштування</SizableText>
      </XStack>

      <ScrollView flex={1}>
        <YStack px="$4" py="$4" gap="$4" maxW={600} mx="auto" width="100%">
          {/* Profile section */}
          <YStack
            bg="$color2"
            rounded="$4"
            p="$4"
            gap="$3"
            borderWidth={1}
            borderColor="$borderColor"
          >
            <XStack items="center" gap="$3">
              <YStack
                width={56}
                height={56}
                rounded={100}
                bg="$color4"
                items="center"
                justify="center"
              >
                <SizableText size="$7">👤</SizableText>
              </YStack>
              <YStack flex={1}>
                <SizableText size="$5" fontWeight="bold">
                  {user?.user_metadata?.full_name || 'Користувач'}
                </SizableText>
                <SizableText size="$3" color="$color10">{user?.email}</SizableText>
              </YStack>
            </XStack>
          </YStack>

          {/* Menu items */}
          <YStack gap="$2">
            {[
              { icon: '📝', label: 'Мої записи', path: '/home/my-listings' },
              { icon: '🔔', label: 'Підписки', path: '/home/subscriptions' },
              { icon: '⊞', label: 'Категорії', path: '/home/categories' },
              { icon: '🔒', label: 'Заблоковані користувачі', path: '/home/settings/blocked-users' },
            ].map((item) => (
              <XStack
                key={item.path}
                bg="$color2"
                rounded="$4"
                px="$4"
                py="$3"
                items="center"
                gap="$3"
                cursor="pointer"
                pressStyle={{ opacity: 0.7 }}
                borderWidth={1}
                borderColor="$borderColor"
                onPress={() => router.push(item.path as any)}
              >
                <SizableText size="$5">{item.icon}</SizableText>
                <SizableText size="$4" flex={1}>{item.label}</SizableText>
                <SizableText size="$5" color="$color8">›</SizableText>
              </XStack>
            ))}
          </YStack>

          {/* Sign out */}
          <Button
            size="$5"
            theme="red"
            variant="outlined"
            onPress={handleSignOut}
          >
            Вийти
          </Button>
        </YStack>
      </ScrollView>
    </YStack>
  )
}
