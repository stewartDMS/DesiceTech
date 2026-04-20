import { TestBed } from '@angular/core/testing';

import { SplitPaymentService } from './split-payment.service';

describe('SplitPaymentService', () => {
  let service: SplitPaymentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SplitPaymentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
