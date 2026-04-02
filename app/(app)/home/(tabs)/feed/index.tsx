import { router } from 'one'
import { memo, useState } from 'react'
import { isWeb, ScrollView, SizableText, Spinner, XStack, YStack, Input as TamaguiInput } from 'tamagui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useSupabaseAuth } from '~/features/supabase/useSupabaseAuth'
import { useCategories } from '~/features/services/useCategories'
import { useSubscriptions } from '~/features/services/useSubscriptions'
import { useCategorize } from '~/features/services/useCategorize'
import { Button } from '~/interface/buttons/Button'
import { showToast } from '~/interface/toast/helpers'

export const HomePage = memo(() => {
  const { user } = useSupabaseAuth()
  const { categories: requestCategories } = useCategories('request')
  const { categories: offerCategories } = useCategories('offer')
  const { subscriptions } = useSubscriptions(user?.id)
  const { categorize, isLoading: isCategorizing } = useCategorize()
  const [searchText, setSearchText] = useState('')
  const insets = useSafeAreaInsets()

  const handleSearch = async () => {
    if (!searchText.trim()) return
    if (!user) {
      router.push('/search?q=' + encodeURIComponent(searchText))
      return
    }
    // Use categorize edge function to create listing and redirect
    const { data, error } = await categorize(searchText, user.id)
    if (error) {
      showToast('Помилка обробки запиту', { type: 'error' })
      return
    }
    showToast(data.message, { type: 'success' })
    router.push('/search?q=' + encodeURIComponent(searchText))
  }

  const content = (
    <YStack
      flex={1}
      bg="$background"
      {...(isWeb && {
        width: '100vw' as any,
        ml: '50%' as any,
        transform: 'translateX(-50%)' as any,
        minHeight: '100vh' as any,
      })}
    >
      {/* Center hero section */}
      <YStack
        flex={1}
        items="center"
        justify="center"
        gap="$6"
        pt="$10"
        pb="$8"
        px="$4"
      >
        {/* Logo */}
        <SizableText
          fontSize={56}
          fontWeight="bold"
          color="$color12"
          letterSpacing={-2}
        >
          Agent
        </SizableText>

        {/* Search pill */}
        <YStack width="100%" maxW={600} gap="$3">
          <XStack
            bg="$color2"
            borderWidth={1}
            borderColor="$borderColor"
            rounded={100}
            px="$4"
            py="$2"
            items="center"
            gap="$2"
            hoverStyle={{ borderColor: '$color8' }}
            focusStyle={{ borderColor: '$blue10' }}
          >
            <SizableText size="$5">🔍</SizableText>
            <TamaguiInput
              flex={1}
              placeholder="Напишіть ваш запит або пропозицію..."
              value={searchText}
              onChangeText={setSearchText}
              bg="transparent"
              borderWidth={0}
              size="$5"
              onSubmitEditing={handleSearch}
              placeholderTextColor="$color8"
            />
            {searchText.length > 0 && (
              <SizableText
                size="$5"
                cursor="pointer"
                onPress={() => setSearchText('')}
              >
                ✕
              </SizableText>
            )}
            <SizableText size="$5" cursor="pointer" onPress={handleSearch}>
              🎤
            </SizableText>
          </XStack>

          <XStack justify="center" gap="$2" flexWrap="wrap">
            <Button
              size="$3"
              rounded="$4"
              onPress={handleSearch}
              disabled={isCategorizing}
              theme="dark_blue"
            >
              {isCategorizing ? <Spinner size="small" /> : 'Пошук'}
            </Button>
            <Button
              size="$3"
              rounded="$4"
              onPress={() => router.push('/home/categories')}
            >
              Категорії
            </Button>
          </XStack>
        </YStack>

        {/* Language selector */}
        <SizableText size="$3" color="$color10">
          🇺🇦 Українська
        </SizableText>
      </YStack>

      {/* Subscriptions section */}
      {subscriptions.length > 0 && (
        <YStack px="$4" py="$4" gap="$3" maxW={800} mx="auto" width="100%">
          <SizableText size="$5" fontWeight="bold" color="$color12">
            Мої підписки
          </SizableText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <XStack gap="$2" pb="$2">
              {subscriptions.map((sub: any) => (
                <YStack
                  key={sub.id}
                  bg="$color3"
                  rounded="$4"
                  px="$3"
                  py="$2"
                  cursor="pointer"
                  pressStyle={{ opacity: 0.7 }}
                  onPress={() => router.push(`/home/categories/${sub.category_id}`)}
                >
                  <SizableText size="$3">
                    {sub.categories?.icon} {sub.categories?.name}
                  </SizableText>
                </YStack>
              ))}
            </XStack>
          </ScrollView>
        </YStack>
      )}

      {/* Categories section */}
      <YStack px="$4" py="$4" gap="$4" maxW={800} mx="auto" width="100%">
        <SizableText size="$5" fontWeight="bold" color="$color12">
          Популярні категорії
        </SizableText>
        <YStack gap="$3">
          {requestCategories.slice(0, 4).map((cat) => (
            <XStack
              key={cat.id}
              bg="$color2"
              rounded="$4"
              p="$3"
              items="center"
              gap="$3"
              cursor="pointer"
              pressStyle={{ opacity: 0.7 }}
              borderWidth={1}
              borderColor="$borderColor"
              onPress={() => router.push(`/home/categories/${cat.id}`)}
            >
              <SizableText size="$6">{cat.icon}</SizableText>
              <YStack flex={1}>
                <SizableText size="$4" fontWeight="600">{cat.name}</SizableText>
                <SizableText size="$3" color="$color10">{cat.description}</SizableText>
              </YStack>
              <SizableText size="$5" color="$color8">›</SizableText>
            </XStack>
          ))}
        </YStack>

        <Button
          size="$4"
          variant="outlined"
          onPress={() => router.push('/home/categories')}
        >
          Переглянути всі категорії
        </Button>
      </YStack>

      {/* Footer */}
      <YStack
        py="$4"
        px="$4"
        items="center"
        gap="$2"
        borderTopWidth={1}
        borderTopColor="$borderColor"
        mt="$4"
      >
        <SizableText size="$3" color="$color8">Україна</SizableText>
        <XStack gap="$4" flexWrap="wrap" justify="center">
          <SizableText size="$2" color="$color8" cursor="pointer">Темна тема</SizableText>
          <SizableText size="$2" color="$color8" cursor="pointer" onPress={() => router.push('/home/settings')}>Настройки</SizableText>
          <SizableText size="$2" color="$color8" cursor="pointer">Конфіденційність</SizableText>
          <SizableText size="$2" color="$color8" cursor="pointer">Умови</SizableText>
        </XStack>
      </YStack>
    </YStack>
  )

  if (isWeb) {
    return content
  }

  return (
    <ScrollView flex={1} pt={insets.top + 16}>
      {content}
    </ScrollView>
  )
})
