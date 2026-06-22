import { TestBed } from '@angular/core/testing';

import { GustService } from './gust.service';

describe('GustService', () => {
  let service: GustService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GustService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
