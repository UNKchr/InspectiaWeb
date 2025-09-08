import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReloadBalanceToUser } from './reload-balance-to-user';

describe('ReloadBalanceToUser', () => {
  let component: ReloadBalanceToUser;
  let fixture: ComponentFixture<ReloadBalanceToUser>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReloadBalanceToUser]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReloadBalanceToUser);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
