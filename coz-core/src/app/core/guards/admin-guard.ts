import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { RefreshTokenService } from '../services/refresh-token.service';
import { catchError, map, of } from 'rxjs';

export const adminGuard: CanActivateFn = (route, state) => {
  const tokenService = inject(RefreshTokenService);
  const userService = inject(UserService);
  const router = inject(Router);

  const token = tokenService.getAccessToken();
  if (!token) {
    router.navigate(['/auth']);
    return false;
  }
  return userService.getUserRole().pipe(
    map(role => {
      if (role === 'admin') return true;
      router.navigate(['/']);
      return false;
    }),
    catchError(() => {
      router.navigate(['/home']);
      return of(false);
    })
  );
};
