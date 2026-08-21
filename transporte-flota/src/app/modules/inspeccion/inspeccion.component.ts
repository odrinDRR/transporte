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

  // Stepper del formulario
  etapaActual: number = 1;

  inspeccion = {
    kilometraje: null,
    fecha: new Date().toISOString().substring(0, 10),
    carroceriaOk: true,
    lucesOk: true,
    cauchosOk: true,
    cinturonesOk: true,
    tableroOk: true,
    extintorVigente: true,
    nivelAceiteOk: true,
    refrigeranteOk: true,
    liquidoFrenosOk: true,
    dictamen: 'APTO',
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
        c.cedula === input || c.fichaNumerica === input
      );
      
      if (conductor) {
        this.nombreConductorActual = conductor.nombre;
        this.inspeccion.inspectorFirma = conductor.fichaNumerica; // Guardamos su ficha como firma
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
  avanzar(): void { if (this.etapaActual < 5) this.etapaActual++; }
  retroceder(): void { if (this.etapaActual > 1) this.etapaActual--; }
  
  finalizar(): void {
    alert(`Inspección de ${this.tipoInspeccionActual} finalizada con dictamen: ${this.inspeccion.dictamen}.`);
    
    // Reseteamos el sistema completo para el próximo conductor
    this.fasePrincipal = 'INGRESO_CEDULA';
    this.cedulaInput = '';
    this.etapaActual = 1;
  }
}