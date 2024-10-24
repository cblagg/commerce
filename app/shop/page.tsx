import Grid from 'components/grid';
import ProductGridItems from 'components/layout/product-grid-items';
import PriceSelector from 'components/price-selector';
import { defaultSort, sorting } from 'lib/constants';
import { getProducts } from 'lib/squarespace';

export default async function SearchPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const { sort, min: minimumPrice, max: maximumPrice } = searchParams as { [key: string]: string };
  const { sortKey, reverse } = sorting.find((item) => item.slug === sort) || defaultSort;

  const products = await getProducts({
    filter: (item) => {
      if (!minimumPrice && !maximumPrice) {
        return true;
      }

      const minimumPriceNum = minimumPrice ? parseFloat(minimumPrice) : 0;
      const maximumPriceNum = maximumPrice ? parseFloat(maximumPrice) : Infinity;
      // @ts-ignore
      const price = parseFloat(item.variants[0]?.pricing.basePrice.value);
      return price >= minimumPriceNum && price <= maximumPriceNum;
    },
    sortKey,
    reverse
  });

  return (
    <>
      <div className="hidden text-s text-neutral-0 md:block dark:text-neutral-0">
        <h3 className="hidden text-xs text-neutral-500 md:block dark:text-neutral-400">
          Filters
        </h3>
        <PriceSelector
          label="Min price"
          param="min"
          minimumValue={minimumPrice || 0}
          maximumValue={maximumPrice || Infinity}
          value={minimumPrice || 0}
        />
        <PriceSelector
          label="Max price"
          param="max"
          minimumValue={minimumPrice || 0}
          maximumValue={maximumPrice || Infinity}
          value={maximumPrice || Infinity}
        />
      </div>
      <div className="mt-2">
      {products.length > 0 ? (
        <Grid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <ProductGridItems products={products} />
        </Grid>
      ) : null}
      </div>
    </>
  );
}
