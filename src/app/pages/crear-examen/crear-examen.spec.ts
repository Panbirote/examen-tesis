import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearExamen } from './crear-examen';

describe('CrearExamen', () => {
  let component: CrearExamen;
  let fixture: ComponentFixture<CrearExamen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearExamen]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearExamen);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
