import { handler as useCart } from './cart/use-cart'
import { handler as useAddCartItem } from './cart/use-add-item'
import { handler as useUpdateCartItem } from './cart/use-update-item'
import { handler as useRemoveCartItem } from './cart/use-remove-item'

import { handler as useCustomer } from './customer/use-customer'
import { handler as useSearch } from './product/use-search'

import { handler as useLogin } from './auth/use-login'
import { handler as useLogout } from './auth/use-logout'
import { handler as useSignup } from './auth/use-signup'

import { handler as useCards } from './customer/card/use-cards'
import { handler as useAddCardItem } from './customer/card/use-add-item'
import { handler as useUpdateCardItem } from './customer/card/use-update-item'
import { handler as useRemoveCardItem } from './customer/card/use-remove-item'

import { handler as useAddresses } from './customer/address/use-addresses'
import { handler as useAddAddressItem } from './customer/address/use-add-item'
import { handler as useUpdateAddressItem } from './customer/address/use-update-item'
import { handler as useRemoveAddressItem } from './customer/address/use-remove-item'

import { STORE_DOMAIN } from './const'
import { fetcher } from './fetcher'

export const squarespaceProvider = {
  locale: 'en-US',
  storeDomain: STORE_DOMAIN,
  cartCookie: '',
  fetcher,
  cart: {
    useCart,
    useAddItem: useAddCartItem,
    useUpdateItem: useUpdateCartItem,
    useRemoveItem: useRemoveCartItem
  },
  customer: {
    useCustomer,
    card: {
      useCards,
      useAddItem: useAddCardItem,
      useUpdateItem: useUpdateCardItem,
      useRemoveItem: useRemoveCardItem
    },
    address: {
      useAddresses,
      useAddItem: useAddAddressItem,
      useUpdateItem: useUpdateAddressItem,
      useRemoveItem: useRemoveAddressItem
    }
  },
  products: { useSearch },
  auth: { useLogin, useLogout, useSignup },
}

export type SquarespaceProvider = typeof squarespaceProvider
