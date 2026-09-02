import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-auditoria',
  templateUrl: './auditoria.component.html'
})
export class AuditoriaComponent {
  faseAuditoria: 'INGRESO' | 'INSPECCION' | 'COMPARACION' = 'INGRESO';
  cedulaInput: string = '';
  buscando: boolean = false;
  
  // Datos de la Inspección Activa (Salida/Inicio)
  inspeccionActiva: any = null;
  conductorAuditoria: any = null;
  vehiculoAuditoria: any = null;

  // Datos de la Inspección del Auditor (Llegada/Cierre)
  inspeccionAuditor: any = null;

  // Formulario Final (Veredicto)
  observacionesFinales: string = '';

  constructor(private http: HttpClient, private authService: AuthService) {}

  buscarInspeccionActiva() {
    if (!this.cedulaInput) return;
    this.buscando = true;
    
    // Buscamos la inspección activa por la ficha ingresada
    this.http.get<any>(`${environment.apiUrl}/inspecciones-livianos/activa-por-ficha/${this.cedulaInput.trim()}`).subscribe({
      next: (inspeccion) => {
        this.inspeccionActiva = inspeccion;
        this.conductorAuditoria = inspeccion.usuario;
        this.vehiculoAuditoria = inspeccion.vehiculo;
        this.faseAuditoria = 'INSPECCION';
        this.buscando = false;
      },
      error: (err) => {
        if (err.status === 404) {
          alert('No se encontró una inspección activa para esta ficha.');
        } else {
          alert('Error al conectar con el servidor.');
        }
        this.buscando = false;
      }
    });
  }

  onInspeccionFinalizada(resultadoAuditor: any) {
    this.inspeccionAuditor = resultadoAuditor;
    this.faseAuditoria = 'COMPARACION';
  }

  hayDiscrepancia(campo: string): boolean {
    if (!this.inspeccionActiva || !this.inspeccionAuditor) return false;
    return String(this.inspeccionActiva[campo]) !== String(this.inspeccionAuditor[campo]);
  }

  aprobar() {
    const userId = this.authService.getUsuarioId();
    const auditorId = userId ? Number(userId) : 1; // Fallback temporal

    const payload = {
      vehiculo: { id: this.vehiculoAuditoria.id },
      auditor: { id: auditorId },
      ubicacionPatio: 'Patio Principal',
      estadoVehiculoPatio: 'AUDITADO',
      observaciones: this.observacionesFinales || 'Sin observaciones adicionales.',
      inspeccionInicioId: this.inspeccionActiva.id,
      inspeccionCierreId: this.inspeccionAuditor.id
    };

    this.http.post(`${environment.apiUrl}/auditorias-patio`, payload).subscribe({
      next: () => {
        alert('Auditoría completada exitosamente. Ambas inspecciones han sido auditadas.');
        this.reiniciar();
      },
      error: () => {
        alert('Ocurrió un error al guardar la auditoría.');
      }
    });
  }

  reiniciar() {
    this.faseAuditoria = 'INGRESO';
    this.cedulaInput = '';
    this.inspeccionActiva = null;
    this.inspeccionAuditor = null;
    this.conductorAuditoria = null;
    this.vehiculoAuditoria = null;
    this.observacionesFinales = '';
  }
}