import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfesorHome } from './profesor-home';

describe('ProfesorHome', () => {
  let component: ProfesorHome;
  let fixture: ComponentFixture<ProfesorHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfesorHome]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfesorHome);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
