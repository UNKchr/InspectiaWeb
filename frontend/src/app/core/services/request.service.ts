import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CertificationRequest } from '../models/certification-request.model';

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
  request: CertificationRequest; 
}

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api';

  createRequest(data: CertificationRequestData): Observable<RequestResponse> {
      return this.http.post<RequestResponse>(`${this.apiUrl}/requests`, data);
  }

  getMyRequests(): Observable<CertificationRequest[]> {
    return this.http.get<CertificationRequest[]>(`${this.apiUrl}/requests/my-requests`);
  }

  getAllRequests(): Observable<CertificationRequest[]> {
    return this.http.get<CertificationRequest[]>(`${this.apiUrl}/admin/requests`);
  }

  updateRequestStatus(requestId: string, status: string): Observable<{ message: string, request: CertificationRequest }> {
    return this.http.put<{ message: string, request: CertificationRequest }>(`${this.apiUrl}/admin/requests/${requestId}/status`, { status });
  }

  deleteRequest(requestId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/admin/requests/${requestId}`);
  }
}
