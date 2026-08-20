import { Component } from '@angular/core';

interface ReporteInspeccion {
  km: number;
  carroceria: string;
  luces: string;
  llantas: string;
  observaciones: string;
}

interface AuditoriaPendiente {
  id: number;
  placa: string;
  conductor: string;
  fechaInicio: string;
  fechaCierre: string;
  inicio: ReporteInspeccion;
  cierre: ReporteInspeccion;
}

@Component({
  selector: 'app-auditoria',
  templateUrl: './auditoria.component.html'
})
export class AuditoriaComponent {
  
  // Datos simulados de vehículos esperando revisión en patio
  pendientes: AuditoriaPendiente[] = [
    {
      id: 1,
      placa: 'A82-BC3',
      conductor: 'Carlos Mendoza',
      fechaInicio: '20-08-2026 06:30 AM',
      fechaCierre: '20-08-2026 04:15 PM',
      inicio: { km: 124500, carroceria: 'Sin novedades', luces: '100% Operativas', llantas: 'Presión normal', observaciones: 'Salida de rutina.' },
      cierre: { km: 124680, carroceria: 'Abolladura leve en puerta derecha', luces: 'Faro derecho roto', llantas: 'Presión normal', observaciones: 'Roce en almacén de cliente.' }
    },
    {
      id: 2,
      placa: 'AB1-23C',
      conductor: 'Luis Pérez',
      fechaInicio: '20-08-2026 07:00 AM',
      fechaCierre: '20-08-2026 03:50 PM',
      inicio: { km: 45000, carroceria: 'Sin novedades', luces: 'Operativas', llantas: 'Normal', observaciones: '' },
      cierre: { km: 45045, carroceria: 'Sin novedades', luces: 'Operativas', llantas: 'Normal', observaciones: 'Viaje sin contratiempos.' }
    }
  ];

  revisionActual: AuditoriaPendiente | null = null;
  
  // Formulario de Fase 2: Validación Física
  evaluacionFisica = {
    odometroCoincide: false,
    estadoFisicoCoincide: false,
    notasSupervisor: ''
  };

  seleccionarRevision(item: AuditoriaPendiente): void {
    this.revisionActual = item;
    // Resetear formulario físico
    this.evaluacionFisica = { odometroCoincide: false, estadoFisicoCoincide: false, notasSupervisor: '' };
  }

  volverACola(): void {
    this.revisionActual = null;
  }

  calcularDeltaKm(): number {
    if (!this.revisionActual) return 0;
    return this.revisionActual.cierre.km - this.revisionActual.inicio.km;
  }

  hayDiscrepanciaTexto(campo: keyof ReporteInspeccion): boolean {
    if (!this.revisionActual) return false;
    return this.revisionActual.inicio[campo] !== this.revisionActual.cierre[campo];
  }

  aprobar(): void {
    if (!this.evaluacionFisica.odometroCoincide || !this.evaluacionFisica.estadoFisicoCoincide) {
      alert('⚠️ Para APROBAR, debes confirmar que validaste físicamente el odómetro y el estado de la unidad.');
      return;
    }
    alert(`✅ Auditoría APROBADA para la unidad ${this.revisionActual?.placa}. Registro guardado.`);
    this.removerActualDeLista();
  }

  rechazar(): void {
    if (this.evaluacionFisica.notasSupervisor.trim() === '') {
      alert('❌ Para RECHAZAR, debes dejar una nota explicando la discrepancia o el fraude detectado.');
      return;
    }
    alert(`🚨 Auditoría RECHAZADA. Se ha bloqueado la unidad ${this.revisionActual?.placa} y notificado a Gerencia.`);
    this.removerActualDeLista();
  }

  private removerActualDeLista(): void {
    if (this.revisionActual) {
      this.pendientes = this.pendientes.filter(p => p.id !== this.revisionActual!.id);
      this.revisionActual = null;
    }
  }
}