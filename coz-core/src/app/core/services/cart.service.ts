import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { CartI } from '../interfaces/cart.interface';

@Injectable({ providedIn: 'root' })
export class CartService {
  private apiUrl = environment.apiUrl;
  private cartCountSubject = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCountSubject.asObservable();

  constructor(private http: HttpClient) {
    this.updateCartCount();
  }


  getCart(): Observable<CartI> {
    return this.http.get<{ message: string; data: CartI }>(`${this.apiUrl}/cart`)
      .pipe(map(response => response.data));
  }

  addToCart(variantId: string, size: string, quantity: number = 1, note?: string): Observable<CartI> {
    return this.http.post<{ message: string; data: CartI }>(`${this.apiUrl}/cart/items/${variantId}`, { size, quantity, note })
      .pipe(
        map(response => response.data),
        tap(() => this.updateCartCount())
      );
  }

  updateQuantity(itemId: string, quantity: number): Observable<CartI> {
    return this.http.put<{ message: string; data: CartI }>(`${this.apiUrl}/cart/items/${itemId}`, { quantity })
      .pipe(
        map(response => response.data),
        tap(() => this.updateCartCount())
      );
  }

  removeItem(itemId: string): Observable<CartI> {
    return this.http.delete<{ message: string; data: CartI }>(`${this.apiUrl}/cart/items/${itemId}`)
      .pipe(
        map(response => response.data),
        tap(() => this.updateCartCount())
      );
  }

  clearCart(): Observable<CartI> {
    return this.http.delete<{ message: string; data: CartI }>(`${this.apiUrl}/cart`)
      .pipe(
        map(response => response.data),
        tap(() => this.updateCartCount())
      );
  }

  updateCartCount() {
    this.getCart().subscribe({
      next: (res) => {
        const count = res?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
        this.cartCountSubject.next(count);
      },
      error: () => this.cartCountSubject.next(0)
    });
  }
}
