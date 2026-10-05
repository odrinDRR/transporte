import { Component, OnInit } from '@angular/core';
import { FlotaService } from './core/services/flota.service';
import { RolUsuario } from './core/models/fleet.models';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  moduloActivo: string = 'flota';
  isLoggedIn: boolean = false;
  sidebarAbierto: boolean = false;
  isVistaPublica: boolean = false;
  fichaId: number | null = null;

  constructor(public flotaService: FlotaService, private authService: AuthService) {}

  ngOnInit() {
    const params = new URLSearchParams(window.location.search);
    const ficha = params.get('ficha');
    if (ficha) {
      this.isVistaPublica = true;
      this.fichaId = Number(ficha);
      return;
    }

    // Escuchar si hay un usuario logueado para mostrar el sistema
    this.flotaService.rolActual$.subscribe(rol => {
      this.isLoggedIn = !!rol;
    });
  }

  onLogin() {
    // Check security constraints first
    const tienePreguntas = localStorage.getItem('smu_tiene_preguntas') === 'true';
    const debeCambiarClave = localStorage.getItem('smu_debe_cambiar_clave') === 'true';

    if (!tienePreguntas || debeCambiarClave) {
      this.moduloActivo = 'configurar-seguridad';
      return;
    }

    // Lógica para redirigir según el rol al entrar
    this.asignarModuloPorRol();
  }

  onSeguridadCompletada() {
    // Cuando el usuario complete la configuración de seguridad, lo dejamos entrar al sistema normal
    this.asignarModuloPorRol();
  }

  private asignarModuloPorRol() {
    const rol = this.flotaService.rolActual;
    if (rol === 'SUPERVISOR') {
      this.moduloActivo = 'auditoria'; // Este será el módulo de validación visual
    } else {
      this.moduloActivo = 'flota';
    }
  }

  cambiarModulo(modulo: string): void {
    // Prevent navigating away from security screen if not configured
    const tienePreguntas = localStorage.getItem('smu_tiene_preguntas') === 'true';
    const debeCambiarClave = localStorage.getItem('smu_debe_cambiar_clave') === 'true';

    if ((!tienePreguntas || debeCambiarClave) && modulo !== 'configurar-seguridad') {
      this.moduloActivo = 'configurar-seguridad';
      this.sidebarAbierto = false;
      return;
    }

    this.moduloActivo = modulo;
    this.sidebarAbierto = false; // Cerrar el menú al seleccionar una opción en móvil
  }

  toggleSidebar(): void {
    this.sidebarAbierto = !this.sidebarAbierto;
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.flotaService.cerrarSesion();
  }
}