import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../../../core/services/user.service';
import { Auth } from '../../../../../core/services/auth';
import { NotificationService } from '../../../../../core/services/notification.service';

@Component({
  selector: 'app-reload-balance-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reload-balance-form.html',
  styleUrl: './reload-balance-form.css'
})
export class ReloadBalanceForm {
  @Input() currentBalance: number = 0;
  reloadAmount: number | null = null;

  constructor(
    private userService: UserService,
    private authService: Auth,
    private notificationService: NotificationService
  ) {}

  onReload() {
    if (!this.reloadAmount || this.reloadAmount <= 0) {
      this.notificationService.show('Por favor, ingrese un monto válido.', 'error');
      return;
    }

    this.userService.addSaldo(this.reloadAmount).subscribe({
      next: (res) => {
        this.authService.updateUserBalance(res.user.saldo);
        this.notificationService.show(res.message, 'success');
        this.reloadAmount = null; // Limpiar el campo
      },
      error: (err) => {
        const errorMessage = err.error?.message || 'Ocurrió un error al recargar el saldo.';
        this.notificationService.show(errorMessage, 'error');
      }
    });
  }
}
