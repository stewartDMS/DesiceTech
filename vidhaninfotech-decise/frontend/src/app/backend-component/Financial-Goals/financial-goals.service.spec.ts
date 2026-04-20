import { TestBed } from '@angular/core/testing';

import { FinancialGoalsService } from './financial-goals.service';

describe('FinancialGoalsService', () => {
  let service: FinancialGoalsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FinancialGoalsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
