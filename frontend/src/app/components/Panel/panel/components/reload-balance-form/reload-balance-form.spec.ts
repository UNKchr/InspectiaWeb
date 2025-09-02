import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReloadBalanceForm } from './reload-balance-form';

describe('ReloadBalanceForm', () => {
  let component: ReloadBalanceForm;
  let fixture: ComponentFixture<ReloadBalanceForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReloadBalanceForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReloadBalanceForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
