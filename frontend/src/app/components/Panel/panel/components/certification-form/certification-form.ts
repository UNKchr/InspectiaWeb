import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RequestService } from '../../../../../core/services/request.service';
import { Auth } from '../../../../../core/services/auth';
import { NotificationService } from '../../../../../core/services/notification.service';

@Component({
  selector: 'app-certification-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './certification-form.html',
  styleUrls: ['./certification-form.css']
})
export class CertificationForm {
  private requestService = inject(RequestService);
  private authService = inject(Auth);
  private notificationService = inject(NotificationService);

  // Precios simulados para mostrar en el frontend
  certificationCosts = {
    'CALIDAD_SOFTWARE': 1000,
    'ISO_27001': 1500,
    'SEGURIDAD_APP': 2000
  };

  // Modelo del formulario que coincide con el backend
  certificationData = {
    certificationType: '',
    projectName: '',
    projectDescription: '',
    projectUrl: '',
    repoUrl: '',
    companyName: '',
    companyAddress: '',
    appPlatform: ''
  };

  // Propiedades para manejar el estado de la UI
  isSubmitting = false;

  get selectedCost(): number {
    const type = this.certificationData.certificationType as keyof typeof this.certificationCosts;
    return this.certificationCosts[type] || 0;
  }

  onSubmitCertification(): void {
    console.log('[CertificationForm] Iniciando envío de formulario...');
    if (this.isSubmitting) {
      console.log('[CertificationForm] Envío ya en progreso. Abortando.');
      return;
    }

    this.isSubmitting = true;
    console.log('[CertificationForm] Datos a enviar:', this.certificationData);

    this.requestService.createRequest(this.certificationData).subscribe({
      next: (response) => {
        console.log('[CertificationForm] Solicitud creada exitosamente. Respuesta:', response);
        this.notificationService.show(response.message, 'success');
        // Actualizamos el saldo del usuario en el frontend a través del servicio de Auth
        this.authService.updateUserBalance(response.newSaldo);
        this.resetForm();
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('[CertificationForm] Error al crear la solicitud:', err);
        this.notificationService.show(err.error.message || 'Ocurrió un error al crear la solicitud.', 'error');
        this.isSubmitting = false;
      }
    });
  }

  resetForm(): void {
    this.certificationData = {
      certificationType: '',
      projectName: '',
      projectDescription: '',
      projectUrl: '',
      repoUrl: '',
      companyName: '',
      companyAddress: '',
      appPlatform: ''
    };
  }
}
