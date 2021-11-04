import type { OperationContext } from '@commerce/api/operations'
import type { GetAllProductPathsOperation } from '@commerce/types/product'

import type { RawProduct } from '../../types/product'
import type { SquarespaceConfig, Provider } from '../'

export type GetAllProductPathsResult = {
  products: Array<{ path: string }>
}

export default function getAllProductPathsOperation({
  commerce,
}: OperationContext<Provider>) {
  async function getAllProductPaths<T extends GetAllProductPathsOperation>({
    config,
  }: {
    config?: Partial<SquarespaceConfig>
  } = {}): Promise<T['data']> {
    // Get fetch from the config
    const { fetchRest } = commerce.getConfig(config)

    // Get all products
    const rawProducts: RawProduct[] = await fetchRest<{
      products: RawProduct[]
    }>('/1.0/commerce/products').then((response) => response.products)

    return {
      // Match a path for every product retrieved
      products: rawProducts.map((product) => ({ path: `/${product.id}` })),
    }
  }

  return getAllProductPaths
}
