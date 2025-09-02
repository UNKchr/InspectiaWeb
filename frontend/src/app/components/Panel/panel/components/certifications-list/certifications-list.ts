import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-certifications-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './certifications-list.html',
  styleUrl: './certifications-list.css'
})
export class CertificationsList {
  @Input() certifications: any[] = [];
  @Input() isAdminView: boolean = false;
}
