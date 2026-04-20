import { TestBed } from '@angular/core/testing';

import { FrontLayoutService } from './front-layout.service';

describe('FrontLayoutService', () => {
  let service: FrontLayoutService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FrontLayoutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
