import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdatetodoComponent } from './updatetodo.component';

describe('UpdatetodoComponent', () => {
  let component: UpdatetodoComponent;
  let fixture: ComponentFixture<UpdatetodoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdatetodoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdatetodoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
