import { Component } from '@angular/core';
import { FlotaService } from '../../core/services/flota.service';

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

  constructor(private flotaService: FlotaService) {}

  // --- PASO 1: VALIDAR CÉDULA O FICHA ---
  verificarCedula(): void {
    const input = this.cedulaInput.trim();
    
    if (!input) {
      alert('Por favor, ingresa tu número de cédula o ficha.');
      return;
    }

    this.flotaService.conductores$.subscribe(conductores => {
      const conductor = conductores.find(c => 
        (c.cedula || '').includes(input) || (c.fichaNumerica || '') === input
      );
      
      if (conductor) {
        this.nombreConductorActual = conductor.nombre;
        this.inspeccion.inspectorFirma = conductor.fichaNumerica || input;
        this.tieneInspeccionAbierta = conductor.inspeccionAbierta || false;
        this.fasePrincipal = 'SELECCION_TIPO';
      } else {
        alert('Cédula o Ficha no encontrada. Verifica el número o contacta a Recursos Humanos.');
      }
    }).unsubscribe();
  }

  // --- PASO 2: ELEGIR TIPO DE RUTA ---
  seleccionarRuta(tipo: 'INICIO' | 'CIERRE'): void {
    this.tipoInspeccionActual = tipo;
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
    alert(`Inspección de ${this.tipoInspeccionActual} finalizada con éxito.`);
    this.fasePrincipal = 'INGRESO_CEDULA';
    this.cedulaInput = '';
    this.etapaActual = 1;
    this.fotosExterior = [];
    this.fotosInterior = [];
  }
}