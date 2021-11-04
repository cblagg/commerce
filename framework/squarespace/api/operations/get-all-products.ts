import type { GetAllProductsOperation } from '@commerce/types/product'
import type { OperationContext } from '@commerce/api/operations'

import type { RawProduct } from '../../types/product'
import type { SquarespaceConfig, Provider } from '../index'

import { normalizeProduct } from '../../utils/product'

export default function getAllProductsOperation({
  commerce,
}: OperationContext<Provider>) {
  async function getAllProducts<T extends GetAllProductsOperation>({
    config,
  }: {
    query?: string
    variables?: T['variables']
    config?: Partial<SquarespaceConfig>
    preview?: boolean
  } = {}): Promise<T['data']> {
    // Get fetch from the config
    const { fetchRest } = commerce.getConfig(config)

    // Get all products
    const rawProducts: RawProduct[] = await fetchRest<{
      products: RawProduct[]
    }>('/1.0/commerce/products').then((response) => response.products)

    return {
      // Normalize products to commerce schema
      products: rawProducts.map(normalizeProduct),
    }
  }

  return getAllProducts
}
