import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CategorizeRequest {
  text: string
  userId: string
}

// Simple keyword-based categorization
function categorizeText(text: string): { type: 'request' | 'offer'; categorySlug: string; location: string | null; period: string | null } {
  const lowerText = text.toLowerCase()

  // Determine type
  const offerKeywords = ['пропоную', 'надаю', 'виконую', 'продаю', 'здаю', 'роблю', 'можу', 'послуги']
  const requestKeywords = ['шукаю', 'потрібен', 'потрібна', 'потрібно', 'хочу', 'замовлю', 'знайдіть', 'потребую']

  const isOffer = offerKeywords.some(kw => lowerText.includes(kw))
  const isRequest = requestKeywords.some(kw => lowerText.includes(kw))
  const type: 'request' | 'offer' = isOffer && !isRequest ? 'offer' : 'request'

  // Determine category
  let categorySlug = type === 'request' ? 'it-programming' : 'it-programming-offer'

  if (lowerText.match(/програм|код|сайт|веб|додаток|розробк/)) {
    categorySlug = type === 'request' ? 'it-programming' : 'it-programming-offer'
  } else if (lowerText.match(/дизайн|логотип|графік|ui|ux/)) {
    categorySlug = type === 'request' ? 'design' : 'design-offer'
  } else if (lowerText.match(/ремонт|будів|плитк|фарб|електрик|сантехнік/)) {
    categorySlug = type === 'request' ? 'repair-construction' : 'repair-construction-offer'
  } else if (lowerText.match(/репетитор|навчан|урок|курс|англійськ/)) {
    categorySlug = type === 'request' ? 'tutoring' : 'tutoring-offer'
  } else if (lowerText.match(/транспорт|перевез|доставк|таксі|машин/)) {
    categorySlug = type === 'request' ? 'transport' : 'transport-offer'
  } else if (lowerText.match(/перукар|масаж|косметик|краса|манікюр/)) {
    categorySlug = type === 'request' ? 'beauty-health' : 'beauty-health-offer'
  } else if (lowerText.match(/юрист|юридичн|документ|договір|суд/)) {
    categorySlug = type === 'request' ? 'legal' : 'legal-offer'
  } else if (lowerText.match(/прибиран|чистк|клінінг|порядок/)) {
    categorySlug = type === 'request' ? 'cleaning' : 'cleaning-offer'
  }

  // Extract location
  const locationMatch = text.match(/(?:в|у|по)\s+([А-ЯҐЄІЇA-Z][а-яґєіїa-z]+(?:\s+[А-ЯҐЄІЇA-Z][а-яґєіїa-z]+)?)/u)
  const location = locationMatch ? locationMatch[1] : null

  // Extract period
  const periodMatch = text.match(/(?:на|до|з|від)\s+(\d+(?:\s*(?:день|дні|днів|місяць|місяці|місяців|тиждень|тижні|тижнів))?)/i)
  const period = periodMatch ? periodMatch[0] : null

  return { type, categorySlug, location, period }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { text, userId }: CategorizeRequest = await req.json()

    const { type, categorySlug, location, period } = categorizeText(text)

    // Get category
    const { data: category } = await supabase
      .from('categories')
      .select('id, name')
      .eq('slug', categorySlug)
      .single()

    if (!category) {
      return new Response(JSON.stringify({ error: 'Category not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create listing
    const table = type === 'request' ? 'service_requests' : 'service_offers'
    const priceField = type === 'request' ? 'budget' : 'price'

    const { data: listing, error: listingError } = await supabase
      .from(table)
      .insert({
        user_id: userId,
        title: text.substring(0, 100),
        description: text,
        category_id: category.id,
        location: location,
        status: 'active',
        [priceField]: null,
      })
      .select()
      .single()

    if (listingError) {
      return new Response(JSON.stringify({ error: listingError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Auto-subscribe user to category
    await supabase.from('subscriptions').upsert({
      user_id: userId,
      category_id: category.id,
      subscription_type: type === 'request' ? 'offers' : 'requests',
    }, { onConflict: 'user_id,category_id' })

    return new Response(
      JSON.stringify({
        type,
        category,
        listing,
        location,
        period,
        message: `Визначено як ${type === 'request' ? 'запит' : 'пропозиція'} у категорії "${category.name}"`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
