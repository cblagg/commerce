import type { OperationContext } from '@commerce/api/operations'
import type { Category, GetSiteInfoOperation } from '@commerce/types/site'
import type { RawProduct } from '../../types/product'
import type { SquarespaceConfig, Provider } from '../index'

export type GetSiteInfoResult<
  T extends { categories: any[]; brands: any[] } = {
    categories: Category[]
    brands: any[]
  }
> = T

export default function getSiteInfoOperation({
  commerce,
}: OperationContext<Provider>) {
  async function getSiteInfo<T extends GetSiteInfoOperation>({
    config,
  }: {
    query?: string
    variables?: any
    config?: Partial<SquarespaceConfig>
    preview?: boolean
  } = {}): Promise<T['data']> {

    // Get fetch from the config
    const { fetchRest } = commerce.getConfig(config)

    // Get all products
    const rawProducts: RawProduct[] = await fetchRest<{
      products: RawProduct[]
    }>('/1.0/commerce/products').then((response) => response.products)

    const categories = rawProducts
      .reduce((collector, { tags }) => {
        tags.forEach(tag => {
          collector[tag] = {
            id: tag,
            name: tag.toUpperCase(),
            slug: tag,
            path: `/${tag}`
          }
        });
        return collector;
      }, {} as {
        [key: string]: Category
      });

    return {
      // Limited implementation - we don't have display names for tags or brands
      categories: Object.values(categories),
      brands: Object.values(categories),
    }
  }

  return getSiteInfo
}
