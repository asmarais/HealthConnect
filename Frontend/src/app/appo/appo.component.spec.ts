import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppoComponent } from './appo.component';

describe('AppoComponent', () => {
  let component: AppoComponent;
  let fixture: ComponentFixture<AppoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AppoComponent]
    });
    fixture = TestBed.createComponent(AppoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
