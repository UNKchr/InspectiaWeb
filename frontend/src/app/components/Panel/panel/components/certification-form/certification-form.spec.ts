import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificationForm } from './certification-form';

describe('CertificationForm', () => {
  let component: CertificationForm;
  let fixture: ComponentFixture<CertificationForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CertificationForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CertificationForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
