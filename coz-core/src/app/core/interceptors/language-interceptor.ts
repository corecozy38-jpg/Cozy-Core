import { HttpInterceptorFn } from '@angular/common/http';

export const languageInterceptor: HttpInterceptorFn = (req, next) => {
  const lang = localStorage.getItem('lang') || 'en';
  const clonedReq = req.clone({
    setHeaders: { 'Accept-Language': lang },
  });
  return next(clonedReq);
};
