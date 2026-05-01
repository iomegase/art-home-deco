export type SanityImage = {
  _type: "image";
  asset?: {
    _ref: string;
    _type: "reference";
  };
  alt?: string;
};

export type ProductCategory = {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  image?: SanityImage;
  seoTitle?: string;
  seoDescription?: string;
  order?: number;
  isFeatured?: boolean;
};

export type Product = {
  _id: string;
  title: string;
  slug: string;
  sku: string;
  shortDescription?: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  stockStatus: "in_stock" | "low_stock" | "out_of_stock";
  stockQuantity?: number;
  images?: SanityImage[];
  category?: ProductCategory;
  material?: string;
  dimensions?: string;
  color?: string;
  style?: string;
  room?: string;
  careInstructions?: string;
  tags?: string[];
  isFeatured?: boolean;
  stripePriceId?: string;
  seoTitle?: string;
  seoDescription?: string;
  imageAltBase?: string;
  aiStatus?: "none" | "draft_generated" | "reviewed";
};

export type BlogPost = {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: unknown[];
  image?: SanityImage;
  category?: string;
  relatedProducts?: Pick<Product, "_id" | "title" | "slug">[];
  relatedCategories?: Pick<ProductCategory, "_id" | "title" | "slug">[];
  seoTitle?: string;
  seoDescription?: string;
  generatedWithAI?: boolean;
  reviewedByHuman?: boolean;
  publishedAt?: string;
};
