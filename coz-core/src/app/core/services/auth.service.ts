import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { GustService } from './gust.service';
import { environment } from '../../../environments/environment.development';
import {
  changePasswordBody,
  forgetPasswordResponse,
  LoginResponse,
  RegisterResponse,
  LoginBody,
  RegisterBody,
  resetPasswordBody,
  verfiyOTPBody,
  verifyOTPResponse,
} from '../interfaces/user.interface';
import { RefreshTokenService } from './refresh-token.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from './toast.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = environment.apiUrl;

  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(
    private http: HttpClient,
    private tokenService: RefreshTokenService,
    private guestService: GustService,
    private router: Router,
    private _cartService: CartService,
    private _guestService: GustService,
    private _toast: ToastService,
    private _translate: TranslateService
  ) {
    // FOR IF I LOGOUT FROM ANY TAB IN BROWSER EVERY OTHER TAB WILL BE LOGGED OUT
    window.addEventListener('storage', (event: StorageEvent) => {
      if (event.key === 'accessToken' || event.key === 'logout') {
        this.checkAndLogout();
      }
    });
  }

  private hasValidToken(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  private checkAndLogout(): void {
    const token = localStorage.getItem('accessToken');
    const logoutFlag = localStorage.getItem('logout');

    if (!token || logoutFlag) {
      this.tokenService.clearAccessToken();
      localStorage.removeItem('user');
      this.isLoggedInSubject.next(false);
      try{
        this._translate.get('auth.session_expired').subscribe(msg => {
          this._toast.warning(msg);
        });
      } catch (error) {
        console.log("this is the error", error)
      }
      this.router.navigate(['/']);
    }
  }

  Login(body: LoginBody): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.baseUrl}/auth/login`, body, { withCredentials: true })
      .pipe(
        tap((response) => {
          this.tokenService.setAccessToken(response.accessToken);
          localStorage.removeItem('logout');
          this._cartService.getCart().subscribe();
          this.isLoggedInSubject.next(true);
          this.router.navigate(['/home']);
        }),
      );
  }

  logout(): Observable<{ message: string; guestId?: string }> {
    const guestId = this.guestService.getGuestId();

    return this.http
      .post<{ message: string; guestId?: string, cart: any }>(
        `${this.baseUrl}/auth/logout`,
        { guestId },
        { withCredentials: true },
      )
      .pipe(
        tap((response) => {
          console.log(response);
          this.tokenService.clearAccessToken();
          localStorage.removeItem('user');
          localStorage.setItem('logout', Date.now().toString());
          this.isLoggedInSubject.next(false);
          if (response.guestId) {
            this._guestService.setGuestId(response.guestId);
          }
          this._cartService.updateCartCount();
        }),
      );
  }

  Register(body: RegisterBody): Observable<RegisterBody> {
    return this.http.post<RegisterBody>(`${this.baseUrl}/auth/register`, body);
  }

  changePassword(body: changePasswordBody): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/auth/change-password`, body);
  }

  forgetPassword(body: { email: string }): Observable<forgetPasswordResponse> {
    return this.http.post<forgetPasswordResponse>(`${this.baseUrl}/auth/forgot-password`, body);
  }

  verifyOtp(header: verfiyOTPBody): Observable<verifyOTPResponse> {
    return this.http.post<verifyOTPResponse>(
      `${this.baseUrl}/auth/verify-otp`,
      { otp: header.otp },
      { headers: { Authorization: `Bearer ${header.token}` } },
    );
  }

  verifyEmail(token: string): Observable<{ message: string }> {
    return this.http.get<{ message: string }>(`${this.baseUrl}/auth/verify-email?token=${token}`);
  }

  resetPassword(body: resetPasswordBody): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/auth/reset-password`, body, {
      headers: { Authorization: `Bearer ${body.token}` },
    });
  }

  refreshToken(): Observable<{ accessToken: string }> {
    return this.http
      .post<{
        accessToken: string;
      }>(`${this.baseUrl}/auth/refresh-token`, {}, { withCredentials: true })
      .pipe(tap((response) => this.tokenService.setAccessToken(response.accessToken)));
  }

  deleteAccount(payload: { password: string }): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/auth/delete-account`, {
      body: payload,
      withCredentials: true,
    });
  }

  resendVerification(payload: { email: string }): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/auth/resend-verification`, payload);
  }
}
