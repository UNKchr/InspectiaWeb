import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { TokenStorage } from './token-storage';
import { Router } from '@angular/router'

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: 'user' | 'admin';
  };
}

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private ApiUrl = 'http://localhost:3000/api/auth';

  private currentUserSubject: BehaviorSubject<any | null>;
  public currentUser$: Observable<any | null>;

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorage,
    private router: Router
  ) {
    //al iniciar el servicio, se obtiene el usuario actual del TokenStorage
    this.currentUserSubject = new BehaviorSubject<any | null>(this.tokenStorage.getUser());
    this.currentUser$ = this.currentUserSubject.asObservable();
  }
  // Getter para obtener el valor actual del usuario
  public get currentUserValue(): any | null {
    return this.currentUserSubject.value;
  }

  public isLoggedIn(): boolean {
    return !!this.tokenStorage.getToken();
  }

  login(credentials: { email: string, password: string}): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.ApiUrl}/login`, credentials).pipe(tap(response => {
      // Si el login es exitoso, guardamos los datos
      this.handleAuthentication(response);
      })
    );
  }

  logout(): void {
    this.tokenStorage.signOut();
    this.currentUserSubject.next(null); // Notificamos que el usuario ha cerrado sesión
    this.router.navigate(['/login']); // Redirigimos al usuario a la página de login
  }

  private handleAuthentication(response: AuthResponse): void {
    this.tokenStorage.saveToken(response.token);
    this.tokenStorage.saveUser(response.user);
    this.currentUserSubject.next(response.user); // Actualizamos el estado
  }
}
