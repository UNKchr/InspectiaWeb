import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auth } from './auth';

export interface CertificationRequestData {
  certificationType: string;
  projectName: string;
  projectDescription: string;
  projectUrl: string;
  repoUrl: string;
  companyName?: string;
  companyAddress?: string;
  appPlatform?: string;
}

export interface RequestResponse {
  message: string;
  newSaldo: number;
  request: any; 
}

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  private http = inject(HttpClient);
  private authService = inject(Auth);
  private apiUrl = 'http://localhost:3000/api/requests';

  // en request.service.ts
  createRequest(data: CertificationRequestData): Observable<RequestResponse> {
      return this.http.post<RequestResponse>(`${this.apiUrl}`, data);
  }
}  
