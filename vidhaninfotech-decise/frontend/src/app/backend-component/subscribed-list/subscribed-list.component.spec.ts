import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscribedListComponent } from './subscribed-list.component';

describe('SubscribedListComponent', () => {
  let component: SubscribedListComponent;
  let fixture: ComponentFixture<SubscribedListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubscribedListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscribedListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
