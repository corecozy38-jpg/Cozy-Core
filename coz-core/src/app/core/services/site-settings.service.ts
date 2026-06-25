import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {  AboutResponse,  ContactForm,  ContactInfoResponse, OrderGuideResponse, TermsInfoResponse } from '../interfaces/settings';
import { FaqListResponse } from '../interfaces/admin.interface';
import { Image } from '../interfaces/product.interface';

@Injectable({
  providedIn: 'root',
})
export class SiteSettingsService {
  private baseUrl = environment.apiUrl;

  constructor(private _http: HttpClient) {}

  getAbout():Observable<AboutResponse>{
    return this._http.get<AboutResponse>(`${this.baseUrl}/public-settings/about`);
  }

  getContact():Observable<ContactInfoResponse>{
    return this._http.get<ContactInfoResponse>(`${this.baseUrl}/public-settings/contact-info`);
  }

  getTerms():Observable<TermsInfoResponse>{
    return this._http.get<TermsInfoResponse>(`${this.baseUrl}/public-settings/terms`);
  }

  getOrderGuide():Observable<OrderGuideResponse>{
    return this._http.get<OrderGuideResponse>(`${this.baseUrl}/public-settings/order-guide`);
  }


  getActiveFaqs(): Observable<FaqListResponse> {
    return this._http.get<FaqListResponse>(`${this.baseUrl}/public-settings/active-faqs`);
  }

  sendMessage(body:ContactForm):Observable<{message :string}>{
    return this._http.post<{message :string}>(`${this.baseUrl}/public-settings/contact-us`,body);
  }

  getBanner():Observable<{message : string , data:Image}>{
    return this._http.get<{message : string , data:Image}>(`${this.baseUrl}/public-settings/banner`);
  }

  getAvailableCollections(): Observable<{  data: string[]; message: string }> {
    return this._http.get<{ data: string[]; message: string }>(
      `${this.baseUrl}/public-settings/collections`
    );
  }
}
