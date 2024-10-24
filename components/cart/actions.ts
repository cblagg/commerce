'use server';

import { TAGS } from 'lib/constants';
import { addToCart, createCart, getCart, removeFromCart, updateCart } from 'lib/squarespace';
import type { Product } from 'lib/squarespace/types';
import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';


export async function addItem(prevState: any, {
  selectedVariantId,
  product,
}: {
  selectedVariantId: string | undefined;
  product: Product;
}) {  
  let cartId = (await cookies()).get('cartId')?.value;

  if (!cartId || !selectedVariantId) {
    return 'Error adding item to cart';
  }

  try {
    const newCart = await addToCart(cartId, [{
      merchandiseId: selectedVariantId,
      quantity: 1,
      product,
    }]);
    // @ts-ignore
    (await cookies()).set('cartId', newCart.id)
    revalidateTag(TAGS.cart);
  } catch (e) {
    return 'Error adding item to cart';
  }
}

export async function removeItem(prevState: any, merchandiseId: string) {
  console.log('removeItem')

  let cartId = (await cookies()).get('cartId')?.value;

  if (!cartId) {
    return 'Missing cart ID';
  }

  try {
    const cart = await getCart(cartId);

    if (!cart) {
      return 'Error fetching cart';
    }

    const lineItem = cart.lines.find((line) => line.merchandise.id === merchandiseId);

    if (lineItem && lineItem.id) {
      // @ts-ignore
      await removeFromCart(cartId, [lineItem.id]);
      revalidateTag(TAGS.cart);
    } else {
      return 'Item not found in cart';
    }
  } catch (e) {
    return 'Error removing item from cart';
  }
}

export async function updateItemQuantity(
  prevState: any,
  payload: {
    merchandiseId: string;
    quantity: number;
  }
) {
  console.log('updateItemQuantity')

  let cartId = (await cookies()).get('cartId')?.value;

  if (!cartId) {
    return 'Missing cart ID';
  }

  const { merchandiseId, quantity } = payload;

  try {
    const cart = await getCart(cartId);

    if (!cart) {
      return 'Error fetching cart';
    }

    const lineItem = cart.lines.find((line) => line.merchandise.id === merchandiseId);

    if (lineItem && lineItem.id) {
      if (quantity === 0) {
        // @ts-ignore
        await removeFromCart(cartId, [lineItem.id]);
      } else {
                // @ts-ignore
        await updateCart(cartId, [
          {
            id: lineItem.id,
            merchandiseId,
            quantity
          }
        ]);
      }
    } else if (quantity > 0) {
      // If the item doesn't exist in the cart and quantity > 0, add it
              // @ts-ignore

      await addToCart(cartId, [{ merchandiseId, quantity }]);
    }

    revalidateTag(TAGS.cart);
  } catch (e) {
    console.error(e);
    return 'Error updating item quantity';
  }
}

export async function redirectToCheckout() {
  let cartId = (await cookies()).get('cartId')?.value;

  if (!cartId) {
    return 'Missing cart ID';
  }

  let cart = await getCart(cartId);

  if (!cart) {
    return 'Error fetching cart';
  }

  redirect(cart.checkoutUrl);
}

export async function createCartAndSetCookie() {
  const existingCookieCartId = (await cookies()).get('cartId')?.value;
        // @ts-ignore

  let cart = await createCart(existingCookieCartId);
  (await cookies()).set('cartId', cart.id!);
}
