import type { OperationContext } from '@commerce/api/operations'
import type { GetProductOperation } from '@commerce/types/product'

import type { RawProduct, RawSpec, RawVariant } from '../../types/product'
import type { SquarespaceConfig, Provider } from '../index'

import { normalizeProduct } from '../../utils/product'

export default function getProductOperation({
  commerce,
}: OperationContext<Provider>) {
  async function getProduct<T extends GetProductOperation>({
    config,
    variables,
  }: {
    query?: string
    variables?: T['variables']
    config?: Partial<OrdercloudConfig>
    preview?: boolean
  } = {}): Promise<T['data']> {
    // Get fetch from the config
    const { fetchRest } = commerce.getConfig(config)

    // Get a single product
    const product = await fetchRest<{
      products: RawProduct[]
    }>(`/1.0/commerce/products/${variables?.slug}`).then((response) => response.products[0])


    return {
      // Normalize product to commerce schema
      product: normalizeProduct(product),
    }
  }

  return getProduct
}
