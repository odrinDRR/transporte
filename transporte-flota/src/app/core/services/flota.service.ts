import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Vehiculo, Conductor, RolUsuario, RegistroCombustible } from '../models/fleet.models';

@Injectable({ providedIn: 'root' })
export class FlotaService {
  private rolActualSubject = new BehaviorSubject<RolUsuario>('ADMIN');
  public rolActual$ = this.rolActualSubject.asObservable();

  // DATOS DE PRUEBA: FLOTA VEHICULAR
  private vehiculosSubject = new BehaviorSubject<Vehiculo[]>([
    {
      id: 101,
      placa: 'A82-BC3',
      identificador: 'Camión 350 Plataforma',
      marcaModelo: 'Ford Triton V8',
      anio: 2022,
      estado: 'OPERATIVO',
      conductorId: 1, // Asignado a Carlos Mendoza
      vin: 'VIN-9382019283',
      kilometraje: 124500,
      fotos: ['https://images.unsplash.com/photo-1586191582150-137b587399f1?auto=format&fit=crop&w=800&q=80'],
      ultimoServicio: '10/08/2026 - Cambio de aceite y filtros',
      proximoMantenimiento: '2026-11-10',
      seguroRcvVigente: true
    },
    {
      id: 102,
      placa: 'B44-XT1',
      identificador: 'Chuto Carga Pesada',
      marcaModelo: 'Mack Granite MP8',
      anio: 2020,
      estado: 'TALLER',
      conductorId: null, // Sin asignar actualmente
      vin: 'VIN-1029384756',
      kilometraje: 310200,
      fotos: ['https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80'],
      ultimoServicio: '15/07/2026 - Reemplazo de inyectores',
      proximoMantenimiento: '2026-08-15', // Alerta: Mantenimiento vencido
      seguroRcvVigente: true
    },
    {
      id: 103,
      placa: 'AB1-23C',
      identificador: 'Furgón Logística Interna',
      marcaModelo: 'JAC Gallop',
      anio: 2024,
      estado: 'OPERATIVO',
      conductorId: 2, // Asignado a Luis Pérez
      vin: 'VIN-5566778899',
      kilometraje: 45000,
      fotos: ['https://images.unsplash.com/photo-1554344583-11bb587e9142?auto=format&fit=crop&w=800&q=80'],
      ultimoServicio: '01/08/2026 - Revisión general de frenos',
      proximoMantenimiento: '2026-12-01',
      seguroRcvVigente: true
    },
    {
      id: 104,
      placa: 'XYZ-987',
      identificador: 'Camioneta Supervisión',
      marcaModelo: 'Toyota Hilux 4x4',
      anio: 2018,
      estado: 'INACTIVO',
      conductorId: 3, // Asignado a Miguel Torres
      vin: 'VIN-1122334455',
      kilometraje: 420800,
      fotos: ['https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=800&q=80'],
      ultimoServicio: '20/01/2026 - Reconstrucción de caja',
      proximoMantenimiento: '2026-06-20', // Alerta: Mantenimiento muy vencido
      seguroRcvVigente: false // Alerta: Seguro vencido
    }
  ]);
  public vehiculos$ = this.vehiculosSubject.asObservable();

  // DATOS DE PRUEBA: CONDUCTORES
  private conductoresSubject = new BehaviorSubject<Conductor[]>([
    {
      id: 1,
      nombre: 'Carlos Mendoza',
      cedula: 'V-15893201',
      carnet: 'Ficha 442 - Activo',
      vencimientoLicencia: '2028-05-12',
      vencimientoMedico: '2027-01-20',
      fotoUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
      vehiculoAsignadoId: 101,
      activo: true
    },
    {
      id: 2,
      nombre: 'Luis Pérez',
      cedula: 'V-20123456',
      carnet: 'Ficha 105 - Activo',
      vencimientoLicencia: '2026-09-01', // Alerta: Por vencer pronto
      vencimientoMedico: '2026-10-15',
      fotoUrl: 'https://randomuser.me/api/portraits/men/45.jpg',
      vehiculoAsignadoId: 103,
      activo: true
    },
    {
      id: 3,
      nombre: 'Miguel Torres',
      cedula: 'V-18765432',
      carnet: 'Ficha 89 - Permiso',
      vencimientoLicencia: '2025-11-30', // Alerta: Vencida
      vencimientoMedico: '2027-03-10',
      fotoUrl: 'https://randomuser.me/api/portraits/men/22.jpg',
      vehiculoAsignadoId: 104,
      activo: false
    }
  ]);
  public conductores$ = this.conductoresSubject.asObservable();

  // DATOS DE PRUEBA: REGISTROS DE COMBUSTIBLE
  private combustibleSubject = new BehaviorSubject<RegistroCombustible[]>([
    { id: 1, fecha: '2026-08-18', vehiculoId: 101, placa: 'A82-BC3', litros: 80, kilometraje: 124500, costo: 40.00 },
    { id: 2, fecha: '2026-08-17', vehiculoId: 103, placa: 'AB1-23C', litros: 120, kilometraje: 44800, costo: 60.00 },
    { id: 3, fecha: '2026-08-15', vehiculoId: 101, placa: 'A82-BC3', litros: 75, kilometraje: 124100, costo: 37.50 },
    { id: 4, fecha: '2026-08-10', vehiculoId: 102, placa: 'B44-XT1', litros: 250, kilometraje: 310150, costo: 125.00 }
  ]);
  public combustible$ = this.combustibleSubject.asObservable();

  cambiarRol(rol: RolUsuario): void {
    this.rolActualSubject.next(rol);
  }

  get rolActual(): RolUsuario {
    return this.rolActualSubject.value;
  }

  puedeEditarOEliminar(): boolean {
    return this.rolActual === 'ADMIN';
  }

  puedeRegistrarOAsignar(): boolean {
    return this.rolActual === 'ADMIN' || this.rolActual === 'COORDINADOR';
  }

  eliminarVehiculo(id: number): void {
    if (!this.puedeEditarOEliminar()) return;
    this.vehiculosSubject.next(this.vehiculosSubject.value.filter(v => v.id !== id));
  }
}