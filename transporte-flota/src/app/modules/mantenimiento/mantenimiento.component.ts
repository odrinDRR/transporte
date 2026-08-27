import { Component, OnInit } from '@angular/core';
import { FlotaService } from '../../core/services/flota.service';
import { VehiculoService } from '../../services/vehiculo.service';
import { Vehiculo } from '../../core/models/fleet.models';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-mantenimiento',
  templateUrl: './mantenimiento.component.html'
})
export class MantenimientoComponent implements OnInit {
  vehiculos$!: Observable<Vehiculo[]>;

  constructor(
    public flotaService: FlotaService,
    private vehiculoService: VehiculoService
  ) {}

  ngOnInit(): void {
    this.vehiculos$ = this.vehiculoService.obtenerVehiculos();
  }

  esMantenimientoVencido(fechaStr: string | undefined): boolean {
    if (!fechaStr) return false;
    const fechaMantenimiento = new Date(fechaStr);
    const hoy = new Date('2026-08-20'); // Usamos una fecha de prueba cercana a tus datos
    return fechaMantenimiento < hoy;
  }
}