import { HttpInterceptorFn } from '@angular/common/http';

export const languageInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req);
};
