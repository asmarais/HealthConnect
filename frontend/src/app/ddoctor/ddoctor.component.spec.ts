import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DDoctorComponent } from './ddoctor.component';

describe('DDoctorComponent', () => {
  let component: DDoctorComponent;
  let fixture: ComponentFixture<DDoctorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DDoctorComponent]
    });
    fixture = TestBed.createComponent(DDoctorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
