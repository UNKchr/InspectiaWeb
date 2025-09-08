import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CertificationForm } from './components/certification-form/certification-form';
import { CertificationsList } from './components/certifications-list/certifications-list';
import { ReloadBalanceForm } from './components/reload-balance-form/reload-balance-form';
import { ReloadBalanceToUser } from './components/reload-balance-to-user/reload-balance-to-user';
import { Auth } from '../../../core/services/auth';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-panel',
  standalone: true,
  imports: [
    FormsModule, 
    CommonModule, 
    CertificationForm, 
    CertificationsList, 
    ReloadBalanceForm,
    ReloadBalanceToUser
  ],
  templateUrl: './panel.html',
  styleUrl: './panel.css'
})
export class Panel implements OnInit, OnDestroy {
  private authService = inject(Auth);
  private userSubscription: Subscription | undefined;

  user: User | null = null;

  activeSection = 'welcome';
  sidebarCollapsed = false;
  showLogoutModal = false;

  ngOnInit(): void {
    this.userSubscription = this.authService.user$.subscribe(user => {
      this.user = user;
    });
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  setActiveSection(section: string) {
    this.activeSection = section;
    if (window.innerWidth < 768) {
      this.sidebarCollapsed = true;
    }
  }

  isAdmin(): boolean {
    return this.user?.role === 'admin';
  }

  logout() {
    this.authService.logout();
  }

  promptLogout(): void {
    this.showLogoutModal = true;
  }

  cancelLogout(): void {
    this.showLogoutModal = false;
  }

  confirmLogout(): void {
    this.logout();
    this.showLogoutModal = false;
  }
}
