import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-listado-auditorias',
  templateUrl: './listado-auditorias.component.html',
  styleUrls: ['./listado-auditorias.component.scss']
})
export class ListadoAuditoriasComponent implements OnInit {

  tabActiva: 'TODAS' | 'EN_TRANSITO' | 'AUDITADAS' = 'TODAS';
  
  // Lista unificada
  registrosUnificados: any[] = [];
  
  auditoriasEnTransito: any[] = [];
  auditoriasCompletadas: any[] = [];
  cargando: boolean = false;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    this.cargando = true;
    
    // Obtenemos los vehículos que están en patio (Inspecciones de Inicio sin Cierre)
    this.http.get<any[]>(`${environment.apiUrl}/inspecciones-livianos`).subscribe({
      next: (inspecciones) => {
        this.auditoriasEnTransito = inspecciones.filter(ins => ins.tipoInspeccion === 'INICIO' && ins.estado === 'ABIERTA');
        
        // Obtenemos las auditorías ya completadas
        this.http.get<any[]>(`${environment.apiUrl}/auditorias-patio`).subscribe({
          next: (auditorias) => {
            this.auditoriasCompletadas = auditorias;
            this.construirListaUnificada();
            this.cargando = false;
          },
          error: () => this.cargando = false
        });
      },
      error: () => this.cargando = false
    });
  }

  construirListaUnificada() {
    this.registrosUnificados = [];
    
    // Mapear En Transito
    this.auditoriasEnTransito.forEach(ins => {
      this.registrosUnificados.push({
        tipo: 'inspeccion',
        id: ins.id,
        fecha: ins.fechaCreacion,
        referencia: ins.numeroControl,
        vehiculo: `${ins.vehiculo?.placa} (${ins.vehiculo?.marca})`,
        responsable: `${ins.usuario?.nombre} ${ins.usuario?.apellido}`,
        ubicacion: 'Pendiente',
        estado: 'Esperando Auditoría',
        badgeClass: 'bg-warning text-dark',
        icon: 'bi-clock'
      });
    });

    // Mapear Auditadas
    this.auditoriasCompletadas.forEach(aud => {
      this.registrosUnificados.push({
        tipo: 'auditoria',
        id: aud.id,
        fecha: aud.fechaRegistro,
        referencia: `#${aud.id}`,
        vehiculo: `${aud.vehiculo?.placa} (${aud.vehiculo?.marca})`,
        responsable: `${aud.auditor?.nombre} ${aud.auditor?.apellido}`,
        ubicacion: aud.ubicacionPatio,
        estado: aud.estadoVehiculoPatio,
        badgeClass: 'bg-success',
        icon: 'bi-check-circle'
      });
    });

    // Ordenar por fecha descendente
    this.registrosUnificados.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }

  cambiarTab(tab: 'TODAS' | 'EN_TRANSITO' | 'AUDITADAS') {
    this.tabActiva = tab;
  }

  imprimir(tipo: 'inspeccion' | 'auditoria', id: number) {
    if (tipo === 'inspeccion') {
      // Óptimo: Buscar directamente por ID en la BD
      this.http.get<any>(`${environment.apiUrl}/inspecciones-livianos/${id}`).subscribe(res => {
        this.generarPdfEImprimir(res, null);
      });
    } else {
      this.http.get<any>(`${environment.apiUrl}/auditorias-patio/${id}`).subscribe(aud => {
        // Óptimo: Traer ambas inspecciones en paralelo usando forkJoin
        forkJoin({
          insInicio: this.http.get<any>(`${environment.apiUrl}/inspecciones-livianos/${aud.inspeccionInicioId}`),
          insCierre: this.http.get<any>(`${environment.apiUrl}/inspecciones-livianos/${aud.inspeccionCierreId}`)
        }).subscribe(({ insInicio, insCierre }) => {
          this.generarPdfEImprimir(insInicio, insCierre, aud);
        });
      });
    }
  }

  generarPdfEImprimir(inicio: any, cierre: any = null, auditoria: any = null) {
    const w = window.open('', '_blank', 'width=900,height=700');
    if (!w) return alert('Por favor permite las ventanas emergentes (popups).');

    let content = `
      <html>
      <head>
        <title>Reporte de Inspección</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; font-size: 12px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
          h2, h3 { margin: 5px 0; }
          .grid-2 { display: flex; gap: 20px; }
          .col { flex: 1; border: 1px solid #ddd; padding: 10px; border-radius: 5px; }
          .field { margin-bottom: 8px; border-bottom: 1px dotted #ccc; padding-bottom: 4px; }
          .field strong { display: inline-block; width: 140px; color: #555; }
          .badge { background: #333; color: #fff; padding: 3px 6px; border-radius: 3px; font-size: 10px; }
          .diff { color: red; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>PLANILLA DE INSPECCIÓN VEHICULAR</h2>
          <h3>Vehículo: ${inicio.vehiculo?.placa} (${inicio.vehiculo?.marca}) - Ficha: ${inicio.usuario?.ficha}</h3>
          <p>Nro Control: ${inicio.numeroControl || 'N/A'}</p>
        </div>
        
        <div class="grid-2">
          <div class="col">
            <h3>Reporte de Salida (Conductor)</h3>
            <p><strong>Fecha:</strong> ${new Date(inicio.fechaCreacion).toLocaleString()}</p>
            <div class="field"><strong>Km Entregado:</strong> ${inicio.kilometrajeEntregado}</div>
            <div class="field"><strong>Nivel Combustible:</strong> ${inicio.nivelCombustible}</div>
            <div class="field"><strong>Estado Llantas:</strong> ${inicio.revCauchos}</div>
            <div class="field"><strong>Caucho Repuesto:</strong> ${inicio.accCauchoRepuesto ? 'Sí' : 'No'}</div>
            <div class="field"><strong>Gato Hidráulico:</strong> ${inicio.accGato ? 'Sí' : 'No'}</div>
            <div class="field"><strong>Triángulo:</strong> ${inicio.accTriangulo ? 'Sí' : 'No'}</div>
            <div class="field"><strong>Observaciones:</strong> ${inicio.observacionesDanos || 'Ninguna'}</div>
            <br>
            <p><strong>Firma Inspector:</strong> ${inicio.inspectorNombre || 'N/A'}</p>
          </div>
    `;

    if (cierre) {
      content += `
          <div class="col">
            <h3>Reporte de Cierre (Auditor)</h3>
            <p><strong>Fecha:</strong> ${new Date(cierre.fechaCreacion).toLocaleString()}</p>
            <div class="field"><strong>Km Recibido:</strong> ${cierre.kilometrajeRecibido}</div>
            <div class="field"><strong>Nivel Combustible:</strong> <span class="${inicio.nivelCombustible !== cierre.nivelCombustible ? 'diff' : ''}">${cierre.nivelCombustible}</span></div>
            <div class="field"><strong>Estado Llantas:</strong> <span class="${inicio.revCauchos !== cierre.revCauchos ? 'diff' : ''}">${cierre.revCauchos}</span></div>
            <div class="field"><strong>Caucho Repuesto:</strong> <span class="${inicio.accCauchoRepuesto !== cierre.accCauchoRepuesto ? 'diff' : ''}">${cierre.accCauchoRepuesto ? 'Sí' : 'No'}</span></div>
            <div class="field"><strong>Gato Hidráulico:</strong> <span class="${inicio.accGato !== cierre.accGato ? 'diff' : ''}">${cierre.accGato ? 'Sí' : 'No'}</span></div>
            <div class="field"><strong>Triángulo:</strong> <span class="${inicio.accTriangulo !== cierre.accTriangulo ? 'diff' : ''}">${cierre.accTriangulo ? 'Sí' : 'No'}</span></div>
            <div class="field"><strong>Observaciones:</strong> ${cierre.observacionesDanos || 'Ninguna'}</div>
            <br>
            <p><strong>Firma Auditor:</strong> ${cierre.inspectorNombre || auditoria?.auditor?.nombre || 'N/A'}</p>
          </div>
      `;
    }

    content += `</div>`;

    if (auditoria) {
      content += `
        <div style="margin-top: 20px; padding: 15px; border: 1px solid #000; background: #f9f9f9;">
          <h3>Veredicto Final de Auditoría</h3>
          <p><strong>Auditor:</strong> ${auditoria.auditor?.nombre} ${auditoria.auditor?.apellido}</p>
          <p><strong>Estado Vehículo:</strong> ${auditoria.estadoVehiculoPatio}</p>
          <p><strong>Observaciones y Discrepancias:</strong><br>${auditoria.observaciones}</p>
        </div>
      `;
    }

    content += `
        <script>
          window.onload = function() { window.print(); window.close(); }
        </script>
      </body>
      </html>
    `;

    w.document.write(content);
    w.document.close();
  }
}
