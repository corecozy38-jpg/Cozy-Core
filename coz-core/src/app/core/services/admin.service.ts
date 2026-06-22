import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AdminProductRequest, FeaturedReviewResponse, ReviewsResponse } from '../interfaces/product.interface';
import { Observable } from 'rxjs';
import { AdminProductResponse, AdminUserListResponse, AdminUserResponse, AdminVariantListResponse, AdminVariantResponse, FaqListResponse, FaqResponse, SiteSettings, SiteSettingsResponse, UploadImageResponse, UploadMultipleImagesResponse } from '../interfaces/admin.interface';
import { Faq } from '../interfaces/admin.interface';
import { Products } from '../../features/products/products';
import { AboutInfo, AboutResponse, AdminReviewListResponse, AdminReviewStatusResponse, ContactInfo, ContactInfoResponse, DashboardData, OrderGuide, OrderGuideResponse, TermsInfo, TermsInfoResponse } from '../interfaces/settings';
import { AdminOrdersListResponse, UpdateOrderStatusResponse } from '../interfaces/order.interface';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private baseUrl = environment.apiUrl;

  constructor(private _http: HttpClient) { }

  //PRODUCTS

  createProduct(productData: AdminProductRequest): Observable<AdminProductRequest> {
    return this._http.post<AdminProductRequest>(`${this.baseUrl}/admin/products`, productData);
  }

  updateProduct(slug: string, productData: Partial<AdminProductRequest>): Observable<AdminProductRequest> {
    return this._http.put<AdminProductRequest>(`${this.baseUrl}/admin/products/slug/${slug}`, productData);
  }

  deleteProduct(slug: string): Observable<{ message: string }> {
    return this._http.delete<{ message: string }>(`${this.baseUrl}/admin/products/slug/${slug}`);
  }

  updateVariantSizeStock(variantId: string, sizeName: string, data: { stock?: number; sku?: string }): Observable<AdminVariantResponse> {
    return this._http.put<AdminVariantResponse>(
      `${this.baseUrl}/admin/variants/${variantId}/sizes/${sizeName}`,
      data
    );
  }



  // IMAGES
  uploadImage(formData: FormData): Observable<UploadImageResponse> {
    return this._http.post<UploadImageResponse>(`${this.baseUrl}/admin/upload/image`, formData);
  }

  uploadMultipleImages(formData: FormData): Observable<UploadMultipleImagesResponse> {
    return this._http.post<UploadMultipleImagesResponse>(`${this.baseUrl}/admin/upload/images`, formData);
  }



  // REVIEWS
  updateReviewStatus(reviewId: string, status: 'approved' | 'rejected'): Observable<AdminReviewStatusResponse> {
    return this._http.put<AdminReviewStatusResponse>(
      `${this.baseUrl}/admin/reviews/${reviewId}/status`,
      { status }
    );
  }

  deleteReview(reviewId: string): Observable<{ message: string }> {
    return this._http.delete<{ message: string }>(`${this.baseUrl}/admin/reviews/${reviewId}`);
  }

  addFeaturedReview(reviewId: string): Observable<{ data: any }> {
    return this._http.post<{ data: any }>(`${this.baseUrl}/featured-reviews/${reviewId}`, {});
  }

  removeFeaturedReview(featuredId: string): Observable<{ message: string }> {
    return this._http.delete<{ message: string }>(`${this.baseUrl}/featured-reviews/${featuredId}`);
  }

  getAllReviews(status?: string, isFeatured?: boolean): Observable<AdminReviewListResponse> {
    let params = new HttpParams();
    if (status && status !== 'all') {
      params = params.set('status', status);
    }
    if (isFeatured) {
      params = params.set('isFeatured', 'true');
    }
    return this._http.get<AdminReviewListResponse>(`${this.baseUrl}/admin/reviews/all`, { params });
  }



  // USERS
  getUsers(params?: { page?: number; limit?: number; search?: string }): Observable<AdminUserListResponse> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this._http.get<AdminUserListResponse>(`${this.baseUrl}/user/admin`, { params: httpParams });
  }

  getUserById(userId: string): Observable<AdminUserResponse> {
    return this._http.get<AdminUserResponse>(`${this.baseUrl}/user/admin/${userId}`);
  }

  updateUserRole(userId: string, role: 'user' | 'admin'): Observable<AdminUserResponse> {
    return this._http.put<AdminUserResponse>(
      `${this.baseUrl}/user/admin/${userId}/role`,
      { role }
    );
  }

  deleteUser(userId: string): Observable<{ message: string }> {
    return this._http.delete<{ message: string }>(`${this.baseUrl}/user/admin/${userId}`);
  }





  // FAQS
  getFaqs(params?: { page?: number; limit?: number; }): Observable<FaqListResponse> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this._http.get<FaqListResponse>(`${this.baseUrl}/admin/settings/faqs`, { params: httpParams });
  }

  createFaq(faqData: Partial<Faq>): Observable<FaqResponse> {
    return this._http.post<FaqResponse>(`${this.baseUrl}/admin/settings/faq`, faqData);
  }

  updateFaq(faqId: string, faqData: Partial<Faq>): Observable<FaqResponse> {
    return this._http.put<FaqResponse>(`${this.baseUrl}/admin/settings/faq/${faqId}`, faqData);
  }

  deleteFaq(faqId: string): Observable<{ message: string }> {
    return this._http.delete<{ message: string }>(`${this.baseUrl}/admin/settings/faq/${faqId}`);
  }




  // ABOUT
  updateAboutInfo(body: AboutInfo): Observable<AboutResponse> {
    return this._http.put<AboutResponse>(`${this.baseUrl}/admin/settings/about`, body);
  }


  // TERMS AND CONDITIONS
  updateTermsAndConditions(body: TermsInfo): Observable<TermsInfoResponse> {
    return this._http.put<TermsInfoResponse>(`${this.baseUrl}/admin/settings/terms`, body);
  }


  // CONTACT
  updateContactInfo(body: ContactInfo): Observable<ContactInfoResponse> {
    return this._http.put<ContactInfoResponse>(`${this.baseUrl}/admin/settings/contact`, body);
  }



  // ORDER GUIDE
  updateOrderGuide(body: OrderGuide): Observable<OrderGuideResponse> {
    return this._http.put<OrderGuideResponse>(`${this.baseUrl}/admin/settings/order-guide`, body);
  }

  deleteOrderGuideImage(publicId: string): Observable<OrderGuideResponse> {
    return this._http.delete<OrderGuideResponse>(`${this.baseUrl}/admin/settings/order-guide${publicId}`);
  }

  getDashboard(): Observable<{ message: string; data: DashboardData }> {
    return this._http.get<{ message: string; data: DashboardData }>(`${this.baseUrl}/admin/settings/dashboard`);
  }

  // ORDERS
  getAllOrdersForAdmin(page: number = 1, limit: number = 10, status: string = 'all'): Observable<AdminOrdersListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    if (status !== 'all') params = params.set('status', status);
    return this._http.get<AdminOrdersListResponse>(`${this.baseUrl}/admin/settings/orders`, { params });
  }

  updateOrderStatus(orderId: string, status: string): Observable<UpdateOrderStatusResponse> {
    return this._http.put<UpdateOrderStatusResponse>(`${this.baseUrl}/admin/settings/orders/${orderId}/status`, { status });
  }

}
