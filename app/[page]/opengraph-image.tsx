import OpengraphImage from 'components/opengraph-image';
import { getPage } from 'lib/squarespace';

export const runtime = 'edge';

export default async function Image({ params }: { params: { page: string } }) {
  const page = await getPage(params.page);
          // @ts-ignore
  const title = page.seo?.title || page.title;

  return await OpengraphImage({ title });
}
