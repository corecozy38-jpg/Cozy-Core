import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckOut } from './check-out';

describe('CheckOut', () => {
  let component: CheckOut;
  let fixture: ComponentFixture<CheckOut>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckOut]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckOut);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
