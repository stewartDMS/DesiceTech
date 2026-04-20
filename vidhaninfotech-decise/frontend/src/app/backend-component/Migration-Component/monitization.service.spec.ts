import { TestBed } from '@angular/core/testing';

import { MonitizationService } from './monitization.service';

describe('MonitizationService', () => {
  let service: MonitizationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MonitizationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
