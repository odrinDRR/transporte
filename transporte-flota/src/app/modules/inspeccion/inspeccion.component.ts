import { Component } from '@angular/core';
import { FlotaService } from '../../core/services/flota.service';

@Component({
  selector: 'app-inspeccion',
  templateUrl: './inspeccion.component.html',
  styleUrls: ['./inspeccion.component.scss']
})
export class InspeccionComponent {
  // Control de las grandes fases de la vista
  fasePrincipal: 'INGRESO_CEDULA' | 'SELECCION_TIPO' | 'FORMULARIO' = 'INGRESO_CEDULA';
  
  // Datos temporales del conductor logueado
  cedulaInput: string = '';
  nombreConductorActual: string = '';
  tipoInspeccionActual: 'INICIO' | 'CIERRE' = 'INICIO';
  tieneInspeccionAbierta: boolean = false;

 // Stepper del formulario
  etapaActual: number = 1;

  // NUEVO: Control de Imágenes
  fotosExterior: File[] = [];
  fotosInterior: File[] = [];

  inspeccion = {
    kilometraje: null,
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

  // --- PASO 1: VALIDAR CÉDULA ---
  // --- PASO 1: VALIDAR CÉDULA O FICHA ---
  verificarCedula(): void {
    const input = this.cedulaInput.trim();
    
    if (!input) {
      alert('Por favor, ingresa tu número de cédula o ficha.');
      return;
    }

    // Buscamos si el conductor existe coincidiendo Cédula o Ficha
    this.flotaService.conductores$.subscribe(conductores => {
      const conductor = conductores.find(c => 
        c.cedula.includes(input) || c.fichaNumerica === input
      );
      
      if (conductor) {
        this.nombreConductorActual = conductor.nombre;
        this.inspeccion.inspectorFirma = conductor.fichaNumerica; // Guardamos su ficha como firma
        this.tieneInspeccionAbierta = conductor.inspeccionAbierta || false;
        this.fasePrincipal = 'SELECCION_TIPO';
      } else {
        alert('Cédula o Ficha no encontrada. Verifica el número o contacta a Recursos Humanos.');
      }
    }).unsubscribe();
  }

  // --- PASO 2: ELEGIR QUÉ HACER ---
  seleccionarRuta(tipo: 'INICIO' | 'CIERRE'): void {
    this.tipoInspeccionActual = tipo;
    this.fasePrincipal = 'FORMULARIO';
    this.etapaActual = 1;
  }

  // --- PASO 3: NAVEGACIÓN DEL FORMULARIO ---
  // --- NUEVO: CAPTURA DE FOTOS ---
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

  // --- PASO 3: NAVEGACIÓN DEL FORMULARIO ---
  avanzar(): void { 
    // Validación estricta antes de avanzar
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
  
  retroceder(): void { if (this.etapaActual > 1) this.etapaActual--; }
  
  finalizar(): void {
    alert(`Inspección de ${this.tipoInspeccionActual} finalizada con éxito.`);
    
    // Reseteamos el sistema completo para el próximo conductor
    this.fasePrincipal = 'INGRESO_CEDULA';
    this.cedulaInput = '';
    this.etapaActual = 1;
    this.fotosExterior = [];
    this.fotosInterior = [];
  }
  
}