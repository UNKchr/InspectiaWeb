import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  onReload() {
    console.log('Reloading balance with amount:', this.reloadAmount);
    // Aquí iría la lógica para emitir un evento o llamar a un servicio
  }
}
