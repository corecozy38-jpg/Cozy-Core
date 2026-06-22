import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderGuide } from './order-guide';

describe('OrderGuide', () => {
  let component: OrderGuide;
  let fixture: ComponentFixture<OrderGuide>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderGuide]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderGuide);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
