import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Auth, AuthResponse } from '../../../core/services/auth';
import { Router } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  @Output() closeModal = new EventEmitter<void>();
  @Output() switchToRegister = new EventEmitter<void>();

  showPassword = false;
  isLoading = false;
  loginForm: FormGroup;

  private fb = inject(FormBuilder);
  private authService = inject(Auth);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  
  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  onClose() {
    this.closeModal.emit();
  }

  onSwitchToRegister() {
    this.switchToRegister.emit();
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: (response: AuthResponse) => {
        this.isLoading = false;
        this.notificationService.show('Login exitoso.', 'success');
        this.onClose();

        setTimeout(() => {
          this.router.navigate(['/panel']);
        }, 500); 
      },
      error: (err) => {
        this.isLoading = false;
        const message = err.error?.message || 'Error desconocido, inténtelo de nuevo.';
        this.notificationService.show(message, 'error');
      }
    });
  }
}