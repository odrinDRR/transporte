import { Component, OnInit } from '@angular/core';
import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { FlotaService } from '../../core/services/flota.service';
import { Vehiculo, Conductor } from '../../core/models/fleet.models';

@Component({
  selector: 'app-flota',
  templateUrl: './flota.component.html'
})
export class FlotaComponent implements OnInit {
  filtroTexto$ = new BehaviorSubject<string>('');
  filtroEstado$ = new BehaviorSubject<string>('TODOS');
  vehiculosFiltrados$!: Observable<Vehiculo[]>;
  conductores$!: Observable<Conductor[]>;
  vehiculoSeleccionado: Vehiculo | null = null;

  constructor(public flotaService: FlotaService) {}

  ngOnInit(): void {
    this.conductores$ = this.flotaService.conductores$;
    this.vehiculosFiltrados$ = combineLatest([
      this.flotaService.vehiculos$,
      this.filtroTexto$,
      this.filtroEstado$
    ]).pipe(
      map(([vehiculos, texto, estado]) => {
        return vehiculos.filter(v => {
          const coincideTexto = v.placa.toLowerCase().includes(texto.toLowerCase()) ||
                                v.identificador.toLowerCase().includes(texto.toLowerCase());
          const coincideEstado = estado === 'TODOS' || v.estado === estado;
          return coincideTexto && coincideEstado;
        });
      })
    );
  }

  aplicarTexto(e: Event): void { this.filtroTexto$.next((e.target as HTMLInputElement).value); }
  aplicarEstado(est: string): void { this.filtroEstado$.next(est); }
  
  obtenerNombreConductor(id: number | null, conductores: Conductor[]): string {
    if (!id) return 'Sin Asignar';
    const c = conductores.find(item => item.id === id);
    return c ? c.nombre : 'Sin Asignar';
  }

  abrirFicha(v: Vehiculo): void { this.vehiculoSeleccionado = v; }
  cerrarFicha(): void { this.vehiculoSeleccionado = null; }
  eliminar(id: number): void {
    if (confirm('¿Eliminar esta unidad de la flota?')) {
      this.flotaService.eliminarVehiculo(id);
    }
  }
}