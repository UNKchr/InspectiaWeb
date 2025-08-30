import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-panel',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './panel.html',
  styleUrl: './panel.css'
})
export class Panel {
  user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'user',
    balance: 100
  };

  activeSection = 'Welcome';
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

  certificationForm = {
    productName: '',
    productType: '',
    description: '',
    images: null
  };

  reloadBalanceForm = {
    amount: ''
  };

  adminReloadForm = {
    userSearch: '',
    amount: ''
  };

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
    return this.user.role === 'admin';
  }

  onSubmitCertification() {
    console.log('Enviando certificación:', this.certificationForm);
    // Lógica de envío
  }

  onReloadBalance() {
    console.log('Recargando saldo:', this.reloadBalanceForm.amount);
    // Lógica de recarga
  }

  onAdminReload() {
    console.log('Recarga admin:', this.adminReloadForm);
    // Lógica de recarga admin
  }

  logout() {
    console.log('Cerrando sesión');
    // Lógica de cierre de sesión
  }
}
