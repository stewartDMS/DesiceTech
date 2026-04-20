import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitizationCreateComponent } from './monitization-create.component';

describe('MonitizationCreateComponent', () => {
  let component: MonitizationCreateComponent;
  let fixture: ComponentFixture<MonitizationCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MonitizationCreateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MonitizationCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
