import type { SquarespaceConfig } from '../'

import { GetAllPagesOperation } from '@commerce/types/page'

export type Page = { url: string }
export type GetAllPagesResult = { pages: Page[] }

export default function getAllPagesOperation() {
  async function getAllPages<T extends GetAllPagesOperation>({
    config,
    preview,
  }: {
    url?: string
    config?: Partial<SquarespaceConfig>
    preview?: boolean
  } = {}): Promise<T['data']> {
    return Promise.resolve({
      pages: [],
    })
  }
  return getAllPages
}
