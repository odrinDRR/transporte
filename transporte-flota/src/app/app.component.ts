import { Component, OnInit } from '@angular/core';
import { FlotaService } from './core/services/flota.service';
import { RolUsuario } from './core/models/fleet.models';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  moduloActivo: string = 'flota';
  isLoggedIn: boolean = false;
  sidebarAbierto: boolean = false;

  constructor(public flotaService: FlotaService) {}

  ngOnInit() {
    // Escuchar si hay un usuario logueado para mostrar el sistema
    this.flotaService.rolActual$.subscribe(rol => {
      this.isLoggedIn = !!rol;
    });
  }

  onLogin() {
    // Lógica para redirigir según el rol al entrar
    const rol = this.flotaService.rolActual;
    if (rol === 'EMPLEADO') {
      this.moduloActivo = 'inspeccion';
    } else if (rol === 'SUPERVISOR') {
      this.moduloActivo = 'auditoria'; // Este será el módulo de validación visual
    } else {
      this.moduloActivo = 'flota';
    }
  }

  cambiarModulo(modulo: string): void {
    this.moduloActivo = modulo;
    this.sidebarAbierto = false; // Cerrar el menú al seleccionar una opción en móvil
  }

  toggleSidebar(): void {
    this.sidebarAbierto = !this.sidebarAbierto;
  }

  cerrarSesion(): void {
    this.flotaService.cerrarSesion();
  }
}