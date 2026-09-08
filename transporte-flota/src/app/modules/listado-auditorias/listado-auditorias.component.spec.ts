import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListadoAuditoriasComponent } from './listado-auditorias.component';

describe('ListadoAuditoriasComponent', () => {
  let component: ListadoAuditoriasComponent;
  let fixture: ComponentFixture<ListadoAuditoriasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListadoAuditoriasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListadoAuditoriasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
