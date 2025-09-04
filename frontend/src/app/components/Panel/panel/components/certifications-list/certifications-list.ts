import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RequestService } from '../../../../../core/services/request.service';
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

  constructor(
    private requestService: RequestService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadCertifications();
  }

  loadCertifications(): void {
    this.loading = true;
    const request = this.isAdminView 
      ? this.requestService.getAllRequests() 
      : this.requestService.getMyRequests();

    request.subscribe({
      next: (data) => {
        this.certifications = data;
        this.loading = false;
      },
      error: (err) => {
        this.notificationService.show('Error al cargar las certificaciones', 'error');
        this.loading = false;
      }
    });
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
}
