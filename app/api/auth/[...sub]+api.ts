import type { Endpoint } from 'one'

export const GET: Endpoint = async () => {
  return Response.json({ status: 'ok' })
}

export const POST: Endpoint = async () => {
  return Response.json({ status: 'ok' })
}
