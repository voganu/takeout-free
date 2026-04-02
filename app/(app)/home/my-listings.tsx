import { router } from 'one'
import { memo, useState } from 'react'
import { ScrollView, SizableText, Spinner, XStack, YStack } from 'tamagui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useMyServiceRequests } from '~/features/services/useServiceRequests'
import { useMyServiceOffers } from '~/features/services/useServiceOffers'
import { useSupabaseAuth } from '~/features/supabase/useSupabaseAuth'
import { supabase } from '~/features/supabase/client'
import { Button } from '~/interface/buttons/Button'
import { showToast } from '~/interface/toast/helpers'

export const MyListingsPage = memo(() => {
  const { user } = useSupabaseAuth()
  const { requests, isLoading: reqLoading } = useMyServiceRequests(user?.id)
  const { offers, isLoading: offLoading } = useMyServiceOffers(user?.id)
  const [activeTab, setActiveTab] = useState<'requests' | 'offers'>('requests')
  const insets = useSafeAreaInsets()

  if (!user) {
    return (
      <YStack flex={1} items="center" justify="center" gap="$4" pt={insets.top}>
        <SizableText size="$6">📝</SizableText>
        <SizableText size="$5">Увійдіть, щоб бачити свої записи</SizableText>
        <Button onPress={() => router.push('/auth/login')}>Увійти</Button>
      </YStack>
    )
  }

  const isLoading = reqLoading || offLoading

  return (
    <YStack flex={1} bg="$background" pt={insets.top}>
      {/* Header */}
      <XStack px="$4" py="$3" items="center" gap="$3" borderBottomWidth={1} borderBottomColor="$borderColor">
        <SizableText size="$3" cursor="pointer" color="$color8" onPress={() => router.back()}>‹ Назад</SizableText>
        <SizableText size="$6" fontWeight="bold" flex={1}>📝 Мої записи</SizableText>
      </XStack>

      {/* Tabs */}
      <XStack px="$4" py="$2" gap="$2" borderBottomWidth={1} borderBottomColor="$borderColor">
        <Button
          size="$3"
          theme={activeTab === 'requests' ? 'dark_blue' : undefined}
          variant={activeTab === 'requests' ? 'floating' : 'outlined'}
          onPress={() => setActiveTab('requests')}
        >
          Мої запити ({requests.length})
        </Button>
        <Button
          size="$3"
          theme={activeTab === 'offers' ? 'dark_blue' : undefined}
          variant={activeTab === 'offers' ? 'floating' : 'outlined'}
          onPress={() => setActiveTab('offers')}
        >
          Мої пропозиції ({offers.length})
        </Button>
      </XStack>

      <ScrollView flex={1}>
        <YStack px="$4" py="$4" gap="$3" maxW={700} mx="auto" width="100%">
          {isLoading ? (
            <YStack items="center" py="$8"><Spinner size="large" /></YStack>
          ) : activeTab === 'requests' ? (
            requests.length === 0 ? (
              <YStack items="center" py="$8" gap="$3">
                <SizableText size="$6">📭</SizableText>
                <SizableText size="$5">Немає запитів</SizableText>
                <SizableText size="$3" color="$color10" text="center">
                  Опишіть, що вам потрібно, і ми знайдемо виконавця
                </SizableText>
              </YStack>
            ) : (
              requests.map((req) => (
                <XStack
                  key={req.id}
                  bg="$color2"
                  rounded="$4"
                  p="$3"
                  gap="$3"
                  borderWidth={1}
                  borderColor="$borderColor"
                  items="center"
                >
                  <YStack
                    flex={1}
                    cursor="pointer"
                    onPress={() => router.push(`/home/listing/request/${req.id}`)}
                  >
                    <SizableText size="$4" fontWeight="600">{req.title}</SizableText>
                    <SizableText size="$3" color="$color10" numberOfLines={1}>{req.description}</SizableText>
                    <XStack gap="$2" mt="$1">
                      <YStack
                        bg={req.status === 'active' ? '$green4' : '$color4'}
                        rounded="$3"
                        px="$2"
                        py="$0.5"
                      >
                        <SizableText size="$2" color={req.status === 'active' ? '$green11' : '$color11'}>
                          {req.status === 'active' ? 'Активний' : req.status === 'paused' ? 'Призупинено' : 'Закрито'}
                        </SizableText>
                      </YStack>
                      {req.location && <SizableText size="$2" color="$color8">📍 {req.location}</SizableText>}
                    </XStack>
                  </YStack>
                  <Button
                    size="$3"
                    variant="outlined"
                    onPress={() => router.push(`/home/listing/request/${req.id}`)}
                  >
                    ✏️
                  </Button>
                </XStack>
              ))
            )
          ) : (
            offers.length === 0 ? (
              <YStack items="center" py="$8" gap="$3">
                <SizableText size="$6">📭</SizableText>
                <SizableText size="$5">Немає пропозицій</SizableText>
                <SizableText size="$3" color="$color10" text="center">
                  Запропонуйте свої послуги, і ми знайдемо клієнтів
                </SizableText>
              </YStack>
            ) : (
              offers.map((offer) => (
                <XStack
                  key={offer.id}
                  bg="$color2"
                  rounded="$4"
                  p="$3"
                  gap="$3"
                  borderWidth={1}
                  borderColor="$borderColor"
                  items="center"
                >
                  <YStack
                    flex={1}
                    cursor="pointer"
                    onPress={() => router.push(`/home/listing/offer/${offer.id}`)}
                  >
                    <SizableText size="$4" fontWeight="600">{offer.title}</SizableText>
                    <SizableText size="$3" color="$color10" numberOfLines={1}>{offer.description}</SizableText>
                    <XStack gap="$2" mt="$1">
                      <YStack
                        bg={offer.status === 'active' ? '$green4' : '$color4'}
                        rounded="$3"
                        px="$2"
                        py="$0.5"
                      >
                        <SizableText size="$2" color={offer.status === 'active' ? '$green11' : '$color11'}>
                          {offer.status === 'active' ? 'Активний' : offer.status === 'paused' ? 'Призупинено' : 'Закрито'}
                        </SizableText>
                      </YStack>
                      {offer.location && <SizableText size="$2" color="$color8">📍 {offer.location}</SizableText>}
                      {offer.price && <SizableText size="$2" color="$green10">💰 {offer.price}</SizableText>}
                    </XStack>
                  </YStack>
                  <Button
                    size="$3"
                    variant="outlined"
                    onPress={() => router.push(`/home/listing/offer/${offer.id}`)}
                  >
                    ✏️
                  </Button>
                </XStack>
              ))
            )
          )}
        </YStack>
      </ScrollView>
    </YStack>
  )
})
