import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Vehiculo, Conductor, RolUsuario, RegistroCombustible } from '../models/fleet.models';

@Injectable({ providedIn: 'root' })
export class FlotaService {
  agregarVehiculo(arg0: { placa: string; identificador: string; marcaModelo: string; anio: number; vin: string; kilometraje: number; estado: "OPERATIVO" | "TALLER" | "INACTIVO"; conductorId: number | null; ultimoServicio: string; fotos: string[]; }) {
    throw new Error('Method not implemented.');
  }
private rolActualSubject = new BehaviorSubject<RolUsuario | null>(null);
  public rolActual$ = this.rolActualSubject.asObservable();

  get rolActual(): RolUsuario | null {
    return this.rolActualSubject.value;
  }

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
      fotos: ['/assets/images/camion-350.jpg'],
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
      fotos: ['/assets/images/furgon.jpg'],
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
      fotos: ['/assets/images/pickup.jpg'],
      ultimoServicio: '20/01/2026 - Reconstrucción de caja',
      proximoMantenimiento: '2026-06-20', // Alerta: Mantenimiento muy vencido
      seguroRcvVigente: false // Alerta: Seguro vencido
    }
  ]);
  public vehiculos$ = this.vehiculosSubject.asObservable();

  // DATOS DE PRUEBA: CONDUCTORES
  // Actualización de los datos de prueba en FlotaService
  private conductoresSubject = new BehaviorSubject<Conductor[]>([
    {
      id: 1,
      nombre: 'Carlos Mendoza',
      cedula: 'V-15893201',
      fichaNumerica: '442', // Ficha asignada
      vencimientoLicencia: '2028-05-12',
      vencimientoMedico: '2027-01-20',
      fotoUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
      vehiculoAsignadoId: 101,
      activo: true,
      inspeccionAbierta: true // Prueba: Tiene ruta abierta
    },
    {
      id: 2,
      nombre: 'Luis Pérez',
      cedula: 'V-20123456',
      fichaNumerica: '105',
      vencimientoLicencia: '2026-09-01',
      vencimientoMedico: '2026-10-15',
      fotoUrl: 'https://randomuser.me/api/portraits/men/45.jpg',
      vehiculoAsignadoId: null, // Sin asignar
      activo: true,
      inspeccionAbierta: false // Prueba: No tiene ruta abierta
    }
  ]);

  // --- MÉTODO PARA ASIGNAR POR FICHA O CÉDULA ---
  asignarUnidad(idVehiculo: number, terminoBusqueda: string): string {
    const conductores = this.conductoresSubject.value;
    const vehiculos = this.vehiculosSubject.value;
    
    // 1. Buscamos al conductor coincidiendo exactamente con Ficha o Cédula
    const conductorEncontrado = conductores.find(c => 
      c.cedula === terminoBusqueda.trim() || c.fichaNumerica === terminoBusqueda.trim()
    );

    if (!conductorEncontrado) {
      return 'ERROR: No se encontró ningún conductor con esa Cédula o Ficha.';
    }

    // 2. Aplicamos la asignación cruzada
    const idxConductor = conductores.findIndex(c => c.id === conductorEncontrado.id);
    const idxVehiculo = vehiculos.findIndex(v => v.id === idVehiculo);

    if (idxVehiculo !== -1) {
      // Liberamos al conductor anterior si lo hubiera
      const conductorAnteriorId = vehiculos[idxVehiculo].conductorId;
      if (conductorAnteriorId) {
        const idxAnterior = conductores.findIndex(c => c.id === conductorAnteriorId);
        if (idxAnterior !== -1) conductores[idxAnterior].vehiculoAsignadoId = null;
      }

      // Asignamos al nuevo
      vehiculos[idxVehiculo].conductorId = conductorEncontrado.id;
      conductores[idxConductor].vehiculoAsignadoId = idVehiculo;

      this.conductoresSubject.next([...conductores]);
      this.vehiculosSubject.next([...vehiculos]);
      
      return `ÉXITO: Unidad asignada a ${conductorEncontrado.nombre} (Ficha: ${conductorEncontrado.fichaNumerica})`;
    }
    
    return 'ERROR: Vehículo no encontrado.';
  }
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

  puedeEditarOEliminar(): boolean {
    const rol = this.rolActualSubject.value;
    return rol === 'ADMIN' || rol === 'COORDINADOR';
  }

  puedeRegistrarOAsignar(): boolean {
    const rol = this.rolActualSubject.value;
    return rol === 'ADMIN' || rol === 'COORDINADOR' || rol === 'EMPLEADO';
  }

  eliminarVehiculo(id: number): void {
    this.vehiculosSubject.next(this.vehiculosSubject.value.filter(v => v.id !== id));
  }

  iniciarSesion(rol: RolUsuario): void {
    this.rolActualSubject.next(rol);
  }

  cerrarSesion(): void {
    this.rolActualSubject.next(null);
  }
}