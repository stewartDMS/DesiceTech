import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitizationListComponent } from './monitization-list.component';

describe('MonitizationListComponent', () => {
  let component: MonitizationListComponent;
  let fixture: ComponentFixture<MonitizationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MonitizationListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MonitizationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
