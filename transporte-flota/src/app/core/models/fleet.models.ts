// Reemplaza tu RolUsuario actual por este:
export type RolUsuario = 'ADMIN' | 'COORDINADOR' | 'SUPERVISOR' | 'EMPLEADO' | null;

export interface Vehiculo {
  id: number;
  placa: string;
  identificador: string;
  marcaModelo: string;
  anio: number;
  vin: string;
  kilometraje: number;
  estado: 'OPERATIVO' | 'TALLER' | 'INACTIVO';
  conductorId: number | null;
  fotos: string[];
  
  // --- Campos opcionales agregados ---
  color?: string;
  tipoVehiculo?: string;
  capacidadCarga?: number;
  seguroRcvVigente?: boolean;
  ultimoServicio?: string;
  
  // ¡Esta es la propiedad que resolvía tu error de compilación actual!
  proximoMantenimiento?: string; 
}

export interface Conductor {
  id: number;
  nombre: string;
  cedula?: string;
  fichaNumerica?: string;
  telefono?: string;
  licenciaVigente?: boolean;
  vencimientoLicencia?: string;
  vencimientoMedico?: string;
  fotoUrl?: string;
  vehiculoAsignadoId?: number | null;
  activo?: boolean;
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