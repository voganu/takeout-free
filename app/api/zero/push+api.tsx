import type { Endpoint } from 'one'

export const POST: Endpoint = async () => {
  return Response.json({ status: 'ok' })
}
