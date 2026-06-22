
import { Product, Variant } from './product.interface';
import { Order } from './order.interface';
// import { Review } from './review.interface';
import { User } from './user.interface';


export interface AdminProductResponse {
  message: string;
  data: Product;
}

export interface AdminVariantResponse {
  message: string;
  data: Variant;
}

export interface AdminVariantListResponse {
  message: string;
  data: Variant[];
}

export interface AdminOrderListResponse {
  success: boolean;
  message: string;
  data: Order[];
  pagination: {
    currentPage: number;
    totalOrders: number;
    totalPages: number;
    limit: number;
  };
}

// export interface AdminReviewListResponse {
//   message: string;
//   data: Review[];
//   pagination?: {
//     currentPage: number;
//     totalPages: number;
//     totalReviews: number;
//     limit: number;
//   };
// }

// export interface AdminReviewStatusResponse {
//   message: string;
//   data: Review;
// }

export interface AdminUserListResponse {
  message: string;
  data: User[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalUsers: number;
    limit: number;
  };
}

export interface AdminUserResponse {
  message: string;
  data: User;
}

export interface UploadImageResponse {
  message: string;
  data: {
    url: string;
    publicId: string;
  };
}

export interface UploadMultipleImagesResponse {
  message: string;
  data: { url: string; publicId: string }[];
  errors?: string[];
}

export interface SiteSettings {
  hero: {
    title: string;
    title_ar: string;
    subtitle: string;
    subtitle_ar: string;
    buttonText: string;
    buttonText_ar: string;
    buttonLink: string;
    imageUrl: string;
    isActive: boolean;
  };
  about: {
    title: string;
    title_ar: string;
    content: string;
    content_ar: string;
    imageUrl: string;
    mission: string;
    vision: string;
  };
  contact: {
    email: string;
    phone: string;
    whatsapp: string;
    address: string;
    address_ar: string;
    workingHours: string;
    mapEmbedUrl: string;
  };
  privacyPolicy: {
    content: string;
    content_ar: string;
    lastUpdated: string;
  };
  termsAndConditions: {
    content: string;
    content_ar: string;
    lastUpdated: string;
  };
  socialLinks: {
    facebook: string;
    instagram: string;
    twitter: string;
    tiktok: string;
    youtube: string;
    linkedin: string;
  };
  general: {
    siteName: string;
    siteName_ar: string;
    logo: string;
    favicon: string;
    metaDescription: string;
    metaKeywords: string[];
  };
}

export interface SiteSettingsResponse {
  message: string;
  data: SiteSettings;
}

export interface Faq {
  _id?: string;
  question: string;
  question_ar: string;
  answer: string;
  answer_ar: string;
  category: string;
}

export interface FaqListResponse {
  message: string;
  data: Faq[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalFaqs: number;
    limit: number;
  };
}

export interface FaqResponse {
  message: string;
  data: Faq;
}
