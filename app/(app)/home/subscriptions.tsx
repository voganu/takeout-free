import { router } from 'one'
import { memo } from 'react'
import { ScrollView, SizableText, Spinner, XStack, YStack } from 'tamagui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useSubscriptions } from '~/features/services/useSubscriptions'
import { useSupabaseAuth } from '~/features/supabase/useSupabaseAuth'
import { Button } from '~/interface/buttons/Button'
import { showToast } from '~/interface/toast/helpers'

export const SubscriptionsPage = memo(() => {
  const { user } = useSupabaseAuth()
  const { subscriptions, isLoading, unsubscribe } = useSubscriptions(user?.id)
  const insets = useSafeAreaInsets()

  const requestSubs = subscriptions.filter((s: any) => s.subscription_type === 'requests' || s.subscription_type === 'both')
  const offerSubs = subscriptions.filter((s: any) => s.subscription_type === 'offers' || s.subscription_type === 'both')

  if (!user) {
    return (
      <YStack flex={1} items="center" justify="center" gap="$4" pt={insets.top}>
        <SizableText size="$6">🔔</SizableText>
        <SizableText size="$5">Увійдіть, щоб бачити підписки</SizableText>
        <Button onPress={() => router.push('/auth/login')}>Увійти</Button>
      </YStack>
    )
  }

  return (
    <YStack flex={1} bg="$background" pt={insets.top}>
      {/* Header */}
      <XStack px="$4" py="$3" items="center" gap="$3" borderBottomWidth={1} borderBottomColor="$borderColor">
        <SizableText size="$3" cursor="pointer" color="$color8" onPress={() => router.back()}>
          ‹ Назад
        </SizableText>
        <SizableText size="$6" fontWeight="bold" flex={1}>
          🔔 Підписки
        </SizableText>
        <SizableText size="$3" color="$blue10" cursor="pointer" onPress={() => router.push('/home/categories')}>
          + Додати
        </SizableText>
      </XStack>

      <ScrollView flex={1}>
        {isLoading ? (
          <YStack items="center" py="$8"><Spinner size="large" /></YStack>
        ) : subscriptions.length === 0 ? (
          <YStack items="center" py="$8" gap="$4">
            <SizableText size="$6">📭</SizableText>
            <SizableText size="$5" text="center">Немає підписок</SizableText>
            <SizableText size="$3" color="$color10" text="center" px="$6">
              Підпишіться на категорії, щоб отримувати сповіщення про нові записи
            </SizableText>
            <Button onPress={() => router.push('/home/categories')}>
              Переглянути категорії
            </Button>
          </YStack>
        ) : (
          <YStack px="$4" py="$4" gap="$6" maxW={700} mx="auto" width="100%">
            {/* Request subscriptions */}
            {requestSubs.length > 0 && (
              <YStack gap="$3">
                <SizableText size="$5" fontWeight="bold">🔍 Підписки на запити</SizableText>
                {requestSubs.map((sub: any) => (
                  <XStack
                    key={sub.id}
                    bg="$color2"
                    rounded="$4"
                    p="$3"
                    items="center"
                    gap="$3"
                    borderWidth={1}
                    borderColor="$borderColor"
                  >
                    <SizableText size="$6">{sub.categories?.icon}</SizableText>
                    <YStack
                      flex={1}
                      cursor="pointer"
                      onPress={() => router.push(`/home/categories/${sub.category_id}`)}
                    >
                      <SizableText size="$4" fontWeight="600">{sub.categories?.name}</SizableText>
                      {sub.notes && <SizableText size="$3" color="$color10">{sub.notes}</SizableText>}
                    </YStack>
                    <Button
                      size="$3"
                      theme="red"
                      variant="outlined"
                      onPress={async () => {
                        await unsubscribe(sub.category_id)
                        showToast('Відписано', { type: 'info' })
                      }}
                    >
                      ✕
                    </Button>
                  </XStack>
                ))}
              </YStack>
            )}

            {/* Offer subscriptions */}
            {offerSubs.length > 0 && (
              <YStack gap="$3">
                <SizableText size="$5" fontWeight="bold">🤝 Підписки на пропозиції</SizableText>
                {offerSubs.map((sub: any) => (
                  <XStack
                    key={sub.id}
                    bg="$color2"
                    rounded="$4"
                    p="$3"
                    items="center"
                    gap="$3"
                    borderWidth={1}
                    borderColor="$borderColor"
                  >
                    <SizableText size="$6">{sub.categories?.icon}</SizableText>
                    <YStack
                      flex={1}
                      cursor="pointer"
                      onPress={() => router.push(`/home/categories/${sub.category_id}`)}
                    >
                      <SizableText size="$4" fontWeight="600">{sub.categories?.name}</SizableText>
                      {sub.notes && <SizableText size="$3" color="$color10">{sub.notes}</SizableText>}
                    </YStack>
                    <Button
                      size="$3"
                      theme="red"
                      variant="outlined"
                      onPress={async () => {
                        await unsubscribe(sub.category_id)
                        showToast('Відписано', { type: 'info' })
                      }}
                    >
                      ✕
                    </Button>
                  </XStack>
                ))}
              </YStack>
            )}
          </YStack>
        )}
      </ScrollView>
    </YStack>
  )
})
