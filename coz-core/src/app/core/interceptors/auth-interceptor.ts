import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject, Injector } from '@angular/core'; 
import { catchError, switchMap, throwError, BehaviorSubject, filter, take, finalize } from 'rxjs';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { RefreshTokenService } from '../services/refresh-token.service';
import { ToastService } from '../services/toast.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
let refreshFailed = false; 

export const authInterceptor: HttpInterceptorFn = 
(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const injector = inject(Injector);
  const tokenService = inject(RefreshTokenService);
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const token = tokenService.getAccessToken();

  let clonedReq = req.clone({ withCredentials: true });
  if (token) {
    clonedReq = clonedReq.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 429) {
        const toast = injector.get(ToastService);
        const translate = injector.get(TranslateService);
        
        const retryAfter = error.headers.get('Retry-After') || '60';
        const seconds = parseInt(retryAfter, 10);
        
        const message = translate.instant('error.too_many_requests', { seconds });
        toast.error(message);
        
        const enhancedError = { ...error, retryAfter: seconds };
        return throwError(() => enhancedError);
      }
      
      if (error.status === 401 && !clonedReq.url.includes('/refresh-token')) {
        if (refreshFailed) {
          tokenService.clearAccessToken();
          authService.logout().subscribe();
          router.navigate(['/auth']);
          return throwError(() => error);
        }
        return handle401Error(clonedReq, next, tokenService, authService, router);
      }
      
      return throwError(() => error);
    })
  );
};

function handle401Error(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  tokenService: RefreshTokenService,
  authService: AuthService,
  router: Router
): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);
    refreshFailed = false; 

    return authService.refreshToken().pipe(
      switchMap((response: { accessToken: string }) => {
        const newToken = response.accessToken;
        refreshTokenSubject.next(newToken);
        refreshFailed = false;
        const retryReq = req.clone({
          setHeaders: { Authorization: `Bearer ${newToken}` }
        });
        return next(retryReq);
      }),
      finalize(() => {
        isRefreshing = false;
      }),
      catchError((refreshError) => {
        refreshFailed = true;
        tokenService.clearAccessToken();
        authService.logout().subscribe();
        router.navigate(['/auth']);
        return throwError(() => refreshError);
      })
    );
  } else {
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => {
        const retryReq = req.clone({
          setHeaders: { Authorization: `Bearer ${token}` }
        });
        return next(retryReq);
      })
    );
  }
}