export type Pagination = {
  nextPageUrl: string | null;
  nextPageCursor: string | null;
  hasNextPage: boolean;
};

export type SEO = {
  title: string;
  description: string;
};

export type SquarespaceProductImage = {
  id: string;
  altText: string;
  orderIndex: number;
  url: string;
  originalSize: {
    width: number;
    height: number;
    availableFormats: string[]
  }
};

export type Collection = {
  handle: string;
  title: string;
  description: string;
  seo: SEO;
  updatedAt: string;
  path: string;
};

export type ProductTag = string;
export type VariantAttribute = string;
export type SquarespacePrice = {
  value: string;
  currency: string;
};
export type SquarespaceVariant = {
  attributes: {
    [key: string]: unknown;
  };
  id: string;
  image: null | SquarespaceProductImage;
  pricing: {
    basePrice: SquarespacePrice;
    onSale: boolean;
    salePrice: SquarespacePrice;
  };
  shippingMeasurements: {
    weight: {
      unit: string;
      value: number;
    },
    dimensions: {
      unit: string;
      length: number;
      width: number;
      height: number;
    }
  };
  sku: string;
  stock: {
    quantity: number;
    unlimited: boolean;
  }
};
export type IsoTimeStamp = string;

export type SquarespaceProduct = {
  id: string;
  type: string;
  storePageId: string;
  name: string;
  description: string;
  url: string;
  urlSlug: string;
  images: SquarespaceProductImage[]
  tags: ProductTag[];
  isVisible: boolean;
  variantAttributes: VariantAttribute[];
  variants: SquarespaceVariant[];
  seoOptions: null | string;
  createdOn: IsoTimeStamp;
  modifiedOn: IsoTimeStamp;
  pricing: null;
  digitalGood: null;
}

export type ProductOption = {
  id?: string;
  name: string;
  values: string[];
};

/*export type Maybe<T> = T | null;

export type Connection<T> = {
  edges: Array<Edge<T>>;
};

export type Edge<T> = {
  node: T;
};

export type Cart = {
  id?: string;
  checkoutUrl: string;
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
    totalTaxAmount: Money;
  };
  lines: CartItem[];
  totalQuantity: number;
};

export type CartProduct = {
  id: string;
  handle: string;
  title: string;
  featuredImage: Image;
};

export type CartItem = {
  id: string;
  quantity: number;
  cost: {
    totalAmount: Money;
  };
  merchandise: {
    id: string;
    title: string;
    selectedOptions: {
      name: string;
      value: string;
    }[];
    product: CartProduct;
  };
};

export type Collection = {
  handle: string;
  title: string;
  description: string;
  seo: SEO;
  updatedAt: string;
  path: string;
};

export type Image = {
  url: string;
  altText: string;
  width: number;
  height: number;
};

export type Menu = {
  title: string;
  path: string;
};

export type Money = {
  amount: string;
  currencyCode: string;
};

export type Page = {
  id: string;
  title: string;
  handle: string;
  body: string;
  bodySummary: string;
  seo?: SEO;
  createdAt: string;
  updatedAt: string;
};

export type Product = {
  id: string;
  handle: string;
  availableForSale: boolean;
  title: string;
  description: string;
  descriptionHtml: string;
  options: ProductOption[];
  priceRange: {
    maxVariantPrice: Money;
    minVariantPrice: Money;
  };
  featuredImage: Image;
  seo: SEO;
  tags: string[];
  updatedAt: string;
  variants: ProductVariant[];
  images: Image[];
};

export type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: {
    name: string;
    value: string;
  }[];
  price: Money;
};

export type SEO = {
  title: string;
  description: string;
};*/