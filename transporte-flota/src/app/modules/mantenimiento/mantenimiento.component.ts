import { Component } from '@angular/core';
import { FlotaService } from '../../core/services/flota.service';

@Component({
  selector: 'app-mantenimiento',
  templateUrl: './mantenimiento.component.html'
})
export class MantenimientoComponent {
  constructor(public flotaService: FlotaService) {}

  esMantenimientoVencido(fechaStr: string | undefined): boolean {
    if (!fechaStr) return false;
    const fechaMantenimiento = new Date(fechaStr);
    const hoy = new Date('2026-08-20'); // Usamos una fecha de prueba cercana a tus datos
    return fechaMantenimiento < hoy;
  }
}