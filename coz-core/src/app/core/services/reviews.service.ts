import { FeaturedReview } from './../interfaces/settings';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CreateReviewPayload,FeaturedReviewDocumentResponse,FeaturedReviewResponse,Review, ReviewsResponse } from '../interfaces/product.interface';
import { environment } from '../../../environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReviewsService {
  private baseUrl = environment.apiUrl;
  constructor(private _http: HttpClient) { }



  createReview(productId: string, payload: CreateReviewPayload): Observable<{ message: string; data: Review }> {
    return this._http.post<{ message: string; data: Review }>(
      `${this.baseUrl}/reviews/product/${productId}`,
      payload
    );
  }
  getFeaturedReviews(): Observable<FeaturedReviewResponse> {
    return this._http.get<FeaturedReviewResponse>(`${this.baseUrl}/featured-reviews`);
  }

  getProductReviews(productId: string, page: number = 1, limit: number = 10): Observable<ReviewsResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this._http.get<ReviewsResponse>(`${this.baseUrl}/reviews/product/${productId}`, { params });
  }
}
