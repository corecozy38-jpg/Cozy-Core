import { TestBed } from '@angular/core/testing';

import { OrderesService } from './orderes.service';

describe('OrderesService', () => {
  let service: OrderesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrderesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
