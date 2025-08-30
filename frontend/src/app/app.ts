import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingPageComponent } from './components/LandingPage/landing-page/landing-page';
import { LoginComponent } from './components/Login/login/login';
import { Register } from './components/Register/register/register';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [LoginComponent, Register, CommonModule, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('inspectia-web');
  showLoginModal = false;
  showRegisterModal = false;

  onActivate(component: any) {
    if (component instanceof LandingPageComponent) {
      component.openLogin.subscribe(() => this.openLoginModal());
      component.openRegister.subscribe(() => this.openRegisterModal());
    }
  }

  openLoginModal() {
    this.showLoginModal = true;
    this.showRegisterModal = false;
  }

  openRegisterModal() {
    this.showLoginModal = false;
    this.showRegisterModal = true;
  }

  handleSwitchToRegister() {
    this.showLoginModal = false;
    this.showRegisterModal = true;
  }

  handleSwitchToLogin() {
    this.showLoginModal = true;
    this.showRegisterModal = false;
  }

  closeModals() {
    this.showLoginModal = false;
    this.showRegisterModal = false;
  }
}
