import PriceSelector from 'components/price-selector';
import { getCollection, getCollectionProducts } from 'lib/squarespace';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import Grid from 'components/grid';
import ProductGridItems from 'components/layout/product-grid-items';
import { defaultSort, sorting } from 'lib/constants';

export async function generateMetadata(props: {
  params: Promise<{ collection: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const collection = await getCollection(params.collection);

  if (!collection) return notFound();

  return {
    title: collection.seo?.title || collection.title,
    description:
      collection.seo?.description || collection.description || `${collection.title} products`
  };
}

export default async function CategoryPage(props: {
  params: Promise<{ collection: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const { sort, min: minimumPrice, max: maximumPrice } = searchParams as { [key: string]: string };
  const { sortKey, reverse } = sorting.find((item) => item.slug === sort) || defaultSort;
  const allCollectionProducts = await getCollectionProducts({ collection: params.collection, sortKey, reverse });

  const products = allCollectionProducts.filter((item) => {
    if (!minimumPrice && !maximumPrice) {
      return true;
    }

    const minimumPriceNum = minimumPrice ? parseFloat(minimumPrice) : 0;
    const maximumPriceNum = maximumPrice ? parseFloat(maximumPrice) : Infinity;
    // @ts-ignore
    const price = parseFloat(item.priceRange.minVariantPrice.amount);
    return price >= minimumPriceNum && price <= maximumPriceNum;
  });

  return (
    <section>
       <div className="hidden text-s text-neutral-0 md:block dark:text-neutral-0">
          <h3 className="hidden text-xs text-neutral-500 md:block dark:text-neutral-400">
            Filters
          </h3>
          <PriceSelector
            label="Min price"
            param="min"
            // @ts-ignore
            minimumValue={minimumPrice || 0}
            // @ts-ignore
            maximumValue={maximumPrice || Infinity}
                     // @ts-ignore
            value={minimumPrice || 0}
          />
          <PriceSelector
            label="Max price"
            param="max"
                        // @ts-ignore
            minimumValue={minimumPrice || 0}
                        // @ts-ignore
            maximumValue={maximumPrice || Infinity}
                        // @ts-ignore
            value={maximumPrice || Infinity}
          />
        </div>
        <div className="mt-2">
        {products.length === 0 ? (
          <p className="py-3 text-lg">{`No products found in this collection`}</p>
        ) : (
          <Grid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <ProductGridItems products={products} />
          </Grid>
        )}
      </div>
    </section>
  );
}
