import { getCommerceProvider, useCommerce as useCoreCommerce } from '@commerce'
import { squarespaceProvider, SquarespaceProvider } from './provider'

export { squarespaceProvider }
export type { SquarespaceProvider }

export const CommerceProvider = getCommerceProvider(squarespaceProvider)

export const useCommerce = () => useCoreCommerce<SquarespaceProvider>()
