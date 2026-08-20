import { Component } from '@angular/core';
import { FlotaService } from '../../core/services/flota.service';
import { Conductor, Vehiculo } from '../../core/models/fleet.models';

@Component({
  selector: 'app-conductores',
  templateUrl: './conductores.component.html'
})
export class ConductoresComponent {
  constructor(public flotaService: FlotaService) {}

  obtenerPlacaAsignada(idVehiculo: number | null, vehiculos: Vehiculo[]): string {
    if (!idVehiculo) return 'Ninguno';
    const v = vehiculos.find(veh => veh.id === idVehiculo);
    return v ? v.placa : 'Desconocido';
  }
}