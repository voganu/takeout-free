import { router, useParams } from 'one'
import { useEffect, useState } from 'react'
import { ScrollView, SizableText, Spinner, XStack, YStack } from 'tamagui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { supabase } from '~/features/supabase/client'
import { useSupabaseAuth } from '~/features/supabase/useSupabaseAuth'
import { useFavorites } from '~/features/services/useFavorites'
import { useConversations } from '~/features/services/useChat'
import { Button } from '~/interface/buttons/Button'
import { showToast } from '~/interface/toast/helpers'
import type { ServiceRequest, ServiceOffer } from '~/features/supabase/types'

export default function ListingDetailPage() {
  const params = useParams()
  const listingType = params?.type as 'request' | 'offer'
  const listingId = params?.id as string
  const { user } = useSupabaseAuth()
  const [listing, setListing] = useState<ServiceRequest | ServiceOffer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const { isFavorite, addFavorite, removeFavorite } = useFavorites(user?.id)
  const { startConversation } = useConversations(user?.id)
  const insets = useSafeAreaInsets()

  useEffect(() => {
    if (!listingId || !listingType) return

    const table = listingType === 'request' ? 'service_requests' : 'service_offers'
    supabase
      .from(table)
      .select('*')
      .eq('id', listingId)
      .single()
      .then(({ data, error }) => {
        setIsLoading(false)
        if (!error) setListing(data as any)
      })
  }, [listingId, listingType])

  const handleStartChat = async () => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    if (!listing) return

    const ownerId = listing.user_id
    if (ownerId === user.id) {
      showToast('Це ваш власний запис', { type: 'info' })
      return
    }

    const { data, error } = await startConversation(ownerId, listingId, listingType)
    if (error) {
      showToast('Помилка створення чату', { type: 'error' })
      return
    }
    router.push(`/home/chat/${data?.id}`)
  }

  const handleFavorite = async () => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    if (isFavorite(listingId)) {
      await removeFavorite(listingId)
      showToast('Видалено з обраних', { type: 'info' })
    } else {
      await addFavorite(listingId, listingType)
      showToast('Додано до обраних', { type: 'success' })
    }
  }

  const handleReport = async () => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    if (!listing) return
    await supabase.from('user_reports').insert({
      reporter_id: user.id,
      reported_user_id: listing.user_id,
      listing_id: listingId,
      listing_type: listingType,
      reason: 'Скарга від користувача',
    })
    showToast('Скаргу надіслано', { type: 'success' })
  }

  if (isLoading) {
    return (
      <YStack flex={1} items="center" justify="center">
        <Spinner size="large" />
      </YStack>
    )
  }

  if (!listing) {
    return (
      <YStack flex={1} items="center" justify="center" gap="$4">
        <SizableText size="$6">😕</SizableText>
        <SizableText size="$5">Запис не знайдено</SizableText>
        <Button onPress={() => router.back()}>Назад</Button>
      </YStack>
    )
  }

  const isOwner = user?.id === listing.user_id
  const priceOrBudget = listingType === 'offer' ? (listing as ServiceOffer).price : (listing as ServiceRequest).budget

  return (
    <YStack flex={1} bg="$background" pt={insets.top}>
      {/* Header */}
      <XStack px="$4" py="$3" items="center" gap="$3" borderBottomWidth={1} borderBottomColor="$borderColor">
        <SizableText size="$3" cursor="pointer" color="$color8" onPress={() => router.back()}>
          ‹ Назад
        </SizableText>
        <SizableText size="$4" fontWeight="bold" flex={1}>
          {listingType === 'request' ? '🔍 Запит' : '🤝 Пропозиція'}
        </SizableText>
        {isOwner && (
          <Button size="$3" variant="outlined" onPress={() => setIsEditing(!isEditing)}>
            ✏️ Редагувати
          </Button>
        )}
      </XStack>

      <ScrollView flex={1}>
        <YStack px="$4" py="$4" gap="$4" maxW={700} mx="auto" width="100%">
          {/* Title */}
          <SizableText size="$7" fontWeight="bold">{listing.title}</SizableText>

          {/* Meta info */}
          <XStack gap="$3" flexWrap="wrap">
            {listing.location && (
              <XStack items="center" gap="$1">
                <SizableText>📍</SizableText>
                <SizableText size="$3" color="$color10">{listing.location}</SizableText>
              </XStack>
            )}
            {priceOrBudget && (
              <XStack items="center" gap="$1">
                <SizableText>💰</SizableText>
                <SizableText size="$3" color="$green10">{priceOrBudget}</SizableText>
              </XStack>
            )}
            <XStack items="center" gap="$1">
              <SizableText size="$3" color="$color8">
                📅 {new Date(listing.created_at).toLocaleDateString('uk-UA')}
              </SizableText>
            </XStack>
          </XStack>

          {/* Status badge */}
          <XStack>
            <YStack
              bg={listing.status === 'active' ? '$green4' : '$color4'}
              rounded="$3"
              px="$3"
              py="$1"
            >
              <SizableText size="$3" color={listing.status === 'active' ? '$green11' : '$color11'}>
                {listing.status === 'active' ? '✓ Активний' : listing.status === 'paused' ? '⏸ Призупинено' : '✕ Закрито'}
              </SizableText>
            </YStack>
          </XStack>

          {/* Period */}
          {(listing.valid_from || listing.valid_until) && (
            <YStack bg="$color3" rounded="$4" p="$3" gap="$1">
              <SizableText size="$3" fontWeight="600" color="$color10">Період дії</SizableText>
              {listing.valid_from && (
                <SizableText size="$3">З: {new Date(listing.valid_from).toLocaleDateString('uk-UA')}</SizableText>
              )}
              {listing.valid_until && (
                <SizableText size="$3">До: {new Date(listing.valid_until).toLocaleDateString('uk-UA')}</SizableText>
              )}
            </YStack>
          )}

          {/* Description */}
          <YStack gap="$2">
            <SizableText size="$4" fontWeight="600">Опис</SizableText>
            <SizableText size="$4" color="$color11" lineHeight={22}>
              {listing.description}
            </SizableText>
          </YStack>

          {/* Actions */}
          {!isOwner && user && (
            <YStack gap="$3" mt="$2">
              <Button
                size="$5"
                theme="dark_blue"
                variant="floating"
                onPress={handleStartChat}
              >
                💬 Написати повідомлення
              </Button>
              <XStack gap="$2">
                <Button
                  flex={1}
                  size="$4"
                  theme={isFavorite(listingId) ? 'yellow' : undefined}
                  variant="outlined"
                  onPress={handleFavorite}
                >
                  {isFavorite(listingId) ? '⭐ В обраних' : '☆ Додати до обраних'}
                </Button>
                <Button
                  size="$4"
                  variant="outlined"
                  onPress={handleReport}
                >
                  🚩
                </Button>
              </XStack>
            </YStack>
          )}

          {/* Owner actions */}
          {isOwner && (
            <YStack gap="$2" mt="$2" bg="$color3" rounded="$4" p="$4">
              <SizableText size="$4" fontWeight="600">Управління записом</SizableText>
              <XStack gap="$2">
                <Button
                  flex={1}
                  size="$4"
                  variant="outlined"
                  onPress={async () => {
                    const table = listingType === 'request' ? 'service_requests' : 'service_offers'
                    const newStatus = listing.status === 'active' ? 'paused' : 'active'
                    await supabase.from(table).update({ status: newStatus }).eq('id', listingId)
                    setListing(prev => prev ? { ...prev, status: newStatus } : null)
                    showToast(`Статус змінено на "${newStatus}"`, { type: 'success' })
                  }}
                >
                  {listing.status === 'active' ? '⏸ Призупинити' : '▶ Активувати'}
                </Button>
              </XStack>
            </YStack>
          )}
        </YStack>
      </ScrollView>
    </YStack>
  )
}
