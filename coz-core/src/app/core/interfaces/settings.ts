import { User } from './user.interface';
import { Order } from './order.interface';

export interface AdminUserResponse {
  message: string;
  data: User;
}

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

export interface UpdateUserRolePayload {
  role: 'user' | 'admin';
}

export interface Review {
  _id: string;
  content: string;
  rating: number;
  status: 'pending' | 'approved' | 'rejected';
  reviewerName: string;
  product: {
    _id: string;
    name: string;
    name_ar:string;
    slug: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AdminReviewListResponse {
  message: string;
  data: Review[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalReviews: number;
    limit: number;
  };
}

export interface AdminReviewStatusResponse {
  message: string;
  data: Review;
}

export interface UpdateReviewStatusPayload {
  status: 'approved' | 'rejected';
}

export interface Faq {
  _id: string;
  question: string;
  question_ar: string;
  answer: string;
  answer_ar: string;
  category: 'general' | 'shipping' | 'returns' | 'payment' | 'products';
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminFaqListResponse {
  message: string;
  data: Faq[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalFaqs: number;
    limit: number;
  };
}

export interface AdminFaqResponse {
  message: string;
  data: Faq;
}

export interface CreateFaqPayload {
  question: string;
  question_ar: string;
  answer: string;
  answer_ar: string;
  category: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateFaqPayload extends Partial<CreateFaqPayload> { }

export interface ContactInfo {
  phone: string;
  email: string;
  instagram: string;
}

export interface ContactInfoResponse {
  message?: string,
  data: ContactInfo
}
export interface AboutInfo {
  title: string;
  title_ar?: string;
  description: string;
  description_ar?: string;
}

export interface AboutResponse {
  message?: string,
  data: AboutInfo
}
export interface OrderGuideImage {
  url: string;
  publicId: string;
  displayOrder?: number;
}
export interface OrderGuide {
  images: OrderGuideImage[];
}

export interface OrderGuideResponse {
  message?: string,
  data: OrderGuide
}

export interface TermItem {
  title: string;
  title_ar?: string;
  content: string;
  content_ar?: string;
}

export interface TermsInfo {
  terms: TermItem[];
}

export interface TermsInfoResponse {
  message?: string,
  data: TermItem[]
}

export interface FeaturedReview {
  _id: string;
  review: Review;
  displayOrder: number;
  isActive: boolean;
}

export interface FeaturedReviewResponse {
  message: string;
  data: FeaturedReview[];
}

export interface AddFeaturedReviewPayload {
  reviewId: string;
  displayOrder?: number;
}

export interface ReorderFeaturedReviewsPayload {
  orders: { id: string; order: number }[];
}


export interface ContactForm {
  name: string,
  email: string,
  subject: string,
  message: string
}



export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalProducts: number;
  pendingReviews: number;
}

export interface SalesOverTimeItem {
  date: string;
  count: number;
  revenue: number;
}

export interface TopProductItem {
  name: string;
  totalSold: number;
  price: number;
}

export interface DashboardData {
  stats: DashboardStats;
  salesOverTime: SalesOverTimeItem[];
  recentOrders: Order[];
  topProducts: TopProductItem[];
  recentReviews: Review[];
}

export interface AttributeItem {
  name: string;
  name_ar?: string;
}


export interface ColorItem {
  name: string;
  name_ar?: string;
  code: string;
}


export interface ProductAttributes {
  productTypes: AttributeItem[];
  collectionTypes: AttributeItem[];
  colors: ColorItem[];
  sizes: string[];
}

export interface AttributesResponse {
  success?: boolean;
  message: string;
  data: ProductAttributes;
}
