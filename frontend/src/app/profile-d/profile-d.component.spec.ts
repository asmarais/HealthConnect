import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileDComponent } from './profile-d.component';

describe('ProfileDComponent', () => {
  let component: ProfileDComponent;
  let fixture: ComponentFixture<ProfileDComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProfileDComponent]
    });
    fixture = TestBed.createComponent(ProfileDComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
