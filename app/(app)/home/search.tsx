import { router, useParams } from 'one'
import { memo, useEffect, useState } from 'react'
import { ScrollView, SizableText, Spinner, XStack, YStack } from 'tamagui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useSearch } from '~/features/services/useSearch'
import { useCategories } from '~/features/services/useCategories'
import { useSupabaseAuth } from '~/features/supabase/useSupabaseAuth'
import { useConversations } from '~/features/services/useChat'
import { Button } from '~/interface/buttons/Button'
import { Input } from '~/interface/forms/Input'
import { showToast } from '~/interface/toast/helpers'

type FilterType = 'all' | 'requests' | 'offers'

export const SearchPage = memo(() => {
  const params = useParams()
  const initialQuery = (params?.q as string) || ''
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [filter, setFilter] = useState<FilterType>('all')
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()
  const { requests, offers, isLoading, search } = useSearch()
  const { categories } = useCategories()
  const { user } = useSupabaseAuth()
  const { startConversation } = useConversations(user?.id)
  const insets = useSafeAreaInsets()

  useEffect(() => {
    if (initialQuery) {
      search(initialQuery)
    }
  }, [initialQuery])

  const handleSearch = () => {
    if (!searchQuery.trim()) return
    let listingType: 'request' | 'offer' | undefined
    if (filter === 'requests') listingType = 'request'
    else if (filter === 'offers') listingType = 'offer'
    search(searchQuery, selectedCategory, listingType)
  }

  const handleStartChat = async (ownerId: string, listingId: string, listingType: 'request' | 'offer') => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    if (ownerId === user.id) {
      showToast('Це ваш власний запис', { type: 'info' })
      return
    }
    const { data, error } = await startConversation(ownerId, listingId, listingType)
    if (error || !data) {
      showToast('Помилка створення чату', { type: 'error' })
      return
    }
    router.push(`/home/chat/${data.id}`)
  }

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'Усе' },
    { key: 'requests', label: 'Запити' },
    { key: 'offers', label: 'Пропозиції' },
  ]

  return (
    <YStack flex={1} bg="$background" pt={insets.top}>
      {/* Header with search */}
      <XStack
        px="$3"
        py="$2"
        items="center"
        gap="$2"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
      >
        <SizableText
          size="$6"
          fontWeight="bold"
          cursor="pointer"
          onPress={() => router.push('/home/feed')}
        >
          A
        </SizableText>
        <XStack
          flex={1}
          bg="$color2"
          rounded={100}
          px="$3"
          py="$1"
          items="center"
          gap="$2"
          borderWidth={1}
          borderColor="$borderColor"
        >
          <Input
            flex={1}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Пошук..."
            bg="transparent"
            borderWidth={0}
            size="$4"
            onSubmitEditing={handleSearch}
          />
          {searchQuery.length > 0 && (
            <SizableText cursor="pointer" onPress={() => setSearchQuery('')}>✕</SizableText>
          )}
          <SizableText cursor="pointer">🎤</SizableText>
        </XStack>
        <SizableText
          size="$3"
          color="$blue10"
          cursor="pointer"
          onPress={handleSearch}
        >
          Знайти
        </SizableText>
      </XStack>

      {/* Filter tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <XStack px="$3" py="$2" gap="$2">
          {filters.map((f) => (
            <Button
              key={f.key}
              size="$3"
              rounded={100}
              theme={filter === f.key ? 'dark_blue' : undefined}
              variant={filter === f.key ? 'floating' : 'outlined'}
              onPress={() => setFilter(f.key)}
            >
              {f.label}
            </Button>
          ))}
          {categories.slice(0, 6).map((cat) => (
            <Button
              key={cat.id}
              size="$3"
              rounded={100}
              theme={selectedCategory === cat.id ? 'dark_blue' : undefined}
              variant={selectedCategory === cat.id ? 'floating' : 'outlined'}
              onPress={() => setSelectedCategory(selectedCategory === cat.id ? undefined : cat.id)}
            >
              {cat.icon} {cat.name}
            </Button>
          ))}
        </XStack>
      </ScrollView>

      {/* Results */}
      <ScrollView flex={1}>
        <YStack px="$4" py="$2" gap="$3" maxW={800} mx="auto" width="100%">
          {isLoading ? (
            <YStack items="center" py="$8">
              <Spinner size="large" />
            </YStack>
          ) : (
            <>
              {/* Requests */}
              {(filter === 'all' || filter === 'requests') && requests.length > 0 && (
                <YStack gap="$3">
                  <SizableText size="$4" fontWeight="600" color="$color10">
                    Запити ({requests.length})
                  </SizableText>
                  {requests.map((req) => (
                    <YStack
                      key={req.id}
                      bg="$color2"
                      rounded="$4"
                      p="$4"
                      gap="$2"
                      borderWidth={1}
                      borderColor="$borderColor"
                      cursor="pointer"
                      pressStyle={{ opacity: 0.8 }}
                      onPress={() => router.push(`/listing/request/${req.id}`)}
                    >
                      <SizableText size="$2" color="$color8">
                        {req.location && `📍 ${req.location} · `}Запит
                      </SizableText>
                      <SizableText size="$5" fontWeight="600">{req.title}</SizableText>
                      <SizableText size="$3" color="$color10" numberOfLines={2}>
                        {req.description}
                      </SizableText>
                      <XStack gap="$2" mt="$1">
                        {req.budget && (
                          <SizableText size="$3" color="$green10">
                            💰 {req.budget}
                          </SizableText>
                        )}
                        <SizableText size="$3" color="$color8">
                          {new Date(req.created_at).toLocaleDateString('uk-UA')}
                        </SizableText>
                      </XStack>
                      {user && (
                        <XStack gap="$2" mt="$2">
                          <SizableText size="$3" cursor="pointer" color="$color8">👍</SizableText>
                          <SizableText size="$3" cursor="pointer" color="$color8">👎</SizableText>
                          <SizableText size="$3" cursor="pointer" color="$color8">⭐</SizableText>
                          <SizableText
                            size="$3"
                            cursor="pointer"
                            color="$blue10"
                            onPress={() => handleStartChat(req.user_id, req.id, 'request')}
                          >
                            💬 Написати
                          </SizableText>
                        </XStack>
                      )}
                    </YStack>
                  ))}
                </YStack>
              )}

              {/* Offers */}
              {(filter === 'all' || filter === 'offers') && offers.length > 0 && (
                <YStack gap="$3">
                  <SizableText size="$4" fontWeight="600" color="$color10">
                    Пропозиції ({offers.length})
                  </SizableText>
                  {offers.map((offer) => (
                    <YStack
                      key={offer.id}
                      bg="$color2"
                      rounded="$4"
                      p="$4"
                      gap="$2"
                      borderWidth={1}
                      borderColor="$borderColor"
                      cursor="pointer"
                      pressStyle={{ opacity: 0.8 }}
                      onPress={() => router.push(`/listing/offer/${offer.id}`)}
                    >
                      <SizableText size="$2" color="$color8">
                        {offer.location && `📍 ${offer.location} · `}Пропозиція
                      </SizableText>
                      <SizableText size="$5" fontWeight="600">{offer.title}</SizableText>
                      <SizableText size="$3" color="$color10" numberOfLines={2}>
                        {offer.description}
                      </SizableText>
                      <XStack gap="$2" mt="$1">
                        {offer.price && (
                          <SizableText size="$3" color="$green10">
                            💰 {offer.price}
                          </SizableText>
                        )}
                        <SizableText size="$3" color="$color8">
                          {new Date(offer.created_at).toLocaleDateString('uk-UA')}
                        </SizableText>
                      </XStack>
                      {user && (
                        <XStack gap="$2" mt="$2">
                          <SizableText size="$3" cursor="pointer" color="$color8">👍</SizableText>
                          <SizableText size="$3" cursor="pointer" color="$color8">👎</SizableText>
                          <SizableText size="$3" cursor="pointer" color="$color8">⭐</SizableText>
                          <SizableText
                            size="$3"
                            cursor="pointer"
                            color="$blue10"
                            onPress={() => handleStartChat(offer.user_id, offer.id, 'offer')}
                          >
                            💬 Написати
                          </SizableText>
                        </XStack>
                      )}
                    </YStack>
                  ))}
                </YStack>
              )}

              {!isLoading && requests.length === 0 && offers.length === 0 && searchQuery && (
                <YStack items="center" py="$8" gap="$3">
                  <SizableText size="$6">🔍</SizableText>
                  <SizableText size="$5" text="center">Нічого не знайдено</SizableText>
                  <SizableText size="$3" color="$color10" text="center">
                    Спробуйте інший запит або перегляньте категорії
                  </SizableText>
                  <Button onPress={() => router.push('/home/categories')}>
                    Переглянути категорії
                  </Button>
                </YStack>
              )}
            </>
          )}
        </YStack>
      </ScrollView>
    </YStack>
  )
})
