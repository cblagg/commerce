import { NextRequest, NextResponse } from 'next/server';
import { SQUARESPACE_ADMIN_ORIGIN, SQUARESPACE_API_KEY, SQUARESPACE_API_URL } from '../constants';
import { convertTagToCollection, fuzzyMatch, replaceNonAlphanumeric } from '../utils';
import { Cart, Collection, Menu, Page, Pagination, Product, ProductOption, SquarespaceProduct, SquarespaceProductImage, SquarespaceVariant } from './types';

const PLACEHOLDER_CART_ID = '123';

export async function createCart(existingCookieCartId: string): Promise<Cart> {
  // NOTE: on Squarespace side we can't create cart without item params as
  // quantity, productEntityId
  if (existingCookieCartId && existingCookieCartId !== PLACEHOLDER_CART_ID) {
    const existingCart = await getCart(existingCookieCartId);
            // @ts-ignore

    return existingCart;
  }

  return {
    id: PLACEHOLDER_CART_ID,
    checkoutUrl: '',
    cost: {
      subtotalAmount: {
        amount: '',
        currencyCode: ''
      },
      totalAmount: {
        amount: '',
        currencyCode: ''
      },
      totalTaxAmount: {
        amount: '',
        currencyCode: ''
      }
    },
    lines: [],
    totalQuantity: 0
  };
}

const reshapeCart = (cart: Cart): Cart => {
          // @ts-ignore
  const currency = cart.entries[0].item.price.currency;
  const subtotalAmount = {
    amount: String(
              // @ts-ignore
      cart.entries.reduce((collector, item) => {
        return collector + (parseFloat(item.chosenVariant.priceMoney.value) * item.quantity);
      }, 0)
    ),
    currencyCode: currency
  };

          // @ts-ignore

  const lineItems = cart.entries!.map((item) => {
    return {
      id: item.id,
      quantity: item.quantity,
      cost: {
        totalAmount: {
          amount: String(parseFloat(item.item.price.value) * item.quantity),
          currencyCode: item.item.price.currency
        }
      },
      merchandise: {
        id: item.id,
        title: item.title,
        selectedOptions: [],
        product: {
          handle: item.itemId,
          /*featuredImage: {
            altText: 'altText' in featuredImage ? featuredImage.altText : 'alt text',
            url: media.getImageUrl(item.image!).url,
            width: media.getImageUrl(item.image!).width,
            height: media.getImageUrl(item.image!).height
          },*/
          title: item.title
        } as any as Product,
        url: `/product/${item.itemId}`
      }
    };
  });

  return {
            // @ts-ignore
    id: cart.cartToken,
            // @ts-ignore
    cartToken: cart.cartToken,
            // @ts-ignore
    checkoutUrl: `${SQUARESPACE_ADMIN_ORIGIN}/checkout?cartToken=${cart.cartToken}`,
    cost: {
      subtotalAmount,
      totalAmount: {
                // @ts-ignore
        amount: subtotalAmount.amount + (cart.taxCents / 100),
        currencyCode: currency
      },
      totalTaxAmount: {
                // @ts-ignore
        amount: cart.taxCents,
        currencyCode: currency
      }
    },
    lines: lineItems,
            // @ts-ignore
    totalQuantity: lineItems.reduce((acc, item) => {
      return acc + item.quantity!;
    }, 0)
  };
};

const reshapeImage = (image: SquarespaceProductImage) => {
  return {
    id: image.id,
    altText: image.altText,
    orderIndex: image.orderIndex,
    src: image.url,
    url: image.url
    // originalSize
  };
};

const reshapeProduct = (item: SquarespaceProduct) => {
  const images = item.images.map(reshapeImage);
  const firstVariant = item.variants[0] as SquarespaceVariant;

  const { lowestPrice, highestPrice } = item.variants.reduce((collector, variant) => {    
    if (parseFloat(variant.pricing.basePrice.value) < parseFloat(collector.lowestPrice?.value)) {
      collector.lowestPrice = variant.pricing.basePrice;
    }
    if (parseFloat(variant.pricing.basePrice.value) > parseFloat(collector.highestPrice?.value)) {
      collector.highestPrice = variant.pricing.basePrice;
    }
    return collector;
  }, { lowestPrice: firstVariant?.pricing.basePrice, highestPrice: firstVariant?.pricing.basePrice });

  
  const optionsMap = item.variants.reduce((collector, variant) => {
    Object.entries(variant.attributes).forEach(([key, value]) => {
      collector[key] = collector[key] || [];
      // @ts-ignore
      collector[key].push(value);
    })

    return collector;
  }, {} as Record<string, any[]>);

  const options = Object.entries(optionsMap).reduce((collector, [key, values]: [string, any[]]) => {
    collector.push({
      id: key,
      name: key,
      values: values.filter((value, index, arr) => arr.indexOf(value) === index)
    } as ProductOption);
    return collector;
  }, [] as ProductOption[]);
  
  return {
    id: item.id,
    title: item.name,
    description: item.description,
    descriptionHtml: item.description,
    availableForSale: true, // TODO @cblagg handle stock
    handle: item.id,
    images: item.images.map(reshapeImage),
    featuredImage: images.length ? item.images[0] : null,
    priceRange: {
      minVariantPrice: {
        amount: lowestPrice.value,
        currencyCode: lowestPrice.currency
      },
      maxVariantPrice: {
        amount: highestPrice.value,
        currencyCode: highestPrice.currency,
      }
    },
    options: options,
    tags: item.tags,
    variants: item.variants.map(variant => {
      return {
        id: variant.id,
        sku: variant.sku,
        title: item.name!,
        price: {
          amount: String(variant.pricing.basePrice?.value),
          currencyCode: variant.pricing?.basePrice?.currency
        },
        availableForSale: variant.stock.quantity > 0 || variant.stock.unlimited,
        selectedOptions: Object.entries(variant.attributes ?? {}).map(([name, value]) => ({
          name,
          value
        }))
      }
    }),
    seo: {
      description: item.description,
      title: item.name,
    },
    updatedAt: item.modifiedOn
  };
};

        // @ts-ignore
export async function createCartWithItem({
          // @ts-ignore
  product,
          // @ts-ignore
  merchandiseId,
          // @ts-ignore
  quantity
          // @ts-ignore
}, crumb) {
          // @ts-ignore
  const selectedVariant = product.variants.find(variant => variant.id === merchandiseId);

  const { data } = await fetchSquarespace({
    origin: SQUARESPACE_ADMIN_ORIGIN,
    pathname: '/api/commerce/shopping-cart/entries',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': crumb,
      'cookie': `crumb=${crumb}`
    },
    body: JSON.stringify({
      itemId: product.id,
      sku: selectedVariant.sku,
      quantity,
      additionalFields: JSON.stringify({})
    })
  });

  return data;
}


export async function updateCartWithItem({
          // @ts-ignore
  cartId,
          // @ts-ignore
  product,
          // @ts-ignore
  merchandiseId,
          // @ts-ignore
  quantity
          // @ts-ignore
}, crumb) {
          // @ts-ignore
  const selectedVariant = product.variants.find(variant => variant.id === merchandiseId);

  const { data } = await fetchSquarespace({
    origin: SQUARESPACE_ADMIN_ORIGIN,
    pathname: `/api/3/commerce/cart/${cartId}/items`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': crumb,
      'cookie': `crumb=${crumb}`
    },
    body: JSON.stringify({
      lineItemToAdd: {
        itemId: selectedVariant.sku
      }
    })
  });

  return data;
}



export async function addToCart(
  cartId: string,
  lines: {
    product: Product,
    quantity: number,
    merchandiseId: string,
  }[]
): Promise<Cart> {
  console.log('Add to cart');
  const item = lines[0];

  // @ts-ignore
  const { quantity, merchandiseId, product } = item;

  const crumb = await getCrumb();

  console.log(product, merchandiseId);

  let data;
  // TODO @cblagg implement adding to existing cart
  // if (!cartId || cartId === PLACEHOLDER_CART_ID) {
    data = await createCartWithItem({
      product,
      merchandiseId,
      quantity
    }, crumb)
  /*} else {
    data = await updateCartWithItem({
      cartId,
      product,
      merchandiseId,
      quantity
    }, crumb)
  }*/

          // @ts-ignore
  return reshapeCart(data.shoppingCart);  
}

export async function removeFromCart(lineIds: string[]): Promise<Cart> {
  console.log('Call removeFromCart')

  /*const { removeLineItemsFromCurrentCart } = getWixClient().use(currentCart);*/

  // const { cart } = await removeLineItemsFromCurrentCart(lineIds);
  const cart = {};
        // @ts-ignore
  return reshapeCart(cart!);
}

export async function updateCart(
          // @ts-ignore
  cartId,
          // @ts-ignore
  { id, quantity }
): Promise<Cart> {
  console.log('Call updateCart')

  /*const { updateCurrentCartLineItemQuantity } = getWixClient().use(currentCart);

  const { cart } = await updateCurrentCartLineItemQuantity(
    lines.map(({ id, quantity }) => ({
      id: id,
      quantity
    }))
  );*/
  const cart = {};
        // @ts-ignore
  return reshapeCart(cart!);
}

export async function getCrumb(): Promise<string> {
  const { data } = await fetchSquarespace({
    origin: SQUARESPACE_ADMIN_ORIGIN,
    pathname: '/api/commerce/shopping-cart/entries',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });
        // @ts-ignore
  return data.crumb;
}

export async function getCart(cartId = ''): Promise<Cart | undefined> {
  if (!cartId || cartId === PLACEHOLDER_CART_ID) {
    return {
      id: PLACEHOLDER_CART_ID,
      checkoutUrl: '',
              // @ts-ignore
      cost: {},
      lines: [],
      totalQuantity: 0
    };
  }

  const { data } = await fetchSquarespace({
    origin: SQUARESPACE_ADMIN_ORIGIN,
    pathname: '/api/3/commerce/cart/' + cartId,
  });

  const cart = {
    id: cartId,
            // @ts-ignore
    checkoutUrl: SQUARESPACE_ADMIN_ORIGIN + '/checkout?cartToken=' + data.cartToken,
    cost: {
      subtotalAmount: {
                // @ts-ignore
        amount: data.subtotal.decimalValue,
                // @ts-ignore
        currencyCode: data.subtotal.currencyCode
      },
      totalAmount: {
                // @ts-ignore
        amount: data.grandTotal.decimalValue,
                // @ts-ignore
        currencyCode: data.grandTotal.currencyCode
      },
      totalTaxAmount: {
                // @ts-ignore
        amount: data.taxTotal.decimalValue,
                // @ts-ignore
        currencyCode: data.taxTotal.currencyCode
      }
    },
            // @ts-ignore
    lines: data.items.map(item => {
      return {
        id: item.productId,
        quantity: item.quantity,
        cost: {
          totalAmount: {
            amount: parseFloat(item.itemTotal.decimalValue),
            currencyCode: item.itemTotal.currencyCode
          }
        },
        merchandise: {
          id: item.productId,
          title: item.prodctName,
          selectedOptions: [],
          product: {
            handle: item.productId,
            featuredImage: {
              altText: item.image.title,
              url: item.image.url,
              width: item.image.originalSize.width,
              height: item.image.originalSize.height
            },
            title: item.productName
          } as any as Product,
          url: `/product/${item.itemId}`
        }
      };
    }),
            // @ts-ignore
    totalQuantity: data.items.reduce((acc, item) => {
      return acc + item.quantity;
    }, 0)
  };

  return cart;
}

export async function getCollection(handle: string): Promise<Collection | undefined> {
  return convertTagToCollection(handle);
}

export async function getCollectionProducts({
  collection,
  reverse,
  sortKey
}: {
  collection: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<Product[]> {
  const products = await getProducts({
    filter: (product) => {
      return !!product.tags.find(tag => replaceNonAlphanumeric(tag) === collection);
    },
    sortKey,
    reverse
  });

  return products
}

function sortedProducts(products: Product[], sortKey?: string, reverse?: boolean) {
  if (sortKey === 'PRICE') {
    let sortedProducts = products.sort((a, b) => {
              // @ts-ignore
      return a.priceRange.minVariantPrice.amount - b.priceRange.minVariantPrice.amount
    });

    if (reverse) {
      sortedProducts = sortedProducts.reverse();
    }

    return sortedProducts;
  }

  return products;
}

export async function getCollections(): Promise<Collection[]> {
  const products = await getProducts({});

  const groups = products.reduce((collector, product) => {
    if (product.tags) {
      product.tags.forEach(tag => {
                // @ts-ignore
        if (!collector[tag]) {
                  // @ts-ignore
          collector[tag] = convertTagToCollection(tag) as Collection;
        }
      })
    }
    return collector;
  }, {});

  return Object.values(groups);
}

export async function getMenu(handle: string): Promise<Menu[]> {
  /*const collections = await getCollections();
  console.log('wow', collections);*/
  
  const { data } = await fetchSquarespace<{
    storePages: {
      id: string;
      isEnabled: boolean;
      title: string;
      urlSlug: string;
    }[],
    pagination: Pagination
  }>({
    pathname: '/1.0/commerce/store_pages'
  })

  return [
    ...data.storePages
      .filter(page => page.isEnabled)
      .map(page => ({
        title: page.title,
        path: '/' + page.urlSlug
      })),
      {
        title: 'Search',
        path: '/search'
      }
  ];
}

export async function getPage(handle: string): Promise<Page | undefined> {
  console.log('Call getPage');
  return {} as Page;
}

export async function getPages(): Promise<Page[]> {
  console.log('Call getPages');
  return [];
}

export async function getProduct(handle: string): Promise<Product | undefined> {
  const { data } = await fetchSquarespace<{
    products: Product[]
  }>({
    pathname: `/1.1/commerce/products/${handle}`
  });

  const product = data.products[0];
  if (!product) {
    return undefined;
  }

          // @ts-ignore
  return reshapeProduct(product);
}

export async function getProductRecommendations(): Promise<Product | undefined> {
          // @ts-ignore
  return [];
}

export async function getProducts({
  query,
  reverse,
  sortKey,
  filter = query && query.length ?
    (product: SquarespaceProduct) => fuzzyMatch(product.name, query) :
    null
}: {
  query?: string;
  reverse?: boolean;
  sortKey?: string;
  filter?: ((product: SquarespaceProduct) => boolean) | null;
}): Promise<Product[]> {
  const { data } = await fetchSquarespace<{
    products: SquarespaceProduct[],
    pagination: Pagination
  }>({
    pathname: '/1.0/commerce/products'
  });

  const filteredProducts = filter ?
    data.products.filter(filter) :
    data.products;

            // @ts-ignore
  return sortedProducts(
    // @ts-ignore
    filteredProducts.map(reshapeProduct),
    sortKey,
    reverse
  );
}

async function fetchSquarespace<T>({
  origin = SQUARESPACE_API_URL,
  pathname,
  method = 'GET',
  headers = {
    'Authorization': `Bearer ${SQUARESPACE_API_KEY}`,
  },
  query,
  body
}: {
  pathname: string;
  origin?: string;
  method?: string;
  headers?: {
    [key: string]: string;
  };
  query?: {
    [key: string]: string;
  };
  body?: string
}): Promise<{
  response: Response;
  data: T
}> {
  const queryString = query ?
    `?${new URLSearchParams(query)}` : '';
  
  const requestUrl = `${origin}${pathname}${queryString}`;

  const response = await fetch(requestUrl, {
    method,
    headers,
    body
  });

  const data = await response.json();

  return {
    response,
    data
  } as {
    response: Response;
    data: T
  }
};


export async function revalidate(req: NextRequest): Promise<NextResponse> {
  /*const collectionWebhooks = ['collections/create', 'collections/delete', 'collections/update'];
  const productWebhooks = ['products/create', 'products/delete', 'products/update'];
  const topic = (await headers()).get('x-shopify-topic') || 'unknown';
  const secret = req.nextUrl.searchParams.get('secret');
  const isCollectionUpdate = collectionWebhooks.includes(topic);
  const isProductUpdate = productWebhooks.includes(topic);

  if (!secret || secret !== process.env.SHOPIFY_REVALIDATION_SECRET) {
    console.error('Invalid revalidation secret.');
    return NextResponse.json({ status: 200 });
  }

  if (!isCollectionUpdate && !isProductUpdate) {
    // We don't need to revalidate anything for any other topics.
    return NextResponse.json({ status: 200 });
  }

  if (isCollectionUpdate) {
    revalidateTag(TAGS.collections);
  }

  if (isProductUpdate) {
    revalidateTag(TAGS.products);
  }*/

  return NextResponse.json({ status: 200, revalidated: true, now: Date.now() });
}