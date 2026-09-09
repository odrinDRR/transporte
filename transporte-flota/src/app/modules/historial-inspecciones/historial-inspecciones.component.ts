import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-historial-inspecciones',
  templateUrl: './historial-inspecciones.component.html',
  styleUrls: ['./historial-inspecciones.component.scss']
})
export class HistorialInspeccionesComponent implements OnInit {

  inspecciones: any[] = [];
  inspeccionesFiltradas: any[] = [];
  cargando: boolean = true;
  filtroTexto: string = '';
  filtroOperacion: string = 'TODAS'; // TODAS, GENERAL, SALIDA, LLEGADA

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.cargarInspecciones();
  }

  cargarInspecciones(): void {
    this.cargando = true;
    this.http.get<any[]>(`${environment.apiUrl}/inspecciones-livianos`).subscribe({
      next: (data) => {
        // Ordenar por fecha descendente (más recientes primero)
        this.inspecciones = data.sort((a, b) => {
          return new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime();
        });
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando inspecciones', err);
        this.cargando = false;
      }
    });
  }

  filtrarLista(): void {
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    let result = this.inspecciones;

    if (this.filtroOperacion !== 'TODAS') {
      result = result.filter(i => i.operacion === this.filtroOperacion);
    }

    if (this.filtroTexto.trim() !== '') {
      const term = this.filtroTexto.toLowerCase().trim();
      result = result.filter(i => 
        (i.numeroControl && i.numeroControl.toLowerCase().includes(term)) ||
        (i.vehiculo && i.vehiculo.placa && i.vehiculo.placa.toLowerCase().includes(term)) ||
        (i.usuario && i.usuario.nombre && i.usuario.nombre.toLowerCase().includes(term)) ||
        (i.usuario && i.usuario.cedula && i.usuario.cedula.toLowerCase().includes(term))
      );
    }

    this.inspeccionesFiltradas = result;
  }

  setFiltroOperacion(op: string): void {
    this.filtroOperacion = op;
    this.aplicarFiltros();
  }

  imprimirInspeccion(inspeccion: any): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const danosHtml = inspeccion.danos && inspeccion.danos.length > 0
        ? inspeccion.danos.map((d: any) => `<li>${d.codigoReferencia} - ${d.tipoDano}</li>`).join('')
        : '<li>No se registraron daños.</li>';

    const fechaFormat = new Date(inspeccion.fechaCreacion).toLocaleString();

    const imgInspector = inspeccion.inspectorFirmaBase64 ? `<img src="${inspeccion.inspectorFirmaBase64}" />` : '<br><br><br>';
    const imgEntrega = inspeccion.entregaFirmaBase64 ? `<img src="${inspeccion.entregaFirmaBase64}" />` : '<br><br><br>';
    const imgRecibe = inspeccion.recibeFirmaBase64 ? `<img src="${inspeccion.recibeFirmaBase64}" />` : '<br><br><br>';

    const htmlContent = `
    <html>
      <head>
        <title>Planilla de Inspección ${inspeccion.numeroControl}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; font-size: 12px; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
          .header h2 { margin: 0; }
          .row { display: flex; flex-wrap: wrap; margin-bottom: 10px; }
          .col { flex: 1; padding: 5px; }
          .section-title { background-color: #eee; padding: 5px; font-weight: bold; margin-top: 15px; border: 1px solid #ccc; }
          .box { border: 1px solid #ccc; padding: 10px; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 5px; }
          table, th, td { border: 1px solid #ccc; }
          th, td { padding: 5px; text-align: left; }
          .signatures { display: flex; justify-content: space-between; margin-top: 40px; }
          .signature-box { text-align: center; width: 30%; }
          .signature-box img { max-width: 100%; height: 80px; border-bottom: 1px solid #000; margin-bottom: 5px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>PLANILLA DE INSPECCIÓN DE VEHÍCULO</h2>
          <p>N° Control: <b>${inspeccion.numeroControl}</b> | Fecha: ${fechaFormat}</p>
          <p>Operación: <b>${inspeccion.operacion || 'N/A'}</b> | Tipo: <b>${inspeccion.tipoInspeccion || 'N/A'}</b></p>
        </div>

        <div class="section-title">1. DATOS GENERALES</div>
        <div class="box row">
          <div class="col"><b>Vehículo:</b> ${inspeccion.vehiculo?.marca || ''} ${inspeccion.vehiculo?.modelo || ''}</div>
          <div class="col"><b>Placa:</b> ${inspeccion.vehiculo?.placa || ''}</div>
          <div class="col"><b>Conductor:</b> ${inspeccion.usuario?.nombre || ''} (${inspeccion.usuario?.cedula || ''})</div>
        </div>
        <div class="box row">
          <div class="col"><b>Gerencia:</b> ${inspeccion.gerenciaSolicitante || ''}</div>
          <div class="col"><b>Unidad:</b> ${inspeccion.unidadUsuaria || ''}</div>
          <div class="col"><b>Centro Costo:</b> ${inspeccion.centroCosto || ''}</div>
        </div>
        <div class="box row">
          <div class="col"><b>Km Entregado:</b> ${inspeccion.kilometrajeEntregado || ''}</div>
          <div class="col"><b>Km Recibido:</b> ${inspeccion.kilometrajeRecibido || ''}</div>
          <div class="col"><b>Transmisión:</b> ${inspeccion.transmision || ''}</div>
        </div>

        <div class="section-title">2. NIVELES DE FLUIDOS Y DOCUMENTACIÓN</div>
        <div class="box row">
          <div class="col"><b>Combustible:</b> ${inspeccion.nivelCombustible || ''}</div>
          <div class="col"><b>Aceite Motor:</b> ${inspeccion.nivelAceiteMotor || ''}</div>
          <div class="col"><b>Frenos:</b> ${inspeccion.nivelLigaFrenos || ''}</div>
          <div class="col"><b>Refrigerante:</b> ${inspeccion.nivelRefrigerante || ''}</div>
          <div class="col"><b>Aceite Caja:</b> ${inspeccion.nivelAceiteCaja || ''}</div>
        </div>
        <div class="box row">
          <div class="col"><b>Carnet Circulación:</b> ${inspeccion.docCarnet ? 'SI' : 'NO'}</div>
          <div class="col"><b>Licencia:</b> ${inspeccion.docLicencia ? 'SI' : 'NO'}</div>
          <div class="col"><b>Certificado Médico:</b> ${inspeccion.docCertificadoMedico ? 'SI' : 'NO'}</div>
          <div class="col"><b>Autorización:</b> ${inspeccion.docAutorizacion ? 'SI' : 'NO'}</div>
        </div>
        <div class="box row">
          <div class="col"><b>Tipo Cobertura Seguro:</b> ${inspeccion.tipoCobertura || 'N/A'}</div>
        </div>

        <div class="section-title">3. DAÑOS Y OBSERVACIONES</div>
        <div class="box">
          <ul>${danosHtml}</ul>
        </div>

        <div class="section-title">4. ESTADO GENERAL Y BATERÍA/CAUCHOS</div>
        <div class="box row">
           <div class="col"><b>Aire:</b> ${inspeccion.revAire || ''}</div>
           <div class="col"><b>Cauchos:</b> ${inspeccion.revCauchos || ''}</div>
           <div class="col"><b>Frenos:</b> ${inspeccion.revFrenos || ''}</div>
           <div class="col"><b>Vidrios:</b> ${inspeccion.revVidrios || ''}</div>
        </div>
        <div class="box row">
          <div class="col"><b>Batería:</b> ${inspeccion.batMarca || ''} (Vida: ${inspeccion.batVida || ''})</div>
          <div class="col"><b>Cauchos (Esp):</b> ${inspeccion.cauMarca || ''} (Vida: ${inspeccion.cauVida || ''})</div>
        </div>

        <div class="signatures">
          <div class="signature-box">
            ${imgInspector}
            <div>Inspector</div>
            <b>${inspeccion.inspectorNombre || ''}</b>
          </div>
          <div class="signature-box">
            ${imgEntrega}
            <div>Unidad Entrega</div>
            <b>${inspeccion.entregaNombre || ''}</b>
          </div>
          <div class="signature-box">
            ${imgRecibe}
            <div>Unidad Recibe</div>
            <b>${inspeccion.recibeNombre || ''}</b>
          </div>
        </div>
      </body>
    </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Esperar un momento a que las imagenes base64 carguen en el DOM
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 250);
  }

}
