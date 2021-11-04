import { FetcherError } from '@commerce/utils/errors'
import { API_TOKEN, API_URL } from '../../const'

export default async function fetchRest<T>(
  path: string,
  opts: {
    method?: string
    fetchOptions?: Record<string, any>
    body?: Record<string, unknown>
  } = {}
): Promise<T> {
  const { body, fetchOptions, method = 'GET' } = opts

  const dataResponse = await fetch(
    `${API_URL}${path}`,
    {
      ...fetchOptions,
      method,
      headers: {
        ...fetchOptions?.headers,
        'Authorization': `Bearer ${API_TOKEN}`,
        'User-Agent': 'Next Demo',
      },
      body: body ? JSON.stringify(body) : undefined,
    }
  )

  if (!dataResponse.ok) {
    throw new FetcherError({
      errors: [{ message: dataResponse.statusText }],
      status: dataResponse.status,
    })
  }

  try {
    return (await dataResponse.json()) as Promise<T>
  } catch (error) {
    return null as unknown as Promise<T>
  }
}