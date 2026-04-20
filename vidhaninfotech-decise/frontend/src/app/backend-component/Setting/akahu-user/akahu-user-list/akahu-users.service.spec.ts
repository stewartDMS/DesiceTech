import { TestBed } from '@angular/core/testing';

import { AkahuUsersService } from './akahu-users.service';

describe('AkahuUsersService', () => {
  let service: AkahuUsersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AkahuUsersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
