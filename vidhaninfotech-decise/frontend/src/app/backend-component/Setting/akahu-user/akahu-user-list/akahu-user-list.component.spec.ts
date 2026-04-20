import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AkahuUserListComponent } from './akahu-user-list.component';

describe('AkahuUserListComponent', () => {
  let component: AkahuUserListComponent;
  let fixture: ComponentFixture<AkahuUserListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AkahuUserListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AkahuUserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
