import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboradComponent } from './dashborad.component';

describe('DashboradComponent', () => {
  let component: DashboradComponent;
  let fixture: ComponentFixture<DashboradComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboradComponent]
    });
    fixture = TestBed.createComponent(DashboradComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
