import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RequestService, AdminSearchResponse } from '../../../../../core/services/request.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { CertificationRequest } from '../../../../../core/models/certification-request.model';

@Component({
  selector: 'app-certifications-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './certifications-list.html',
  styleUrl: './certifications-list.css'
})
export class CertificationsList implements OnInit {
  @Input() isAdminView: boolean = false;
  
  certifications: CertificationRequest[] = [];
  loading = true;
  showDeleteModal = false;
  requestToDelete: CertificationRequest | null = null;

  // Filtros/búsqueda (solo vista admin)
  searchTerm: string = '';
  typeFilter: '' | 'CALIDAD_SOFTWARE' | 'ISO_27001' | 'SEGURIDAD_APP' = '';
  fromDate: string = ''; // YYYY-MM-DD
  toDate: string = '';
  limit: number = 5; // 1..10

  constructor(
    private requestService: RequestService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadCertifications();
  }

  loadCertifications(): void {
    this.loading = true;
    if (this.isAdminView) {
      this.applyFilters();
    } else {
      this.requestService.getMyRequests().subscribe({
        next: (data) => {
          this.certifications = data;
          this.loading = false;
        },
        error: () => {
          this.notificationService.show('Error al cargar las certificaciones', 'error');
          this.loading = false;
        }
      });
    }
  }

  // Aplica búsqueda/filtros para admin usando el nuevo endpoint
  applyFilters(): void {
    if (!this.isAdminView) return;
    this.loading = true;

    // Normalizar rango si vienen ambos y están invertidos
    let from = this.fromDate;
    let to = this.toDate;
    if (from && to && new Date(from) > new Date(to)) {
      const tmp = from; from = to; to = tmp;
      this.fromDate = from; this.toDate = to;
    }

    const params: any = { limit: this.limit };
    const q = this.searchTerm?.trim();
    if (q) params.q = q;
    if (this.typeFilter) params.type = this.typeFilter;
    // Convertir a límites UTC del día a partir de la fecha LOCAL seleccionada
    const toUtcIso = (dateStr: string, kind: 'start'|'end'): string | null => {
      if (!dateStr) return null;
      let y: number, m: number, d: number;
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const [yy, mm, dd] = dateStr.split('-').map(Number);
        y = yy; m = mm; d = dd;
      } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
        const [dd, mm, yy] = dateStr.split('/').map(Number);
        y = yy; m = mm; d = dd;
      } else {
        const dt = new Date(dateStr);
        if (isNaN(dt.getTime())) return null;
        y = dt.getFullYear(); m = dt.getMonth() + 1; d = dt.getDate();
      }
      const local = kind === 'start'
        ? new Date(y, m - 1, d, 0, 0, 0, 0)
        : new Date(y, m - 1, d, 23, 59, 59, 999);
      return local.toISOString();
    };

    const fromIso = from ? toUtcIso(from, 'start') : null;
    const toIso = to ? toUtcIso(to, 'end') : null;
    if (fromIso) params.from = fromIso;
    if (toIso) params.to = toIso;

    this.requestService.searchAdminRequests(params).subscribe({
      next: (res) => {
        this.certifications = res.results || [];
        this.loading = false;
      },
      error: () => {
        this.notificationService.show('Error al cargar las certificaciones', 'error');
        this.loading = false;
      }
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.typeFilter = '';
    this.fromDate = '';
    this.toDate = '';
    this.limit = 5;
    this.applyFilters();
  }

  updateStatus(certId: string, event: Event): void {
    const status = (event.target as HTMLSelectElement).value;
    this.requestService.updateRequestStatus(certId, status).subscribe({
      next: (res) => {
        const index = this.certifications.findIndex(c => c._id === certId);
        if (index !== -1) {
          this.certifications[index] = res.request;
        }
        this.notificationService.show('Estado actualizado correctamente', 'success');
      },
      error: () => this.notificationService.show('Error al actualizar el estado', 'error')
    });
  }

  promptDelete(request: CertificationRequest): void {
    this.requestToDelete = request;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.requestToDelete = null;
  }

  confirmDelete(): void {
    if (!this.requestToDelete) return;

    this.requestService.deleteRequest(this.requestToDelete._id).subscribe({
      next: () => {
        this.certifications = this.certifications.filter(c => c._id !== this.requestToDelete?._id);
        this.notificationService.show('Solicitud eliminada correctamente', 'success');
        this.cancelDelete();
      },
      error: () => {
        this.notificationService.show('Error al eliminar la solicitud', 'error');
        this.cancelDelete();
      }
    });
  }

  downloadCertificate(cert: CertificationRequest): void {
    if (cert.status !== 'Completada') {
      this.notificationService.show('La certificación aún no está completada', 'info');
      return;
    }
    this.requestService.downloadCertificate(cert._id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificacion_${cert.projectName.replace(/[^a-z0-9_\-]/gi,'_')}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        this.notificationService.show('Certificado descargado', 'success');
      },
      error: () => this.notificationService.show('Error al generar el certificado', 'error')
    });
  }
}
