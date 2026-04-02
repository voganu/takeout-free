import type { Endpoint } from 'one'

export const POST: Endpoint = async (req) => {
  return Response.json({ valid: false })
}
