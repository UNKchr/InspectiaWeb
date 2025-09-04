import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { TokenStorage } from './token-storage';
import { Router } from '@angular/router';
import { User } from '../models/user.model';
import { UserService } from './user.service';

export interface AuthResponse {
  token: string;
  user: User; // Usamos la interfaz User directamente
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private ApiUrl = 'http://localhost:3000/api/auth';
  
  // BehaviorSubject para mantener el estado del usuario actual de forma reactiva
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorage,
    private router: Router,
    private userService: UserService
  ) {
    // Si hay un token, obtenemos el perfil completo del usuario
    if (this.tokenStorage.getToken()) {
      this.fetchAndSetUser();
    }
  }

  // Getter para obtener el valor actual del usuario de forma síncrona
  public get currentUserValue(): User | null {
    return this.userSubject.value;
  }

  public isLoggedIn(): boolean {
    const token = this.tokenStorage.getToken();
    return !!token;
  }

  // Obtiene el perfil del usuario del backend y lo emite
  fetchAndSetUser(): void {
    this.userService.getUserProfile().subscribe({
      next: (user) => this.userSubject.next(user),
      error: () => {
        // Si hay un error (ej. token inválido), cerramos sesión
        this.logout();
      }
    });
  }

  register(data: RegisterData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.ApiUrl}/register`, data).pipe(
      tap(response => {
        this.handleAuthentication(response);
      })
    );
  }

  login(credentials: { email: string, password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.ApiUrl}/login`, credentials).pipe(
      tap(response => {
        this.handleAuthentication(response);
        this.fetchAndSetUser(); // Obtenemos el perfil completo del usuario
      })
    );
  }

  logout(): void {
    this.tokenStorage.signOut();
    this.userSubject.next(null); // Notificamos que el usuario ha cerrado sesión
    this.router.navigate(['/']);
  }

  private handleAuthentication(response: AuthResponse): void {
    this.tokenStorage.saveToken(response.token);
    // Guardamos el usuario en TokenStorage y actualizamos el BehaviorSubject
    this.tokenStorage.saveUser(response.user);
    this.userSubject.next(response.user);
  }

  // Método para actualizar el saldo del usuario de forma reactiva
  public updateUserBalance(newBalance: number): void {
    const currentUser = this.currentUserValue;
    if (currentUser) {
      // Creamos un nuevo objeto para asegurar la inmutabilidad y la detección de cambios
      const updatedUser = { ...currentUser, saldo: newBalance };
      this.tokenStorage.saveUser(updatedUser); // Actualizamos el storage
      this.userSubject.next(updatedUser); // Emitimos el nuevo estado
    }
  }
}
