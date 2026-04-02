import { router } from 'one'
import { memo, useState } from 'react'
import { ScrollView, SizableText, Spinner, XStack, YStack } from 'tamagui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useCategories } from '~/features/services/useCategories'
import { useSubscriptions } from '~/features/services/useSubscriptions'
import { useSupabaseAuth } from '~/features/supabase/useSupabaseAuth'
import { Button } from '~/interface/buttons/Button'
import { Input } from '~/interface/forms/Input'
import { showToast } from '~/interface/toast/helpers'

export const CategoriesPage = memo(() => {
  const { user } = useSupabaseAuth()
  const { categories: requestCats, isLoading } = useCategories('request')
  const { categories: offerCats } = useCategories('offer')
  const { subscribe, unsubscribe, isSubscribed } = useSubscriptions(user?.id)
  const insets = useSafeAreaInsets()

  // pending subscription state for notes dialog
  const [pendingCategoryId, setPendingCategoryId] = useState<string | null>(null)
  const [pendingNotes, setPendingNotes] = useState('')

  const handleSubscribePress = (categoryId: string) => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    if (isSubscribed(categoryId)) {
      unsubscribe(categoryId)
      showToast('Відписано від категорії', { type: 'info' })
    } else {
      setPendingCategoryId(categoryId)
      setPendingNotes('')
    }
  }

  const handleConfirmSubscribe = async () => {
    if (!pendingCategoryId) return
    await subscribe(pendingCategoryId, 'both', pendingNotes.trim() || undefined)
    showToast('Підписано на категорію', { type: 'success' })
    setPendingCategoryId(null)
    setPendingNotes('')
  }

  return (
    <YStack flex={1} bg="$background" pt={insets.top}>
      {/* Header */}
      <XStack px="$4" py="$3" items="center" gap="$3" borderBottomWidth={1} borderBottomColor="$borderColor">
        <SizableText size="$3" cursor="pointer" color="$color8" onPress={() => router.back()}>
          ‹ Назад
        </SizableText>
        <SizableText size="$6" fontWeight="bold" flex={1} text="center">
          Категорії
        </SizableText>
      </XStack>

      {/* Inline notes dialog */}
      {pendingCategoryId && (
        <YStack
          px="$4"
          py="$3"
          gap="$2"
          bg="$blue2"
          borderBottomWidth={1}
          borderBottomColor="$blue5"
        >
          <SizableText size="$3" fontWeight="600" color="$blue10">
            Уточнення для підписки (необов'язково)
          </SizableText>
          <Input
            placeholder="Наприклад: тільки у Києві, бюджет до 5000 грн..."
            value={pendingNotes}
            onChangeText={setPendingNotes}
            size="$3"
            multiline
          />
          <XStack gap="$2" justify="flex-end">
            <Button
              size="$3"
              variant="outlined"
              onPress={() => { setPendingCategoryId(null); setPendingNotes('') }}
            >
              Скасувати
            </Button>
            <Button size="$3" theme="dark_blue" variant="floating" onPress={handleConfirmSubscribe}>
              Підписатись
            </Button>
          </XStack>
        </YStack>
      )}

      <ScrollView flex={1}>
        <YStack px="$4" py="$4" gap="$6" maxW={800} mx="auto" width="100%">
          {isLoading ? (
            <YStack items="center" py="$8"><Spinner size="large" /></YStack>
          ) : (
            <>
              {/* Request categories */}
              <YStack gap="$3">
                <SizableText size="$5" fontWeight="bold" color="$color12">
                  🔍 Пошук послуг
                </SizableText>
                <YStack gap="$2">
                  {requestCats.map((cat) => (
                    <XStack
                      key={cat.id}
                      bg="$color2"
                      rounded="$4"
                      p="$3"
                      items="center"
                      gap="$3"
                      borderWidth={1}
                      borderColor="$borderColor"
                    >
                      <SizableText size="$6">{cat.icon}</SizableText>
                      <YStack
                        flex={1}
                        cursor="pointer"
                        onPress={() => router.push(`/home/categories/${cat.id}`)}
                      >
                        <SizableText size="$4" fontWeight="600">{cat.name}</SizableText>
                        <SizableText size="$3" color="$color10">{cat.description}</SizableText>
                      </YStack>
                      <Button
                        size="$3"
                        theme={isSubscribed(cat.id) ? 'green' : undefined}
                        variant={isSubscribed(cat.id) ? 'floating' : 'outlined'}
                        onPress={() => handleSubscribePress(cat.id)}
                      >
                        {isSubscribed(cat.id) ? '✓' : '+'}
                      </Button>
                      <SizableText
                        size="$5"
                        color="$color8"
                        cursor="pointer"
                        onPress={() => router.push(`/home/categories/${cat.id}`)}
                      >
                        ›
                      </SizableText>
                    </XStack>
                  ))}
                </YStack>
              </YStack>

              {/* Offer categories */}
              <YStack gap="$3">
                <SizableText size="$5" fontWeight="bold" color="$color12">
                  🤝 Пропозиції послуг
                </SizableText>
                <YStack gap="$2">
                  {offerCats.map((cat) => (
                    <XStack
                      key={cat.id}
                      bg="$color2"
                      rounded="$4"
                      p="$3"
                      items="center"
                      gap="$3"
                      borderWidth={1}
                      borderColor="$borderColor"
                    >
                      <SizableText size="$6">{cat.icon}</SizableText>
                      <YStack
                        flex={1}
                        cursor="pointer"
                        onPress={() => router.push(`/home/categories/${cat.id}`)}
                      >
                        <SizableText size="$4" fontWeight="600">{cat.name}</SizableText>
                        <SizableText size="$3" color="$color10">{cat.description}</SizableText>
                      </YStack>
                      <Button
                        size="$3"
                        theme={isSubscribed(cat.id) ? 'green' : undefined}
                        variant={isSubscribed(cat.id) ? 'floating' : 'outlined'}
                        onPress={() => handleSubscribePress(cat.id)}
                      >
                        {isSubscribed(cat.id) ? '✓' : '+'}
                      </Button>
                      <SizableText
                        size="$5"
                        color="$color8"
                        cursor="pointer"
                        onPress={() => router.push(`/home/categories/${cat.id}`)}
                      >
                        ›
                      </SizableText>
                    </XStack>
                  ))}
                </YStack>
              </YStack>
            </>
          )}
        </YStack>
      </ScrollView>
    </YStack>
  )
})
