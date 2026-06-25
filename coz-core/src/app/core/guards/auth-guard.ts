import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RefreshTokenService } from '../services/refresh-token.service';

export const authGuard: CanActivateFn = (route, state) => {
  const tokenService = inject(RefreshTokenService);
  const router = inject(Router);
  // If user loged in can't access to auth pages
  const token = tokenService.getAccessToken();
  if (token) {
    router.navigate(['/']);
    return false;
  }
  return true;
};
