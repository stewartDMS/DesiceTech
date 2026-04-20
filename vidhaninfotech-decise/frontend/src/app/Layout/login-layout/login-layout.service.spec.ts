import { TestBed } from '@angular/core/testing';

import { LoginLayoutService } from './login-layout.service';

describe('LoginLayoutService', () => {
  let service: LoginLayoutService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoginLayoutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
