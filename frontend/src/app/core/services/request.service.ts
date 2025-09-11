import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CertificationRequest } from '../models/certification-request.model';
import { environment } from '../../../environments/environment';

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

export interface AdminSearchResponse {
  results: CertificationRequest[];
  count?: number;
  limit: number;
}

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  private http = inject(HttpClient);
  private ApiUrl = `${environment.apiUrl}`;

  createRequest(data: CertificationRequestData): Observable<RequestResponse> {
      return this.http.post<RequestResponse>(`${this.ApiUrl}/requests`, data);
  }

  getMyRequests(): Observable<CertificationRequest[]> {
    return this.http.get<CertificationRequest[]>(`${this.ApiUrl}/requests/my-requests`);
  }

  getAllRequests(): Observable<CertificationRequest[]> {
    return this.http.get<CertificationRequest[]>(`${this.ApiUrl}/admin/requests`);
  }

  // Búsqueda/filtros para admin
  searchAdminRequests(params: { q?: string; type?: string; from?: string; to?: string; limit?: number }): Observable<AdminSearchResponse> {
    const query = new URLSearchParams();
    if (params.q) query.set('q', params.q);
    if (params.type) query.set('type', params.type);
    if (params.from) query.set('from', params.from);
    if (params.to) query.set('to', params.to);
    if (params.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    const url = `${this.ApiUrl}/admin/requests/search${qs ? `?${qs}` : ''}`;
    return this.http.get<AdminSearchResponse>(url);
  }

  updateRequestStatus(requestId: string, status: string): Observable<{ message: string, request: CertificationRequest }> {
    return this.http.put<{ message: string, request: CertificationRequest }>(`${this.ApiUrl}/admin/requests/${requestId}/status`, { status });
  }

  deleteRequest(requestId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.ApiUrl}/admin/requests/${requestId}`);
  }

  // Descargar certificado PDF (respuesta binaria)
  downloadCertificate(requestId: string): Observable<Blob> {
    return this.http.get(`${this.ApiUrl}/requests/${requestId}/certificate`, { responseType: 'blob' });
  }
}
