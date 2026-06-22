import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericDropList } from './generic-drop-list';

describe('GenericDropList', () => {
  let component: GenericDropList;
  let fixture: ComponentFixture<GenericDropList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenericDropList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericDropList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
