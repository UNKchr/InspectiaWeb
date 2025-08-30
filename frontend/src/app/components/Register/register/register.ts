import { Component, EventEmitter, Output, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Auth } from '../../../core/services/auth';
import { response } from 'express';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  @Output() closeRegisterModal = new EventEmitter<void>();
  @Output() switchToLogin = new EventEmitter<void>();

  registerForm: FormGroup;
  showPassword = false;
  isLoading = false;

  toastMessage: string | null = null;
  toastType: 'success' | 'error' | null = null;

  private fb = inject(FormBuilder);
  private auth = inject(Auth);

  constructor() {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      terms: [false, Validators.requiredTrue]
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const { name, email, password } = this.registerForm.value;

    this.auth.register({name, email, password}).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.showToast('Registro exitoso', 'success');
        setTimeout(() => this.closeRegister(), 3000);
      },
      error: (err) => {
        this.isLoading = false;
        const message = err.error?.message || 'Error al crear la cuenta.';
        this.showToast(message, 'error');
      }
    });
  }

  onSwitchToLogin() {
    console.log('RegisterComponent: onSwitchToLogin');
    this.switchToLogin.emit();
  }

  closeRegister() {
    console.log('RegisterComponent: closeRegister');
    this.closeRegisterModal.emit();
  }

  showToast(message: string, type: 'success' | 'error') {
    this.toastMessage = message;
    this.toastType = type;
    setTimeout(() => this.hideToast(), 3000);
  }

  hideToast() {
    this.toastMessage = null;
    this.toastType = null;
  }
}
