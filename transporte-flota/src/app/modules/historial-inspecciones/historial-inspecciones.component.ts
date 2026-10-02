import { Component, OnInit } from '@angular/core';
import { InspeccionService } from '../../services/inspeccion.service';
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
  inspeccionDetalle: any = null;
  
  currentPage: number = 0;
  totalPages: number = 1;
  pageSize: number = 10;
  totalElements: number = 0;

  constructor(private inspeccionService: InspeccionService) { }

  ngOnInit(): void {
    this.cargarInspecciones();
  }

  cargarInspecciones(): void {
    this.cargando = true;
    this.inspeccionService.obtenerInspeccionesLivianos(this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        this.totalPages = res.totalPages;
        this.totalElements = res.totalElements;
        const data = res.content || res;
        // Ordenar por fecha descendente (más recientes primero)
        this.inspecciones = data.sort((a: any, b: any) => {
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

  verDetalles(inspeccion: any): void {
    this.inspeccionDetalle = inspeccion;
  }

  cerrarDetalles(): void {
    this.inspeccionDetalle = null;
  }

  cambiarPagina(nuevaPagina: number): void {
    if (nuevaPagina >= 0 && nuevaPagina < this.totalPages && nuevaPagina !== this.currentPage) {
      this.currentPage = nuevaPagina;
      this.cargarInspecciones();
    }
  }

}
