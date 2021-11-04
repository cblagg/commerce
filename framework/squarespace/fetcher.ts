import { Fetcher } from '@commerce/utils/types'
import { API_TOKEN, API_URL } from './const'
import { handleFetchResponse } from './utils'

export const fetcher: Fetcher = async ({
  url = API_URL,
  method = 'GET',
  variables,
  query,
}) => {
  return handleFetchResponse(
    await fetch(`${API_URL}/${url}`, {
      method,
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'User-Agent': 'Next Demo',
      },
    })
  )
}

export default fetcher