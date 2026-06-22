import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RefreshTokenService {
  private accessTokenSubject = new BehaviorSubject<string | null>(null);
  accessToken$ = this.accessTokenSubject.asObservable();

  constructor() {
    this.initToken();
    }
  setAccessToken(token: string | null): void {
    this.accessTokenSubject.next(token);
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  }

  getAccessToken(): string | null {
    return this.accessTokenSubject.value;
  }

  clearAccessToken(): void {
    this.setAccessToken(null);
  }

  initToken(): void {
    const token = localStorage.getItem('accessToken');
    if (token) {
      this.accessTokenSubject.next(token);
    }
  }

  setToken(accessToken: string): void {
    this.setAccessToken(accessToken);
  }

  getToken(): { accessToken: string | null} {
    return { accessToken: this.getAccessToken() };
  }

  clearToken(): void {
    this.clearAccessToken();
  }
}
