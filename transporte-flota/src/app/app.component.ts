import { Component } from '@angular/core';
import { FlotaService } from './core/services/flota.service';
import { RolUsuario } from './core/models/fleet.models';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  moduloActivo: string = 'flota';

  constructor(public flotaService: FlotaService) {}

  cambiarModulo(modulo: string): void {
    this.moduloActivo = modulo;
  }

  alCambiarRol(event: Event): void {
    const rol = (event.target as HTMLSelectElement).value as RolUsuario;
    this.flotaService.cambiarRol(rol);
    if (rol === 'CONDUCTOR') {
      this.moduloActivo = 'inspeccion';
    }
  }
}