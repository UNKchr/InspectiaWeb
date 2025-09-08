import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

export interface SearchUsersResponse { results: Array<Pick<User, '_id' | 'name' | 'email' | 'saldo' | 'role'>>; }
export interface AddSaldoResponse { message: string; user: User; }

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private api = environment.apiUrl + '/admin';

  searchUsers(query: string): Observable<SearchUsersResponse> {
    const q = query?.trim();
    const url = q ? `${this.api}/users/search?q=${encodeURIComponent(q)}` : `${this.api}/users/search`;
    return this.http.get<SearchUsersResponse>(url);
  }

  addSaldoToUser(userId: string | null, email: string | null, amount: number): Observable<AddSaldoResponse> {
    return this.http.post<AddSaldoResponse>(`${this.api}/add-saldo-to-user`, { userId, email, amount });
  }
}
