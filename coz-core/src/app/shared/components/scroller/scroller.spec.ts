import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Scroller } from './scroller';

describe('Scroller', () => {
  let component: Scroller;
  let fixture: ComponentFixture<Scroller>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Scroller]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Scroller);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
