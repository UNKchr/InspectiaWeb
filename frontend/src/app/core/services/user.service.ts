import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.prod';

const API_URL = `${environment.apiUrl}`;

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);

  getUserProfile(): Observable<any> {
    return this.http.get(API_URL + '/user/profile');
  }

  addSaldo(amount: number): Observable<{ message: string, user: any }> {
    return this.http.post<{ message: string, user: any }>(`${API_URL}/requests/add-saldo`, { amount });
  }
}
