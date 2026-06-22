import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import {  CreateOrderBody, Order, OrdersListResponse, SingleOrderResponse } from '../interfaces/order.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrderesService {
  private baseUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getMyOrders(page: number = 1, limit: number = 10): Observable<OrdersListResponse> {
    return this.http.get<OrdersListResponse>(`${this.baseUrl}/orders`, {
      params: { page: page.toString(), limit: limit.toString() }
    });
  }

  getOrderById(orderId: string): Observable<{ message: string; data: Order }> {
    return this.http.get<{ message: string; data: Order }>(`${this.baseUrl}/orders/${orderId}`);
  }

  createOrder(orderData: CreateOrderBody): Observable<SingleOrderResponse> {
  return this.http.post<SingleOrderResponse>(`${this.baseUrl}/orders`, orderData);
  }

  
}
