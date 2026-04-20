import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SplitPaymentViewComponent } from './split-payment-view.component';

describe('SplitPaymentViewComponent', () => {
  let component: SplitPaymentViewComponent;
  let fixture: ComponentFixture<SplitPaymentViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SplitPaymentViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SplitPaymentViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
