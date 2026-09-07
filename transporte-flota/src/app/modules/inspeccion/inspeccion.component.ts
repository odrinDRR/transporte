import { Component, OnInit } from '@angular/core';
import { FlotaService } from '../../core/services/flota.service';
import { InspeccionService } from '../../services/inspeccion.service';
import { ConductorService } from '../../services/conductor.service';

export interface ZonaCarroceria {
  id: string;
  nombre: string;
  estado: 'OK' | 'LEVE' | 'GRAVE';
  icono: string;
  codigoDano?: string;
}

export interface EvaluacionItem {
  id: string;
  label: string;
  icono: string;
}

export interface TipoVehiculo {
  id: string;
  label: string;
  icono: string;
}

@Component({
  selector: 'app-inspeccion',
  templateUrl: './inspeccion.component.html',
  styleUrls: ['./inspeccion.component.scss']
})
export class InspeccionComponent implements OnInit {
  // Máquina de estados de navegación principal
  fasePrincipal: 'TIPO_INSPECCION' | 'TIPO_VEHICULO' | 'INGRESO_CEDULA' | 'FORMULARIO' = 'TIPO_INSPECCION';
  
  cedulaInput: string = '';
  nombreConductorActual: string = '';
  etapaActual: number = 1;

  fotosExterior: File[] = [];
  fotosInterior: File[] = [];

  // Catálogo de vehículos con iconos vectoriales actualizados acordes a requerimientos
  tiposVehiculo: TipoVehiculo[] = [
    { id: 'ambulancia', label: 'AMBULANCIA', icono: 'bi-hospital' },
    { id: 'pickup', label: 'CAMIONETA PICKUP', icono: 'bi-truck-flatbed' },
    { id: 'grua', label: 'GRÚA', icono: 'bi-cone-striped' },
    { id: 'camion', label: 'CAMIÓN', icono: 'bi-truck' },
    { id: 'camioneta', label: 'CAMIONETA (SUV)', icono: 'bi-car-front-fill' },
    { id: 'moto', label: 'MOTOCICLETA', icono: 'bi-bicycle' },
    { id: 'sedan', label: 'SEDÁN', icono: 'bi-car-front' },
    { id: 'gandola', label: 'GANDOLA', icono: 'bi-truck-front' }
  ];

  opcionesMotivo = ['Rutinario', 'Correctivo', 'Solicitud del Usuario'];
  
  // AÑADIDO: Códigos de daño extendidos de la maqueta HTML
  codigosDano = [
    '1. Golpe', '2. Suelto', '3. Raya', '4. Desconchado', '5. Vidrio Roto', 
    '6. Espejo Roto', '7. Falta Moldura', '8. Falta Faro', '9. Falta Accesorios',
    '10. Falta Centro Copas', '11. Falta Emblema', '12. Tapicería Manchada'
  ];

  nivelesFluidos = [
    { id: 'combustible', label: 'Nivel de Combustible', icon: 'bi-fuel-pump' },
    { id: 'aceiteMotor', label: 'Aceite Motor', icon: 'bi-droplet-half' },
    { id: 'aceiteCaja', label: 'Aceite Caja', icon: 'bi-gear-wide-connected' },
    { id: 'ligaFrenos', label: 'Liga de Frenos', icon: 'bi-sign-stop' },
    { id: 'refrigerante', label: 'Refrigerante', icon: 'bi-thermometer-snow' }
  ];

  // AÑADIDO: Separación de Documentos para mayor fidelidad a la ficha
  documentosVehiculo = [
    { id: 'carnetCirculacion', label: 'Carnet de Circulación' },
    { id: 'autorizacionConducir', label: 'Autorización para Conducir' },
    { id: 'asignacionVehiculo', label: 'Asignación de Vehículo' }
  ];

  documentosConductor = [
    { id: 'licenciaConducir', label: 'Licencia para Conducir' },
    { id: 'certificadoMedico', label: 'Certificado Médico' }
  ];

  // AÑADIDO: Puntos de revisión física extendidos
  puntosFisicos: EvaluacionItem[] = [
    { id: 'aireAcondicionado', label: 'Aire Acondicionado', icono: 'bi-wind' },
    { id: 'faros', label: 'Faros y Luces', icono: 'bi-lightbulb' },
    { id: 'lucesCruce', label: 'Luces de Cruce', icono: 'bi-arrow-left-right' },
    { id: 'lucesStop', label: 'Luces de Stop', icono: 'bi-sign-stop-fill' },
    { id: 'frenoMano', label: 'Freno de Mano', icono: 'bi-sign-stop' },
    { id: 'sistemaFrenos', label: 'Sistema de Frenos', icono: 'bi-exclamation-octagon' },
    { id: 'limpiaparabrisas', label: 'Limpiaparabrisas', icono: 'bi-cloud-rain' },
    { id: 'espejos', label: 'Espejos Retrovisores', icono: 'bi-mirror' },
    { id: 'vidrios', label: 'Vidrios (Parabrisas/Laterales)', icono: 'bi-window' },
    { id: 'asientos', label: 'Asientos y Tapicería', icono: 'bi-person-seat' },
    { id: 'alfombras', label: 'Alfombras', icono: 'bi-layers' },
    { id: 'cinturones', label: 'Cinturones de Seguridad', icono: 'bi-shield-check' },
    { id: 'neumaticos', label: 'Neumáticos / Cauchos', icono: 'bi-record-circle' },
    { id: 'bateria', label: 'Batería', icono: 'bi-battery-charging' }
  ];

  // AÑADIDO: Accesorios de seguridad extendidos
  accesoriosSeguridad: EvaluacionItem[] = [
    { id: 'alarma', label: 'Alarma', icono: 'bi-bell' },
    { id: 'boveda', label: 'Bóveda', icono: 'bi-safe' },
    { id: 'extintor', label: 'Extintor', icono: 'bi-fire' },
    { id: 'cauchoRepuesto', label: 'Caucho (Repuesto)', icono: 'bi-record-circle' },
    { id: 'gato', label: 'Gato y Palanca', icono: 'bi-tools' },
    { id: 'llaveCruz', label: 'Llave de Cruz', icono: 'bi-wrench' },
    { id: 'triangulo', label: 'Triángulo de Seguridad', icono: 'bi-triangle-half' },
    { id: 'cablesAuxiliares', label: 'Cables Auxiliares', icono: 'bi-lightning' },
    { id: 'radio', label: 'Radio / Reproductor', icono: 'bi-radio' }
  ];

  zonasCarroceria: ZonaCarroceria[] = [
    { id: 'frontal', nombre: 'Frente', estado: 'OK', icono: 'bi-front' },
    { id: 'techo', nombre: 'Techo', estado: 'OK', icono: 'bi-arrow-up-square' },
    { id: 'lat_izq', nombre: 'Lado Izquierdo', estado: 'OK', icono: 'bi-arrow-left-square' },
    { id: 'lat_der', nombre: 'Lado Derecho', estado: 'OK', icono: 'bi-arrow-right-square' },
    { id: 'trasera', nombre: 'Trasera', estado: 'OK', icono: 'bi-back' }
  ];

  // AÑADIDO: Expansión del payload para incluir los datos extendidos del formulario
  inspeccion: any = {
    tipoOperacion: '',
    tipoVehiculo: '',
    kilometraje: null,
    motivo: 'Rutinario',
    
    // Unidad Solicitante
    gerencia: '',
    unidadUsuaria: '',
    centroCosto: '',
    
    // Datos Vehículo
    marca: '',
    modelo: '',
    anio: null,
    placa: '',
    color: '',
    serialCarroceria: '',
    transmision: 'Automático',
    kmRecibido: null,
    
    coberturaSeguro: '',
    observacionesDanos: '',

    dictamen: 'APTO',
    observaciones: '',
    inspectorFirma: '',
    fluidos: {}, 
    docs: {},    
    fisico: {},  
    accesorios: {} 
  };

  constructor(
    private flotaService: FlotaService,
    private inspeccionService: InspeccionService,
    private conductorService: ConductorService
  ) {}

  ngOnInit(): void {
    this.inicializarValoresPorDefecto();
  }

  inicializarValoresPorDefecto(): void {
    this.nivelesFluidos.forEach(f => this.inspeccion.fluidos[f.id] = 'ALTO');
    this.documentosVehiculo.forEach(d => this.inspeccion.docs[d.id] = true);
    this.documentosConductor.forEach(d => this.inspeccion.docs[d.id] = true);
    this.puntosFisicos.forEach(p => this.inspeccion.fisico[p.id] = 'BUENO');
    this.accesoriosSeguridad.forEach(a => this.inspeccion.accesorios[a.id] = true);
  }

  seleccionarTipoOperacion(tipo: 'General' | 'Salida' | 'Llegada'): void {
    this.inspeccion.tipoOperacion = tipo;
    this.fasePrincipal = 'TIPO_VEHICULO';
  }

  seleccionarVehiculo(vehiculo: TipoVehiculo): void {
    this.inspeccion.tipoVehiculo = vehiculo.label;
    this.fasePrincipal = 'INGRESO_CEDULA';
  }

  verificarCedula(): void {
    const input = this.cedulaInput.trim();
    if (!input) return;

    this.conductorService.obtenerConductores().subscribe(conductores => {
      const conductor = conductores.find(c => (c.cedula || '').includes(input) || (c.fichaNumerica || '') === input);
      if (conductor) {
        this.nombreConductorActual = conductor.nombre;
        this.inspeccion.inspectorFirma = conductor.fichaNumerica || input;
        this.inspeccion.vehiculoId = conductor.vehiculoAsignadoId || undefined;
        this.etapaActual = 1;
        this.fasePrincipal = 'FORMULARIO';
      } else {
        alert('Cédula o Ficha no encontrada.');
      }
    });
  }

  volver(faseDestino: 'TIPO_INSPECCION' | 'TIPO_VEHICULO' | 'INGRESO_CEDULA'): void {
    this.fasePrincipal = faseDestino;
  }

  toggleEstadoZona(zona: ZonaCarroceria): void {
    if (zona.estado === 'OK') zona.estado = 'LEVE';
    else if (zona.estado === 'LEVE') zona.estado = 'GRAVE';
    else { zona.estado = 'OK'; zona.codigoDano = undefined; }
  }

  obtenerClaseEstado(estado: 'OK' | 'LEVE' | 'GRAVE'): string {
    switch (estado) {
      case 'OK': return 'badge-ok';
      case 'LEVE': return 'badge-leve';
      case 'GRAVE': return 'badge-grave';
    }
  }

  cargarFotosExterior(event: any): void { 
    if (event.target.files) this.fotosExterior = Array.from(event.target.files); 
  }
  
  avanzar(): void { if (this.etapaActual < 6) this.etapaActual++; }
  retroceder(): void { if (this.etapaActual > 1) this.etapaActual--; }
  
  finalizar(): void {
    alert(`Reporte finalizado para Vehículo: ${this.inspeccion.tipoVehiculo} | Operación: ${this.inspeccion.tipoOperacion}`);
    console.log('Payload:', this.inspeccion);
  }
}