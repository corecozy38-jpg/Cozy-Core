import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import {  Product, ProductsResponse } from '../interfaces/product.interface';
import { environment } from '../../../environments/environment.development';
@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private baseUrl = environment.apiUrl;
  constructor(private _http: HttpClient) { }

  getProducts(params?: any): Observable<ProductsResponse> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          if (Array.isArray(params[key])) {
            params[key].forEach(value => httpParams = httpParams.append(key, value));
          } else {
            httpParams = httpParams.set(key, params[key]);
          }
        }
      });
    }
    return this._http.get<ProductsResponse>(`${this.baseUrl}/products`, { params: httpParams });
  }

  getTopProducts(limit: number = 10): Observable<ProductsResponse> {
    return this.getProducts({ sort: 'rating', limit });
  }
  getProductBySlug(slug: string): Observable<{ data: Product, message: string }> {
    return this._http.get<{ data: Product, message: string }>(`${this.baseUrl}/products/${slug}`);
  }

  
}
