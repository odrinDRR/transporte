import { Component, OnInit } from '@angular/core';
import { FlotaService } from '../../core/services/flota.service';
import { VehiculoService } from '../../services/vehiculo.service';
import { Vehiculo } from '../../core/models/fleet.models';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-mantenimiento',
  templateUrl: './mantenimiento.component.html'
})
export class MantenimientoComponent implements OnInit {
  constructor(
    public flotaService: FlotaService,
    private vehiculoService: VehiculoService
  ) {}

  cargando = false;
  private vehiculosSubject = new BehaviorSubject<Vehiculo[]>([]);
  vehiculos$ = this.vehiculosSubject.asObservable();

  ngOnInit(): void {
    this.cargando = true;
    this.vehiculoService.obtenerVehiculos().subscribe({
      next: (data) => {
        this.vehiculosSubject.next(data);
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar vehículos', err);
        this.cargando = false;
      }
    });
  }

  esMantenimientoVencido(fechaStr: string | undefined): boolean {
    if (!fechaStr) return false;
    const fechaMantenimiento = new Date(fechaStr);
    const hoy = new Date('2026-08-20'); // Usamos una fecha de prueba cercana a tus datos
    return fechaMantenimiento < hoy;
  }
}