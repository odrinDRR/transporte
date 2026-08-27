import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Vehiculo, Conductor, RolUsuario, RegistroCombustible } from '../models/fleet.models';

@Injectable({ providedIn: 'root' })
export class FlotaService {

  // CONTROL DE ROLES Y SESIÓN
  private rolActualSubject = new BehaviorSubject<RolUsuario | null>('ADMIN'); // Por defecto en ADMIN para pruebas
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
      tipoVehiculo: 'Camión Ligero',
      color: 'Blanco',
      capacidadCarga: 3500,
      anio: 2022,
      estado: 'OPERATIVO',
      conductorId: 1, // Carlos Mendoza
      vin: 'VIN-9382019283',
      kilometraje: 124500,
      fotos: ['https://picsum.photos/600/400?random=1'],
      ultimoServicio: '10/08/2026 - Cambio de aceite y filtros',
      proximoMantenimiento: '2026-11-10',
      seguroRcvVigente: true
    },
    {
      id: 102,
      placa: 'B44-XT1',
      identificador: 'Chuto Carga Pesada',
      marcaModelo: 'Mack Granite MP8',
      tipoVehiculo: 'Chuto',
      color: 'Gris',
      capacidadCarga: 25000,
      anio: 2020,
      estado: 'TALLER',
      conductorId: null, // Sin asignar
      vin: 'VIN-1029384756',
      kilometraje: 310200,
      fotos: ['https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80'],
      ultimoServicio: '15/07/2026 - Reemplazo de inyectores',
      proximoMantenimiento: '2026-08-15',
      seguroRcvVigente: true
    },
    {
      id: 103,
      placa: 'AB1-23C',
      identificador: 'Furgón Logística Interna',
      marcaModelo: 'JAC Gallop',
      tipoVehiculo: 'Furgón',
      color: 'Azul',
      capacidadCarga: 5000,
      anio: 2024,
      estado: 'OPERATIVO',
      conductorId: 2, // Luis Pérez
      vin: 'VIN-5566778899',
      kilometraje: 45000,
      fotos: ['https://picsum.photos/600/400?random=3'],
      ultimoServicio: '01/08/2026 - Revisión general de frenos',
      proximoMantenimiento: '2026-12-01',
      seguroRcvVigente: true
    },
    {
      id: 104,
      placa: 'XYZ-987',
      identificador: 'Camioneta Supervisión',
      marcaModelo: 'Toyota Hilux 4x4',
      tipoVehiculo: 'Camioneta',
      color: 'Plata',
      capacidadCarga: 1000,
      anio: 2018,
      estado: 'INACTIVO',
      conductorId: null,
      vin: 'VIN-1122334455',
      kilometraje: 420800,
      fotos: ['https://picsum.photos/600/400?random=4'],
      ultimoServicio: '20/01/2026 - Reconstrucción de caja',
      proximoMantenimiento: '2026-06-20',
      seguroRcvVigente: false
    }
  ]);
  public vehiculos$: Observable<Vehiculo[]> = this.vehiculosSubject.asObservable();

  // DATOS DE PRUEBA: CONDUCTORES
  private conductoresSubject = new BehaviorSubject<Conductor[]>([
    {
      id: 1,
      nombre: 'Carlos Mendoza',
      cedula: 'V-15893201',
      fichaNumerica: '442',
      vencimientoLicencia: '2028-05-12',
      vencimientoMedico: '2027-01-20',
      fotoUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
      vehiculoAsignadoId: 101,
      activo: true,
      inspeccionAbierta: true
    },
    {
      id: 2,
      nombre: 'Luis Pérez',
      cedula: 'V-20123456',
      fichaNumerica: '105',
      vencimientoLicencia: '2026-09-01',
      vencimientoMedico: '2026-10-15',
      fotoUrl: 'https://randomuser.me/api/portraits/men/45.jpg',
      vehiculoAsignadoId: 103,
      activo: true,
      inspeccionAbierta: false
    }
  ]);
  public conductores$: Observable<Conductor[]> = this.conductoresSubject.asObservable();

  // DATOS DE PRUEBA: REGISTROS DE COMBUSTIBLE
  private combustibleSubject = new BehaviorSubject<RegistroCombustible[]>([
    { id: 1, fecha: '2026-08-18', vehiculoId: 101, placa: 'A82-BC3', litros: 80, kilometraje: 124500, costo: 40.00 },
    { id: 2, fecha: '2026-08-17', vehiculoId: 103, placa: 'AB1-23C', litros: 120, kilometraje: 44800, costo: 60.00 },
    { id: 3, fecha: '2026-08-15', vehiculoId: 101, placa: 'A82-BC3', litros: 75, kilometraje: 124100, costo: 37.50 },
    { id: 4, fecha: '2026-08-10', vehiculoId: 102, placa: 'B44-XT1', litros: 250, kilometraje: 310150, costo: 125.00 }
  ]);
  public combustible$: Observable<RegistroCombustible[]> = this.combustibleSubject.asObservable();

  constructor() {}

  // MÉTODOS DE GESTIÓN DE VEHÍCULOS
  agregarVehiculo(nuevoVehiculo: Vehiculo | Omit<Vehiculo, 'id'>): void {
    const vehiculosActuales = this.vehiculosSubject.value;
    const nuevoId = 'id' in nuevoVehiculo && nuevoVehiculo.id 
      ? nuevoVehiculo.id 
      : (vehiculosActuales.length > 0 ? Math.max(...vehiculosActuales.map(v => v.id)) + 1 : 101);
    
    const vehiculoCompleto: Vehiculo = {
      ...nuevoVehiculo,
      id: nuevoId
    };

    this.vehiculosSubject.next([vehiculoCompleto, ...vehiculosActuales]);
  }

  eliminarVehiculo(id: number): void {
    this.vehiculosSubject.next(this.vehiculosSubject.value.filter(v => v.id !== id));
  }

  // ASIGNACIÓN DE UNIDAD POR FICHA O CÉDULA
  asignarUnidad(idVehiculo: number, terminoBusqueda: string): string {
    const conductores = this.conductoresSubject.value;
    const vehiculos = this.vehiculosSubject.value;
    
    const conductorEncontrado = conductores.find(c => 
      c.cedula === terminoBusqueda.trim() || c.fichaNumerica === terminoBusqueda.trim()
    );

    if (!conductorEncontrado) {
      return 'ERROR: No se encontró ningún conductor con esa Cédula o Ficha.';
    }

    const idxConductor = conductores.findIndex(c => c.id === conductorEncontrado.id);
    const idxVehiculo = vehiculos.findIndex(v => v.id === idVehiculo);

    if (idxVehiculo !== -1) {
      const conductorAnteriorId = vehiculos[idxVehiculo].conductorId;
      if (conductorAnteriorId) {
        const idxAnterior = conductores.findIndex(c => c.id === conductorAnteriorId);
        if (idxAnterior !== -1) conductores[idxAnterior].vehiculoAsignadoId = null;
      }

      vehiculos[idxVehiculo].conductorId = conductorEncontrado.id;
      conductores[idxConductor].vehiculoAsignadoId = idVehiculo;

      this.conductoresSubject.next([...conductores]);
      this.vehiculosSubject.next([...vehiculos]);
      
      return `ÉXITO: Unidad asignada a ${conductorEncontrado.nombre} (Ficha: ${conductorEncontrado.fichaNumerica})`;
    }
    
    return 'ERROR: Vehículo no encontrado.';
  }

  // PERMISOS Y ROLES
  cambiarRol(rol: RolUsuario): void {
    this.rolActualSubject.next(rol);
  }

  puedeEditarOEliminar(): boolean {
    const rol = this.rolActualSubject.value;
    return rol === 'ADMIN' || rol === 'COORDINADOR' || rol === null;
  }

  puedeRegistrarOAsignar(): boolean {
    const rol = this.rolActualSubject.value;
    return rol === 'ADMIN' || rol === 'COORDINADOR' || rol === 'EMPLEADO' || rol === null;
  }

  iniciarSesion(rol: RolUsuario): void {
    this.rolActualSubject.next(rol);
  }

  cerrarSesion(): void {
    this.rolActualSubject.next(null);
  }
}