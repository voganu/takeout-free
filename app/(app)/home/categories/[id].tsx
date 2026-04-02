import { router, useParams } from 'one'
import { memo, useEffect, useState } from 'react'
import { ScrollView, SizableText, Spinner, XStack, YStack } from 'tamagui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useServiceRequests } from '~/features/services/useServiceRequests'
import { useServiceOffers } from '~/features/services/useServiceOffers'
import { useSubscriptions } from '~/features/services/useSubscriptions'
import { useSupabaseAuth } from '~/features/supabase/useSupabaseAuth'
import { supabase } from '~/features/supabase/client'
import { Button } from '~/interface/buttons/Button'
import { Input } from '~/interface/forms/Input'
import { showToast } from '~/interface/toast/helpers'
import type { Category } from '~/features/supabase/types'

export const CategoryPage = memo(() => {
  const params = useParams()
  const categoryId = params?.id as string
  const { user } = useSupabaseAuth()
  const [category, setCategory] = useState<Category | null>(null)
  const [activeTab, setActiveTab] = useState<'requests' | 'offers'>('requests')
  const { requests, isLoading: reqLoading } = useServiceRequests(categoryId)
  const { offers, isLoading: offLoading } = useServiceOffers(categoryId)
  const { subscribe, unsubscribe, isSubscribed } = useSubscriptions(user?.id)
  const insets = useSafeAreaInsets()

  // pending subscription notes state
  const [showNotesInput, setShowNotesInput] = useState(false)
  const [pendingNotes, setPendingNotes] = useState('')

  useEffect(() => {
    if (categoryId) {
      supabase
        .from('categories')
        .select('*')
        .eq('id', categoryId)
        .single()
        .then(({ data }) => setCategory(data))
    }
  }, [categoryId])

  const handleSubscribePress = () => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    if (isSubscribed(categoryId)) {
      unsubscribe(categoryId)
      showToast('Відписано від категорії', { type: 'info' })
    } else {
      setShowNotesInput(true)
      setPendingNotes('')
    }
  }

  const handleConfirmSubscribe = async () => {
    await subscribe(categoryId, 'both', pendingNotes.trim() || undefined)
    showToast('Підписано на категорію', { type: 'success' })
    setShowNotesInput(false)
    setPendingNotes('')
  }

  const isLoading = reqLoading || offLoading

  return (
    <YStack flex={1} bg="$background" pt={insets.top}>
      {/* Header */}
      <XStack px="$4" py="$3" items="center" gap="$3" borderBottomWidth={1} borderBottomColor="$borderColor">
        <SizableText size="$3" cursor="pointer" color="$color8" onPress={() => router.back()}>
          ‹ Назад
        </SizableText>
        <YStack flex={1}>
          <SizableText size="$5" fontWeight="bold">
            {category?.icon} {category?.name}
          </SizableText>
          <SizableText size="$3" color="$color10">{category?.description}</SizableText>
        </YStack>
        <Button
          size="$3"
          theme={isSubscribed(categoryId) ? 'green' : undefined}
          variant={isSubscribed(categoryId) ? 'floating' : 'outlined'}
          onPress={handleSubscribePress}
        >
          {isSubscribed(categoryId) ? '✓ Підписано' : '+ Підписатись'}
        </Button>
      </XStack>

      {/* Inline notes input when subscribing */}
      {showNotesInput && (
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
              onPress={() => { setShowNotesInput(false); setPendingNotes('') }}
            >
              Скасувати
            </Button>
            <Button size="$3" theme="dark_blue" variant="floating" onPress={handleConfirmSubscribe}>
              Підписатись
            </Button>
          </XStack>
        </YStack>
      )}

      {/* Tabs */}
      <XStack px="$4" py="$2" gap="$2" borderBottomWidth={1} borderBottomColor="$borderColor">
        <Button
          size="$3"
          theme={activeTab === 'requests' ? 'dark_blue' : undefined}
          variant={activeTab === 'requests' ? 'floating' : 'outlined'}
          onPress={() => setActiveTab('requests')}
        >
          Запити ({requests.length})
        </Button>
        <Button
          size="$3"
          theme={activeTab === 'offers' ? 'dark_blue' : undefined}
          variant={activeTab === 'offers' ? 'floating' : 'outlined'}
          onPress={() => setActiveTab('offers')}
        >
          Пропозиції ({offers.length})
        </Button>
      </XStack>

      <ScrollView flex={1}>
        <YStack px="$4" py="$4" gap="$3" maxW={800} mx="auto" width="100%">
          {isLoading ? (
            <YStack items="center" py="$8"><Spinner size="large" /></YStack>
          ) : activeTab === 'requests' ? (
            requests.length === 0 ? (
              <YStack items="center" py="$8" gap="$3">
                <SizableText size="$6">📭</SizableText>
                <SizableText size="$5">Немає запитів</SizableText>
              </YStack>
            ) : (
              requests.map((req) => (
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
                  <SizableText size="$5" fontWeight="600">{req.title}</SizableText>
                  <SizableText size="$3" color="$color10" numberOfLines={2}>{req.description}</SizableText>
                  <XStack gap="$2">
                    {req.location && <SizableText size="$3" color="$color8">📍 {req.location}</SizableText>}
                    {req.budget && <SizableText size="$3" color="$green10">💰 {req.budget}</SizableText>}
                  </XStack>
                </YStack>
              ))
            )
          ) : (
            offers.length === 0 ? (
              <YStack items="center" py="$8" gap="$3">
                <SizableText size="$6">📭</SizableText>
                <SizableText size="$5">Немає пропозицій</SizableText>
              </YStack>
            ) : (
              offers.map((offer) => (
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
                  <SizableText size="$5" fontWeight="600">{offer.title}</SizableText>
                  <SizableText size="$3" color="$color10" numberOfLines={2}>{offer.description}</SizableText>
                  <XStack gap="$2">
                    {offer.location && <SizableText size="$3" color="$color8">📍 {offer.location}</SizableText>}
                    {offer.price && <SizableText size="$3" color="$green10">💰 {offer.price}</SizableText>}
                  </XStack>
                </YStack>
              ))
            )
          )}
        </YStack>
      </ScrollView>
    </YStack>
  )
})
