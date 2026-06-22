import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take, finalize } from 'rxjs';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { RefreshTokenService } from '../services/refresh-token.service';

let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const tokenService = inject(RefreshTokenService);
  const authService = inject(AuthService);
  const token = tokenService.getAccessToken();

  let clonedReq = req.clone({ withCredentials: true });
  if (token) {
    clonedReq = clonedReq.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !clonedReq.url.includes('/refresh-token')) {
        return handle401Error(clonedReq, next, tokenService, authService);
      }
      return throwError(() => error);
    })
  );
};

function handle401Error(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  tokenService: RefreshTokenService,
  authService: AuthService
): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((response: { accessToken: string }) => {
        const newToken = response.accessToken;
        refreshTokenSubject.next(newToken);
        const retryReq = req.clone({
          setHeaders: { Authorization: `Bearer ${newToken}` }
        });
        return next(retryReq);
      }),
      finalize(() => {
        isRefreshing = false;
      }),
      catchError((refreshError) => {
        tokenService.clearAccessToken();
        authService.logout().subscribe();
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