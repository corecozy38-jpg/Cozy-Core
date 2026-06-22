import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { GustService } from '../services/gust.service';

export const guestInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.headers.has('Authorization')) {
    return next(req);
  }
  const guestService = inject(GustService);
  const guestId = guestService.getGuestId();
  if (guestId) {
    const clonedReq = req.clone({
      setHeaders: { 'x-guest-id': guestId }
    });
    return next(clonedReq);
  }
  return next(req);
};
