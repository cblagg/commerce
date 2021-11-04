export interface Price {
  currency: string;
  value: string;
}

export interface Image {
  id: string;
  title: string;
  url: string;
  originalSize: {
    width: number;
    height: number;
  };
  availableFormats: string[]
}

export interface RawVariant {
  id: string;
  sku: string;
  pricing: {
    basePrice: Price;
    salePrice: Price;
    onSale: boolean;
  };
  stock: {
    quantity: number;
    unlimited: boolean;
  };
  attributes: {
    [attribute: string]: string;
  };
  shippingMeasurements: {
    weight: {
      unit: 'POUND' | 'KILOGRAM';
      value: number;
    };
    dimensions: {
      unit: 'INCH' | 'CENTIMETER';
      length: number;
      width: number;
      height: number;
    }
  }
  image: Image
}

export interface RawProduct {
  id: string;
  type: 'PHYSICAL';
  storePageId: string;
  name: string;
  description: string;
  url: string;
  urlSlug: string;
  tags: string[];
  isVisible: boolean;
  seoOptions: {
    title: string;
    description: string;
  };
  variantAttributes: string[];
  variants: RawVariant[];
  images: Image[];
  createdOn: string;
  modifiedOn: string;
}