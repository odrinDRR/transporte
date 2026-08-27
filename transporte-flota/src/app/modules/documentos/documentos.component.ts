import { Component, OnInit } from '@angular/core';
import { FlotaService } from '../../core/services/flota.service';
import { VehiculoService } from '../../services/vehiculo.service';
import { Observable } from 'rxjs';
import { Vehiculo } from '../../core/models/fleet.models';

@Component({
  selector: 'app-documentos',
  templateUrl: './documentos.component.html'
})
export class DocumentosComponent implements OnInit {
  vehiculos$!: Observable<Vehiculo[]>;

  constructor(
    public flotaService: FlotaService,
    private vehiculoService: VehiculoService
  ) {}

  ngOnInit(): void {
    this.vehiculos$ = this.vehiculoService.obtenerVehiculos();
  }
}