import { Component, OnInit } from '@angular/core';
import { FlotaService } from '../../core/services/flota.service';
import { RolUsuario } from '../../core/models/fleet.models';

@Component({
  selector: 'app-aprobaciones',
  templateUrl: './aprobaciones.component.html'
})
export class AprobacionesComponent implements OnInit {
  solicitudesPendientes = [
    { id: 1, nombre: 'María', apellido: 'Gómez', cedula: 'V-22334455', cargo: 'EMPLEADO', fecha: '21-08-2026' },
    { id: 2, nombre: 'José', apellido: 'Rojas', cedula: 'V-19887766', cargo: 'CONDUCTOR', fecha: '21-08-2026' },
    { id: 3, nombre: 'Ana', apellido: 'Silva', cedula: 'V-17654321', cargo: 'SUPERVISOR', fecha: '20-08-2026' }
  ];

  solicitudesVisibles: any[] = [];
  rolActual: RolUsuario | null = null;

  constructor(public flotaService: FlotaService) {}

  ngOnInit(): void {
    this.flotaService.rolActual$.subscribe(rol => {
      this.rolActual = rol;
      this.filtrarPorNivelDeAcceso();
    });
  }

  filtrarPorNivelDeAcceso(): void {
    if (this.rolActual === 'ADMIN' || this.rolActual === 'COORDINADOR') {
      this.solicitudesVisibles = [...this.solicitudesPendientes];
    } else if (this.rolActual === 'SUPERVISOR') {
      this.solicitudesVisibles = this.solicitudesPendientes.filter(s => s.cargo === 'EMPLEADO' || s.cargo === 'CONDUCTOR');
    } else {
      this.solicitudesVisibles = [];
    }
  }

  aprobar(id: number, nombre: string): void {
    if (confirm(`¿Estás seguro de APROBAR el acceso para ${nombre}?`)) {
      this.solicitudesPendientes = this.solicitudesPendientes.filter(s => s.id !== id);
      this.filtrarPorNivelDeAcceso();
      alert('Usuario aprobado y notificado. Ya puede iniciar sesión.');
    }
  }

  rechazar(id: number): void {
    if (confirm('¿Deseas RECHAZAR y eliminar esta solicitud?')) {
      this.solicitudesPendientes = this.solicitudesPendientes.filter(s => s.id !== id);
      this.filtrarPorNivelDeAcceso();
    }
  }
}