import { Component } from '@angular/core';

@Component({
  selector: 'app-inspeccion',
  templateUrl: './inspeccion.component.html'
})
export class InspeccionComponent {
  etapaActual: number = 1;

  inspeccion = {
    kilometraje: 124500,
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

  avanzar(): void { if (this.etapaActual < 5) this.etapaActual++; }
  retroceder(): void { if (this.etapaActual > 1) this.etapaActual--; }
  finalizar(): void {
    alert(`Inspección finalizada con dictamen: ${this.inspeccion.dictamen}. Generando reporte formal...`);
    this.etapaActual = 1;
  }
}