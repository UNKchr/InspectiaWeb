import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new BehaviorSubject<Notification | null>(null);
  
  /**
   * Observable para que los componentes se suscriban y reciban notificaciones.
   */
  public notification$: Observable<Notification | null> = this.notificationSubject.asObservable();

  /**
   * Muestra una nueva notificación.
   * @param message El mensaje a mostrar.
   * @param type El tipo de notificación (success, error, info).
   */
  show(message: string, type: 'success' | 'error' | 'info' = 'success'): void {
    this.notificationSubject.next({ message, type });
  }

  /**
   * Limpia la notificación actual.
   */
  clear(): void {
    this.notificationSubject.next(null);
  }
}
