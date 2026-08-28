// Roles según lógica de negocio
export type RolUsuario = 'ADMIN' | 'COORDINADOR' | 'EMPLEADO' | 'SUPERVISOR' | 'CONDUCTOR' | null;

// Estados de vehículo unificados
export type EstadoVehiculo = 'OPERATIVO' | 'TALLER' | 'INACTIVO' | 'INOPERATIVO';

export interface Responsable {
  nombre: string;
  ci: string;
  telefono: string;
}

export interface FotosFichaTecnica {
  vistaFrontal?: string;
  vistaTrasera?: string;
  vistaLateralDerecha?: string;
  vistaLateralIzquierda?: string;
  vistaSerialCarroceria?: string;
  vistaNumeroBien?: string;
  [key: string]: string | undefined; // Permite indexación dinámica segura
}

// Declaración única y consolidada de Vehiculo
export interface Vehiculo {
  id: number;
  placa: string;
  identificador?: string;
  marca?: string;
  modelo?: string;
  marcaModelo?: string;
  tipo?: string;
  tipoVehiculo?: string;
  anio?: number;
  vin?: string; // Serial de Carrocería
  kilometraje?: number;
  estado: EstadoVehiculo;
  conductorId?: number | null;
  fotos?: string[];
  fotosEstructuradas?: FotosFichaTecnica;
  urlFotoPerfil?: string;
  ultimoServicio?: string;
  proximoMantenimiento?: string;
  seguroRcvVigente?: boolean;
  color?: string;
  capacidadCarga?: number;
  numeroBien?: string; // N° Bien Nacional
  dependencia?: string;
  observaciones?: string;
  responsableVerificacion?: Responsable;
  responsableVehiculo?: Responsable;
  fechaRegistro?: string;
  horaRegistro?: string;
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

export interface Inspeccion {
  id?: number;
  fecha: string;
  kilometraje: number | null;
  carroceriaOk: boolean;
  lucesOk: boolean;
  cinturonesOk: boolean;
  tableroOk: boolean;
  extintorVigente: boolean;
  nivelAceiteOk: boolean;
  refrigeranteOk: boolean;
  liquidoFrenosOk: boolean;
  dictamen: string;
  serialOk: boolean;
  vidriosOk: boolean;
  latoneriaOk: boolean;
  pinturaOk: boolean;
  parabrisasOk: boolean;
  cauchosOk: boolean;
  observaciones: string;
  inspectorFirma: string;
  tipo?: string;
  vehiculoId?: number;
  fotosExterior?: string[];
  fotosInterior?: string[];
}

export interface Mantenimiento {
  id?: number;
  vehiculoId: number;
  fecha: string;
  tipo: 'PREVENTIVO' | 'CORRECTIVO';
  descripcion: string;
  costo?: number;
  taller?: string;
  kilometraje: number;
}

export interface Documento {
  id?: number;
  vehiculoId?: number;
  conductorId?: number;
  tipoDocumento: string;
  numero: string;
  fechaEmision?: string;
  fechaVencimiento: string;
  archivoUrl?: string;
}