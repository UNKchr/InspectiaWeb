import { Component } from '@angular/core';
import { LoginComponent } from '../../Login/login/login';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    LoginComponent
  ],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css'
})
export class LandingPageComponent {
  showLogin = false;
  mobileMenuOpen = false;

  toggleLogin() {
    this.showLogin = !this.showLogin;
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
}