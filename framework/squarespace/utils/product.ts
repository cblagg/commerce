import type { Product } from '@commerce/types/product'

import type { RawProduct } from '../types/product'

export function normalizeProduct(product: RawProduct): Product {
  const price = parseFloat(product.variants[0].pricing.basePrice.value);
  const salePrice = parseFloat(product.variants[0].pricing.salePrice.value);

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    slug: product.id,
    images: product.images,
    price: {
      currencyCode: product.variants[0].pricing.basePrice.currency,
      retailPrice: price,
      value: product.variants[0].pricing.onSale ? salePrice : price,
    },
    variants: product.variants.map((variant, i) => ({
      id: variant.id,
      availableForSale: !!product.variants[i].stock.quantity || product.variants[i].stock.unlimited,
      options: Object.entries(variant.attributes).map(([key, value]) => ({
        id: key,
        displayName: key,
        values: [
          {
            // TODO: think this is right? We'll see when rendered
            label: value,
          },
        ],
      })),
    })),
    // TODO: not sure of difference between options and variants
    options: [],
  }
}