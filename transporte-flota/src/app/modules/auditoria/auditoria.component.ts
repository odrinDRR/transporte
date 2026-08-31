import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  constructor(private http: HttpClient) {}

  buscarInspeccionActiva() {
    if (!this.cedulaInput) return;
    this.buscando = true;
    
    // Primero, buscamos al usuario por cédula para obtener sus datos básicos
    this.http.get<any[]>(`${environment.apiUrl}/usuarios`).subscribe({
      next: (usuarios) => {
        const term = this.cedulaInput.trim().toLowerCase();
        const conductor = usuarios.find(u => 
          u.cargo === 'CONDUCTOR' && 
          (
            (u.cedula && u.cedula.toLowerCase() === term) ||
            (u.ficha && u.ficha.toLowerCase() === term)
          )
        );

        if (!conductor) {
          alert('Conductor no encontrado. Verifica la cédula o ficha.');
          this.buscando = false;
          return;
        }

        // Si lo encontramos, buscamos su inspección activa por la cédula
        this.http.get<any>(`${environment.apiUrl}/inspecciones-livianos/activa/${conductor.cedula}`).subscribe({
          next: (inspeccion) => {
            this.inspeccionActiva = inspeccion;
            this.conductorAuditoria = {
               id: conductor.id,
               nombre: conductor.nombre + ' ' + conductor.apellido,
               cedula: conductor.cedula
            };
            this.vehiculoAuditoria = inspeccion.vehiculo;
            this.faseAuditoria = 'INSPECCION';
            this.buscando = false;
          },
          error: (err) => {
            if (err.status === 404) {
              alert('Este conductor NO tiene una inspección activa. No hay nada que auditar.');
            } else {
              alert('Error al conectar con el servidor.');
            }
            this.buscando = false;
          }
        });
      },
      error: () => {
        alert('Error al buscar usuarios.');
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
    alert('Auditoría completada exitosamente. Inspección cerrada.');
    this.reiniciar();
  }

  rechazar() {
    if (!this.observacionesFinales.trim()) {
      alert('Debes ingresar observaciones detallando el motivo del rechazo.');
      return;
    }
    alert('Auditoría finalizada con Novedad/Rechazo registrada.');
    this.reiniciar();
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