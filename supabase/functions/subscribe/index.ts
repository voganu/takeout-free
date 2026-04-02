import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Extract meaningful keywords from user notes so they can later be used
 * for smarter matching/filtering of listings.
 */
function extractKeywords(notes: string): string {
  if (!notes) return notes
  // Normalise whitespace and remove common filler words
  const fillerWords = new Set([
    'і', 'та', 'або', 'але', 'щоб', 'для', 'що', 'як', 'де', 'з', 'у', 'в',
    'на', 'по', 'за', 'до', 'від', 'при', 'про', 'між', 'над', 'під', 'бо',
    'to', 'the', 'and', 'or', 'for', 'in', 'of', 'a', 'an', 'is', 'are',
  ])
  const keywords = notes
    .trim()
    .split(/[\s,;]+/)
    .filter(w => w.length > 1 && !fillerWords.has(w.toLowerCase()))
  // Deduplicate while preserving order
  return [...new Set(keywords)].join(' ')
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

    const { userId, categoryId, subscriptionType, notes } = await req.json()

    // Process notes: extract key terms so they are useful for matching
    const processedNotes = notes ? extractKeywords(notes) : null

    const { data, error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        category_id: categoryId,
        subscription_type: subscriptionType || 'both',
        notes: processedNotes,
      }, { onConflict: 'user_id,category_id' })
      .select()
      .single()

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ subscription: data, processedNotes }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
