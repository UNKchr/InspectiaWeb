import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Notification, NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (notification) {
      <div class="notification-toast" [ngClass]="'toast-' + notification.type">
        <span>{{ notification.message }}</span>
        <button (click)="close()" class="close-button">&times;</button>
      </div>
    }
  `,
  styles: [`
    .notification-toast {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 8px;
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 16px;
      z-index: 6000;
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-width: 300px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: slideInRight 0.3s ease-out, fadeOut 0.5s ease-in 4.5s forwards;
    }

    .toast-success {
      background-color: #28a745;
    }

    .toast-error {
      background-color: #dc3545;
    }

    .toast-info {
      background-color: #17a2b8;
    }

    .close-button {
      background: none;
      border: none;
      color: #fff;
      font-size: 24px;
      line-height: 1;
      cursor: pointer;
      margin-left: 20px;
      opacity: 0.8;
    }

    .close-button:hover {
      opacity: 1;
    }

    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes fadeOut {
      from {
        opacity: 1;
      }
      to {
        opacity: 0;
        transform: translateY(-20px);
      }
    }
  `]
})
export class NotificationComponent implements OnInit, OnDestroy {
  notification: Notification | null = null;
  private subscription: Subscription | undefined;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.subscription = this.notificationService.notification$.subscribe(notification => {
      this.notification = notification;
      if (notification) {
        setTimeout(() => this.close(), 5000); // Auto-cierre después de 5 segundos
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  close(): void {
    this.notificationService.clear();
  }
}
