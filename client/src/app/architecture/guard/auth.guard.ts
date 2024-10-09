import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Utils } from '../../utils';

export const AuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router)

  const isAuthenticated = !!Utils.getStorage('keyToken'); // Ejemplo: verificar si hay un token

  if (isAuthenticated) {
    router.navigate(['/'])
    return false;
  }

  return true;
};
