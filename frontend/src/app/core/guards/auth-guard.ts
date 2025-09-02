import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '../services/auth';

export const authGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  console.log('%c[AuthGuard] Se ha activado.', 'color: orange; font-weight: bold;');
  console.log(`[AuthGuard] URL solicitada: ${state.url}`);

  const authService = inject(Auth);
  const router = inject(Router);

  const isLoggedIn = authService.isLoggedIn();
  console.log(`[AuthGuard] authService.isLoggedIn() ha devuelto: ${isLoggedIn}`);

  if (isLoggedIn) {
    console.log('%c[AuthGuard] Decisión: ACCESO PERMITIDO.', 'color: green;');
    return true;
  } else {
    console.log('%c[AuthGuard] Decisión: ACCESO DENEGADO. Redirigiendo a /.', 'color: red;');
    return router.createUrlTree(['/']);
  }
};