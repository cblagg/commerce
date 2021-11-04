import {
  CommerceAPI,
  CommerceAPIConfig,
  getCommerceApi as commerceApi,
} from '@commerce/api'

import {
  API_URL,
  API_TOKEN,
} from '../const'

import fetchSquarespaceGraphQLApi from './utils/fetch-graphql';
import fetchSquarespaceRestApi from './utils/fetch-rest';
import * as operations from './operations';

export * from './operations';

export interface SquarespaceConfig extends CommerceAPIConfig {
  fetchRest: typeof fetchSquarespaceRestApi
}

const ONE_DAY = 60 * 60 * 24

const config: SquarespaceConfig = {
  apiToken: API_TOKEN,
  commerceUrl: API_URL,
  cartCookieMaxAge: ONE_DAY * 30,
  fetch: fetchSquarespaceGraphQLApi(() => getCommerceApi().getConfig()),
  fetchRest: fetchSquarespaceRestApi
};

export const provider = { config, operations }

export type Provider = typeof provider
export type SquarespaceAPI<P extends Provider = Provider> = CommerceAPI<P | any>

export function getCommerceApi<P extends Provider>(
  customProvider: P = provider as any
): SquarespaceAPI<P> {
  return commerceApi(customProvider as any)
}
