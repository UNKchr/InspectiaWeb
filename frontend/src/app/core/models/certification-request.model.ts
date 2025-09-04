import { User } from "./user.model";

export interface CertificationRequest {
  _id: string;
  user: User; // En la vista de admin, el usuario viene populado.
  certificationType: 'CALIDAD_SOFTWARE' | 'ISO_27001' | 'SEGURIDAD_APP';
  status: 'En proceso' | 'Completada' | 'Rechazada';
  projectName: string;
  projectDescription: string;
  projectUrl: string;
  repoUrl: string;
  companyName?: string;
  companyAddress?: string;
  appPlatform?: 'Web' | 'Mobile' | 'Desktop';
  cost: number;
  createdAt: string;
  updatedAt: string;
}
