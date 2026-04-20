import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionUserListComponent } from './transaction-user-list.component';

describe('TransactionUserListComponent', () => {
  let component: TransactionUserListComponent;
  let fixture: ComponentFixture<TransactionUserListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransactionUserListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionUserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
