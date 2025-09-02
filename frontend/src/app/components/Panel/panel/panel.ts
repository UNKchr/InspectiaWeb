import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CertificationForm } from './components/certification-form/certification-form';
import { CertificationsList } from './components/certifications-list/certifications-list';
import { ReloadBalanceForm } from './components/reload-balance-form/reload-balance-form';
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
    ReloadBalanceForm
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

  userCertifications = [
    { id: 1, product: 'Smartphone XZ-100', status: 'Aprobado', date: '2025-08-25', score: 98 },
    { id: 2, product: 'Laptop Pro 15"', status: 'Rechazado', date: '2025-08-24', score: 72 },
    { id: 3, product: 'Tablet Ultra', status: 'Pendiente', date: '2025-08-23', score: null }
  ];

  allCertifications = [
    { id: 1, user: 'Ana García', product: 'Monitor 4K', status: 'Aprobado', date: '2025-08-25', score: 95 },
    { id: 2, user: 'Carlos López', product: 'Teclado Gaming', status: 'Rechazado', date: '2025-08-24', score: 68 },
    { id: 3, user: 'María Rodríguez', product: 'Mouse Inalámbrico', status: 'Aprobado', date: '2025-08-23', score: 91 }
  ];

  ngOnInit(): void {
    // Nos suscribimos al observable del usuario para recibir actualizaciones en tiempo real
    this.userSubscription = this.authService.user$.subscribe(user => {
      this.user = user;
    });
  }

  ngOnDestroy(): void {
    // Es una buena práctica desuscribirse para evitar fugas de memoria
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
}
