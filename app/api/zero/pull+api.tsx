import type { Endpoint } from 'one'

export const GET: Endpoint = async () => {
  return Response.json({ status: 'ok' })
}
