import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenStorage } from '../services/token-storage';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenStorage);
  const token = tokenService.getToken();
  
  if (token) {
    // Clonamos la peticion y añadimos el header de autorizacion
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }
  // Si no hay token dejamos pasar la peticion original
  return next(req);
};
