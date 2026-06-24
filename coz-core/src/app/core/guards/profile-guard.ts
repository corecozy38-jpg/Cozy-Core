import {  UserService } from './../services/user.service';
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

export const profileGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const userService = inject(UserService);
  // guest can't access to profile pages
  if(!localStorage.getItem('accessToken'))
  {
    router.navigate(['/auth']);
    return false;
  }
  return true;
};
