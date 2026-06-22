export interface Image {
  url: string;
  publicId: string | null;
}

export interface Size {
  size: string;
  stock: number;
  sku: string;
}

export interface Variant {
  _id?: string;
  colorName: string;
  colorName_ar?: string;
  colorCode?: string | null;
  images: Image[];
  sizes: Size[];
}

export interface Product {
  _id: string;
  name: string;
  name_ar?: string;
  slug: string;
  productType: string;
  collection: string;
  features: string[];
  features_ar?: string[];
  sizeGuid_ar?:{
    description?: string;
    description_ar?: string;
    image: Image | null;
  } | null;
  sizeFit: {
    fitType: string;
    modelHeight?: number | null;
    wearingSize?: string;
  };
  sizeFit_ar?: {
    fitType?: string;
    modelHeight?: number;
    wearingSize?: string;
  };
  sizeGuid: {
    description?: string;
    description_ar?: string;
    image: Image | null;
  } | null;
  price: number;
  compareAtPrice?: number | null;
  rating: number;
  reviewsCount: number;
  createdAt: string;
  variants: Variant[];
  isNew?: boolean;
  isOnSale?: boolean;
  isSoldOut?: boolean;
  minPrice?: number;
  hasStock?: boolean;
  discountPercent?: number;
}

export interface Pagination {
  currentPage: number;
  limit: number;
  totalProducts: number;
  totalPages: number;
}

export interface ProductsResponse {
  message?: string;
  data: Product[];
  pagination: Pagination;
}

export interface Review {
  _id: string;
  content: string;
  rating: number;
  images?: { url: string; publicId: string }[];
  user?: {
    _id: string;
    fullName: string;
    email?: string;
  } | null;
  guestName?: string | null;
  guestEmail?: string | null;
  product?: {
    _id: string;
    name: string;
    slug: string;
  } | null;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewerName?: string; 
}

export interface CreateReviewPayload {
  content: string;
  rating: number;
  images?: { url: string; publicId: string }[];
  guestName?: string;
  guestEmail?: string;
}

export interface AdaptedProduct {
  id: string;
  name: string;
  name_ar?: string;
  slug: string;
  price: number;
  oldPrice: number | null;
  rating: number;
  reviewsCount: number;
  isNew: boolean;
  discountPercent: number;
  colors: {
    name: string;
    code: string;
    image: string;
    hoverImage: string
  }[];
}

export interface reviewsPagination{
  currentPage: number;
  limit: number;
  totalReviews: number;
  totalPages: number;
}
export interface ReviewsResponse {
  message?: string;
  data: Review[];
  pagination: reviewsPagination;
}

export interface FeaturedReview {
  _id: string;
  rating: number;
  content: string;
  reviewerName: string;
  productName: string;
  reviewId?: string | null;
}

export interface FeaturedReviewResponse {
  message: string;
  data: FeaturedReview[]
}
export interface FeaturedReviewDocument {
  _id: string;
  review: string;        
  isActive: boolean;
  addedBy: string;     
  createdAt: string;
  updatedAt: string;
}

export interface FeaturedReviewDocumentResponse {
  message: string;
  data: FeaturedReviewDocument
}
export interface ApiResponse<T> {
  message: string;
  data: T;
}

export interface AdminProductRequest {
  name: string;
  productType: string;
  collection: string;
  features: string[];
  price: number;
  compareAtPrice?: number | null;
  sizeFit: {
    fitType: string;
    modelHeight?: number | null;
    wearingSize?: string;
  };
  sizeGuid?: {
    description?: string | null;
    image?: Image | null;
  }|null;
  variants: {
    colorName: string;
    colorCode?: string | null;
    images: Image[];
    sizes: {
      size: string;
      stock: number;
      sku?: string;
    }[];
  }[];
}
