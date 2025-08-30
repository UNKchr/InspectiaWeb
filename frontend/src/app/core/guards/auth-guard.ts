import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);
  
  if (authService.isLoggedIn()) {
    // Si el usuario está autenticado, permitimos el acceso
    return true;
  }

  // Si el usuario no está autenticado, redirigimos a la página de login
  router.navigate(['/']);
  return false;
};