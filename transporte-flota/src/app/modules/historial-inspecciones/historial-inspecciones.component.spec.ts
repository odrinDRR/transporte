import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialInspeccionesComponent } from './historial-inspecciones.component';

describe('HistorialInspeccionesComponent', () => {
  let component: HistorialInspeccionesComponent;
  let fixture: ComponentFixture<HistorialInspeccionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HistorialInspeccionesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HistorialInspeccionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
