import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LandingPageComponent } from './components/LandingPage/landing-page/landing-page';
import { LoginComponent } from './components/Login/login/login';
import { Register } from './components/Register/register/register';
@Component({
  selector: 'app-root',
  imports: [LandingPageComponent, LoginComponent, Register, CommonModule, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('inspectia-web');
  showLoginModal = false;
  showRegisterModal = false;

  openLoginModal() {
    console.log('App: openLoginModal triggered');
    this.showLoginModal = true;
    this.showRegisterModal = false;
  }

  openRegisterModal() {
    console.log('App: openRegisterModal triggered');
    this.showLoginModal = false;
    this.showRegisterModal = true;
  }

  handleSwitchToRegister() {
    console.log('App: handleSwitchToRegister triggered');
    this.showLoginModal = false;
    this.showRegisterModal = true;
  }

  handleSwitchToLogin() {
    console.log('App: handleSwitchToLogin triggered');
    this.showLoginModal = true;
    this.showRegisterModal = false;
  }

  closeModals() {
    console.log('App: closeModals triggered');
    this.showLoginModal = false;
    this.showRegisterModal = false;
  }
}
