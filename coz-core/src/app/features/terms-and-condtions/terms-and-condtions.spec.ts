import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TermsAndCondtions } from './terms-and-condtions';

describe('TermsAndCondtions', () => {
  let component: TermsAndCondtions;
  let fixture: ComponentFixture<TermsAndCondtions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TermsAndCondtions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TermsAndCondtions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
