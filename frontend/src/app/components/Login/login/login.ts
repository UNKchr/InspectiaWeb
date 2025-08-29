import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Auth, AuthResponse } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  @Output() closeModal = new EventEmitter<void>();

  // Propiedades para la notificacion (toast)
  toastMessage: string | null = null;
  toastType: 'success' | 'error' | null = null;

  showPassword = false;
  isLoading = false;
  loginForm: FormGroup;

  // Inyeccion de dependencias con inject()
  private fb = inject(FormBuilder);
  private authService = inject(Auth);
  
  constructor() {
    // Inicializamos el formulario reactivo
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  onClose() {
    this.closeModal.emit();
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched(); // Muestra errores si el form no es valido
      return;
    }

    this.isLoading = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: (response: AuthResponse) => {
        this.isLoading = false;
        this.showToast('Login exitoso. Bienvenido ' + response.user.name, 'success');

        setTimeout(() => this.onClose(), 3000);
      },
      error: (err) => {
        this.isLoading = false;
        const message = err.error?.message || 'Error desconocido, intentelo de nuevo.';
        this.showToast(message, 'error');
      }
    });
  }

  showToast(message: string, type: 'success' | 'error') {
    this.toastMessage = message;
    this.toastType = type;

    // Ocultar el toast después de 3 segundos
    setTimeout(() => this.hideToast(), 3000);
  }

  hideToast() {
    this.toastMessage = null;
    this.toastType = null;
  }
}