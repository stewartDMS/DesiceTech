import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionAdminListComponent } from './transaction-admin-list.component';

describe('TransactionAdminListComponent', () => {
  let component: TransactionAdminListComponent;
  let fixture: ComponentFixture<TransactionAdminListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransactionAdminListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionAdminListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
