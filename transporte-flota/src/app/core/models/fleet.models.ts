// Actualizamos los roles según la nueva lógica de negocio
export type RolUsuario = 'ADMIN' | 'COORDINADOR' | 'EMPLEADO' | 'SUPERVISOR';
export type EstadoVehiculo = 'OPERATIVO' | 'TALLER' | 'INACTIVO';

export interface Vehiculo {
  id: number;
  placa: string;
  identificador: string;
  marcaModelo: string;
  anio: number;
  estado: EstadoVehiculo;
  conductorId: number | null;
  vin: string;
  kilometraje: number;
  fotos: string[];
  ultimoServicio?: string;
  proximoMantenimiento?: string;
  seguroRcvVigente: boolean;
}

export interface Conductor {
  id: number;
  nombre: string;
  cedula: string;
  fichaNumerica: string;
  vencimientoLicencia: string;
  vencimientoMedico: string;
  fotoUrl: string;
  vehiculoAsignadoId: number | null;
  activo: boolean;
  inspeccionAbierta?: boolean;
}

export interface RegistroCombustible {
  id: number;
  fecha: string;
  vehiculoId: number;
  placa: string;
  litros: number;
  kilometraje: number;
  costo: number;
}