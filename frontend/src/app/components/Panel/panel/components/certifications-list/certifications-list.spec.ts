import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificationsList } from './certifications-list';

describe('CertificationsList', () => {
  let component: CertificationsList;
  let fixture: ComponentFixture<CertificationsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CertificationsList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CertificationsList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
