import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FlotaService } from '../../core/services/flota.service';
import { ConductorService } from '../../services/conductor.service';
import { VehiculoService } from '../../services/vehiculo.service';
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
  vehiculos$!: Observable<Vehiculo[]>;

  constructor(
    public flotaService: FlotaService,
    private conductorService: ConductorService,
    private vehiculoService: VehiculoService
  ) {}

  ngOnInit(): void {
    this.vehiculos$ = this.vehiculoService.obtenerVehiculos();
    // Filtro reactivo en tiempo real
    this.conductoresFiltrados$ = combineLatest([
      this.conductorService.obtenerConductores(),
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
      this.flotaService.asignarUnidad(
        Number(this.vehiculoSeleccionadoId), 
        this.conductorSeleccionado.fichaNumerica
      ).subscribe({
        next: (res) => {
          this.mensajeAsignacion = 'ÉXITO: Unidad asignada correctamente.';
          setTimeout(() => this.cerrarAsignacion(), 2000);
        },
        error: (err) => {
          this.mensajeAsignacion = 'ERROR: No se pudo asignar la unidad.';
        }
      });
    } else {
      this.mensajeAsignacion = 'ERROR: Debe seleccionar un vehículo de la lista.';
    }
  }
}