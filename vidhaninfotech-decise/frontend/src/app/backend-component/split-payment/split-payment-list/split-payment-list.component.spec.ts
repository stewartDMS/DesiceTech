import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SplitPaymentListComponent } from './split-payment-list.component';

describe('SplitPaymentListComponent', () => {
  let component: SplitPaymentListComponent;
  let fixture: ComponentFixture<SplitPaymentListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SplitPaymentListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SplitPaymentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
