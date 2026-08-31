import { Component, OnInit } from '@angular/core';
import { FlotaService } from '../../core/services/flota.service';
import { VehiculoService } from '../../services/vehiculo.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Vehiculo } from '../../core/models/fleet.models';

@Component({
  selector: 'app-documentos',
  templateUrl: './documentos.component.html'
})
export class DocumentosComponent implements OnInit {
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
        console.error('Error al cargar documentos', err);
        this.cargando = false;
      }
    });
  }
}