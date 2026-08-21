import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FlotaService } from '../../core/services/flota.service';
import { Conductor, Vehiculo } from '../../core/models/fleet.models';

@Component({
  selector: 'app-conductores',
  templateUrl: './conductores.component.html'
})
export class ConductoresComponent implements OnInit {
  filtroBusqueda$ = new BehaviorSubject<string>('');
  conductoresFiltrados$!: Observable<Conductor[]>;
  
  // Variables para el Modal de Asignación
  conductorSeleccionado: Conductor | null = null;
  vehiculoSeleccionadoId: number | null = null;
  mensajeAsignacion: string = '';

  constructor(public flotaService: FlotaService) {}

  ngOnInit(): void {
    // Filtro reactivo en tiempo real
    this.conductoresFiltrados$ = combineLatest([
      this.flotaService.conductores$,
      this.filtroBusqueda$
    ]).pipe(
      map(([conductores, texto]) => {
        if (!texto) return conductores;
        const term = texto.toLowerCase();
        return conductores.filter(c => 
          c.cedula.toLowerCase().includes(term) || 
          c.fichaNumerica.toLowerCase().includes(term) ||
          c.nombre.toLowerCase().includes(term)
        );
      })
    );
  }

  aplicarFiltro(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filtroBusqueda$.next(input.value);
  }

  obtenerPlacaAsignada(idVehiculo: number | null, vehiculos: Vehiculo[]): string {
    if (!idVehiculo) return 'Ninguno';
    const v = vehiculos.find(veh => veh.id === idVehiculo);
    return v ? `${v.placa} (${v.identificador})` : 'Desconocido';
  }

  // --- CONTROL DEL MODAL DE ASIGNACIÓN ---
  abrirAsignacion(conductor: Conductor): void {
    this.conductorSeleccionado = conductor;
    this.vehiculoSeleccionadoId = conductor.vehiculoAsignadoId; // Muestra la unidad actual si la tiene
    this.mensajeAsignacion = '';
  }

  cerrarAsignacion(): void {
    this.conductorSeleccionado = null;
    this.vehiculoSeleccionadoId = null;
  }

  confirmarAsignacion(): void {
    if (this.vehiculoSeleccionadoId && this.conductorSeleccionado) {
      // Usamos la función del servicio pasándole la ficha del conductor seleccionado
      const resultado = this.flotaService.asignarUnidad(
        Number(this.vehiculoSeleccionadoId), 
        this.conductorSeleccionado.fichaNumerica
      );
      
      this.mensajeAsignacion = resultado;
      
      // Si fue un éxito, cerramos el modal automáticamente después de 2 segundos
      if (resultado.includes('ÉXITO')) {
        setTimeout(() => this.cerrarAsignacion(), 2000);
      }
    } else {
      this.mensajeAsignacion = 'ERROR: Debe seleccionar un vehículo de la lista.';
    }
  }
}