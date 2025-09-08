import { Component } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, SearchUsersResponse, AddSaldoResponse } from '../../../../../core/services/admin.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { User } from '../../../../../core/models/user.model';

@Component({
  selector: 'app-reload-balance-to-user',
  imports: [CommonModule, FormsModule, DecimalPipe],
  templateUrl: './reload-balance-to-user.html',
  styleUrl: './reload-balance-to-user.css'
})
export class ReloadBalanceToUser {
  searchQuery = '';
  showResults = false;
  filteredUsers: Array<Pick<User, '_id' | 'name' | 'email' | 'saldo' | 'role'>> = [];
  loadingSearch = false;
  selectedUser: (Pick<User, '_id' | 'name' | 'email' | 'saldo'>) | null = null;
  currentBalance = 0;
  reloadAmount: number | null = null;
  successMessage = '';
  private searchDelay?: any;
  get amountInvalid(): boolean {
    return !this.selectedUser || this.reloadAmount === null || this.reloadAmount <= 0;
  }

  constructor(
    private adminService: AdminService,
    private notification: NotificationService
  ) {}

  onSearch(): void {
    this.successMessage = '';
    this.loadingSearch = true;
    clearTimeout(this.searchDelay);
    const term = this.searchQuery.trim();
    // debounce 300ms
    this.searchDelay = setTimeout(() => {
      this.adminService.searchUsers(term).subscribe({
        next: (resp: SearchUsersResponse) => {
          this.filteredUsers = resp.results;
          this.showResults = true;
          this.loadingSearch = false;
        },
        error: (err: any) => {
          console.error(err);
          this.notification.show('Error buscando usuarios', 'error');
          this.loadingSearch = false;
        }
      });
    }, 300);
  }

  selectUser(user: Pick<User, '_id' | 'name' | 'email' | 'saldo'>): void {
    this.selectedUser = user;
    this.currentBalance = user.saldo;
    this.showResults = false;
    this.reloadAmount = null;
    this.successMessage = '';
  }

  onReload(): void {
  if (this.amountInvalid) return;
  const amount = this.reloadAmount as number;
  this.adminService.addSaldoToUser(this.selectedUser!._id, null, amount).subscribe({
      next: (resp: AddSaldoResponse) => {
        this.currentBalance = resp.user.saldo;
        this.selectedUser!.saldo = resp.user.saldo;
        this.reloadAmount = null;
        this.successMessage = `Se recargaron $${amount} a ${resp.user.name}.`;
        this.notification.show(this.successMessage, 'success');
      },
      error: (err: any) => {
        console.error(err);
        const msg = err?.error?.message || 'No se pudo recargar';
        this.notification.show(msg, 'error');
      }
    });
  }
}
