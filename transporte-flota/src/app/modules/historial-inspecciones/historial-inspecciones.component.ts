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
    const url = `${environment.apiUrl}/reportes/inspeccion/${inspeccion.id}`;
    window.open(url, '_blank');
  }

}
