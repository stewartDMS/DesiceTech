import { TestBed } from '@angular/core/testing';

import { CoreInterceptorService } from './core-interceptor.service';

describe('CoreInterceptorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CoreInterceptorService = TestBed.get(CoreInterceptorService);
    expect(service).toBeTruthy();
  });
});
