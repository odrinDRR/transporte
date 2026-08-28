// Actualizamos los roles según la nueva lógica de negocio
export type RolUsuario = 'ADMIN' | 'COORDINADOR' | 'EMPLEADO' | 'SUPERVISOR' | 'CONDUCTOR';
export type EstadoVehiculo = 'OPERATIVO' | 'TALLER' | 'INACTIVO';

export interface Vehiculo {
  id: number;
  placa: string;
  identificador?: string;
  marca?: string;
  modelo?: string;
  marcaModelo?: string; // Mantenido para retrocompatibilidad
  tipo?: string;
  anio: number;
  estado: EstadoVehiculo;
  conductorId: number | null;
  vin: string;
  kilometraje: number;
  fotos?: string[];
  urlFotoPerfil?: string; // Agregado para almacenar la foto principal
  ultimoServicio?: string;
  proximoMantenimiento?: string;
  seguroRcvVigente?: boolean;
  color?: string;
  capacidadCarga?: number;
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
  inspectorFirma: string; // Puede ser ficha o id del conductor
  tipo?: string; // INICIO o CIERRE
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
  tipoDocumento: string; // Licencia, Certificado Médico, RCV, etc.
  numero: string;
  fechaEmision?: string;
  fechaVencimiento: string;
  archivoUrl?: string; // Para el frontend descargar/ver el PDF/IMG
}