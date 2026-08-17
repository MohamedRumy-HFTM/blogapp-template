import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';

import { AuthStore } from '../services/auth-store';

const REQUIRED_ROLE = 'user';

export const authGuard: CanMatchFn = async (route, segments) => {
  const authStore: AuthStore = inject(AuthStore);
  const router: Router = inject(Router);

  // Kein Polling: wir warten auf den Session-Check aus dem Konstruktor
  await authStore.ready;

  if (!authStore.isAuthenticated()) {
    const returnUrl = '/' + segments.map((segment) => segment.path).join('/');
    return router.createUrlTree(['/login'], { queryParams: { returnUrl } });
  }

  if (!authStore.roles().includes(REQUIRED_ROLE)) {
    return router.createUrlTree(['/login'], { queryParams: { error: 'access_denied' } });
  }

  return true;
};
