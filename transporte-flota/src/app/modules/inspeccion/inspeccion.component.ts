import { Component } from '@angular/core';
import { FlotaService } from '../../core/services/flota.service';
import { InspeccionService } from '../../services/inspeccion.service';
import { ConductorService } from '../../services/conductor.service';
import { Inspeccion } from '../../core/models/fleet.models';

interface ZonaCarroceria {
  id: string;
  nombre: string;
  estado: 'OK' | 'LEVE' | 'GRAVE';
  icono: string;
}

@Component({
  selector: 'app-inspeccion',
  templateUrl: './inspeccion.component.html',
  styleUrls: ['./inspeccion.component.scss']
})
export class InspeccionComponent {
  // Control de las grandes fases de la vista
  fasePrincipal: 'INGRESO_CEDULA' | 'SELECCION_TIPO' | 'FORMULARIO' = 'INGRESO_CEDULA';
  
  // Datos del conductor
  cedulaInput: string = '';
  nombreConductorActual: string = '';
  tipoInspeccionActual: 'INICIO' | 'CIERRE' = 'INICIO';
  tieneInspeccionAbierta: boolean = false;

  // Stepper del formulario
  etapaActual: number = 1;

  // Evidencias fotográficas
  fotosExterior: File[] = [];
  fotosInterior: File[] = [];

<<<<<<< HEAD
  inspeccion: Partial<Inspeccion> = {
    kilometraje: null,
=======
  // INSPECTOR VISUAL 360° / CARCHECK TECH: Puntos táctiles de carrocería
  zonasCarroceria: ZonaCarroceria[] = [
    { id: 'frontal', nombre: 'Parachoques Frontal', estado: 'OK', icono: 'bi-front' },
    { id: 'capot', nombre: 'Capot y Motor', estado: 'OK', icono: 'bi-box-seam' },
    { id: 'parabrisas', nombre: 'Parabrisas Frontal', estado: 'OK', icono: 'bi-shield-shaded' },
    { id: 'lat_izq', nombre: 'Lateral Izquierdo', estado: 'OK', icono: 'bi-arrow-left-square' },
    { id: 'lat_der', nombre: 'Lateral Derecho', estado: 'OK', icono: 'bi-arrow-right-square' },
    { id: 'techo', nombre: 'Techo / Cabina', estado: 'OK', icono: 'bi-square text-secondary' },
    { id: 'trasero', nombre: 'Parachoques Trasero', estado: 'OK', icono: 'bi-back' },
    { id: 'cauchos', nombre: 'Cauchos / Neumáticos', estado: 'OK', icono: 'bi-disc' }
  ];

  inspeccion = {
    kilometraje: null as number | null,
>>>>>>> origin/diego
    fecha: new Date().toISOString().substring(0, 10),
    carroceriaOk: true,
    lucesOk: true,
    cinturonesOk: true,
    tableroOk: true,
    extintorVigente: true,
    nivelAceiteOk: true,
    refrigeranteOk: true,
    liquidoFrenosOk: true,
    dictamen: 'APTO',
    serialOk: true,
    vidriosOk: true,
    latoneriaOk: true,
    pinturaOk: true,
    parabrisasOk: true,
    cauchosOk: true,
    observaciones: '',
    inspectorFirma: ''
  };

  constructor(
    private flotaService: FlotaService,
    private inspeccionService: InspeccionService,
    private conductorService: ConductorService
  ) {}

  // --- PASO 1: VALIDAR CÉDULA O FICHA ---
  verificarCedula(): void {
    const input = this.cedulaInput.trim();
    
    if (!input) {
      alert('Por favor, ingresa tu número de cédula o ficha.');
      return;
    }

<<<<<<< HEAD
    // Buscamos si el conductor existe coincidiendo Cédula o Ficha usando el servicio real
    this.conductorService.obtenerConductores().subscribe(conductores => {
=======
    this.flotaService.conductores$.subscribe(conductores => {
>>>>>>> origin/diego
      const conductor = conductores.find(c => 
        (c.cedula || '').includes(input) || (c.fichaNumerica || '') === input
      );
      
      if (conductor) {
        this.nombreConductorActual = conductor.nombre;
<<<<<<< HEAD
        this.inspeccion.inspectorFirma = conductor.fichaNumerica; // Guardamos su ficha como firma
        this.inspeccion.vehiculoId = conductor.vehiculoAsignadoId || undefined; // Asignamos el ID del vehículo
=======
        this.inspeccion.inspectorFirma = conductor.fichaNumerica || input;
>>>>>>> origin/diego
        this.tieneInspeccionAbierta = conductor.inspeccionAbierta || false;
        this.fasePrincipal = 'SELECCION_TIPO';
      } else {
        alert('Cédula o Ficha no encontrada. Verifica el número o contacta a Recursos Humanos.');
      }
    });
  }

  // --- PASO 2: ELEGIR TIPO DE RUTA ---
  seleccionarRuta(tipo: 'INICIO' | 'CIERRE'): void {
    this.tipoInspeccionActual = tipo;
    this.inspeccion.tipo = tipo; // Guardamos el tipo de inspeccion en el payload
    this.fasePrincipal = 'FORMULARIO';
    this.etapaActual = 1;
  }

  // --- TECNOLOGÍA CARCHECK: CONMUTAR DAÑOS EN CARROCERÍA ---
  toggleEstadoZona(zona: ZonaCarroceria): void {
    if (zona.estado === 'OK') {
      zona.estado = 'LEVE';
    } else if (zona.estado === 'LEVE') {
      zona.estado = 'GRAVE';
    } else {
      zona.estado = 'OK';
    }

    // Actualiza flag global si hay daños graves en exterior
    const hayGraves = this.zonasCarroceria.some(z => z.estado === 'GRAVE');
    if (hayGraves) {
      this.inspeccion.dictamen = 'OBSERVADO';
    }
  }

  obtenerClaseEstado(estado: 'OK' | 'LEVE' | 'GRAVE'): string {
    switch (estado) {
      case 'OK': return 'badge-ok';
      case 'LEVE': return 'badge-leve';
      case 'GRAVE': return 'badge-grave';
    }
  }

  // --- PASO 3: ARCHIVOS Y FOTOS ---
  cargarFotosExterior(event: any): void {
    if (event.target.files) {
      this.fotosExterior = Array.from(event.target.files);
    }
  }

  cargarFotosInterior(event: any): void {
    if (event.target.files) {
      this.fotosInterior = Array.from(event.target.files);
    }
  }

  avanzar(): void { 
    if (this.etapaActual === 2 && this.fotosExterior.length !== 10) {
      alert(`Debe subir exactamente 10 fotos del Exterior. Lleva ${this.fotosExterior.length}.`);
      return;
    }
    if (this.etapaActual === 3 && this.fotosInterior.length !== 10) {
      alert(`Debe subir exactamente 10 fotos del Interior. Lleva ${this.fotosInterior.length}.`);
      return;
    }

    if (this.etapaActual < 5) this.etapaActual++; 
  }
  
  retroceder(): void { 
    if (this.etapaActual > 1) this.etapaActual--; 
  }
  
  finalizar(): void {
<<<<<<< HEAD
    if (!this.inspeccion.vehiculoId) {
       alert('Error: El conductor no tiene un vehículo asignado.');
       return;
    }

    // Enviamos el objeto inspeccion al backend
    this.inspeccionService.crearInspeccion(this.inspeccion as any).subscribe({
      next: (res) => {
        alert(`Inspección de ${this.tipoInspeccionActual} guardada en base de datos correctamente.`);
        // Reseteamos el sistema completo para el próximo conductor
        this.fasePrincipal = 'INGRESO_CEDULA';
        this.cedulaInput = '';
        this.etapaActual = 1;
        this.fotosExterior = [];
        this.fotosInterior = [];
      },
      error: (err) => {
        console.error('Error al crear inspección', err);
        alert('Ocurrió un error de red al intentar guardar la inspección.');
      }
    });
=======
    alert(`Inspección de ${this.tipoInspeccionActual} finalizada con éxito.`);
    this.fasePrincipal = 'INGRESO_CEDULA';
    this.cedulaInput = '';
    this.etapaActual = 1;
    this.fotosExterior = [];
    this.fotosInterior = [];
>>>>>>> origin/diego
  }
}