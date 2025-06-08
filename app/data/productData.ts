export interface Product {
  code: string;
  product_name: string;
  brands: string;
  ingredients_text: string;
  image_url?: string;
  nutriments?: {
    [key: string]: any;
  };
  categories?: string;
}