import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ModalService } from '../../core/services/modal.service';
import { FlotaService } from '../../core/services/flota.service';
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
  procesandoAsignacion = false;
  vehiculos$!: Observable<Vehiculo[]>;

  constructor(
    public flotaService: FlotaService,
    private vehiculoService: VehiculoService,
    private http: HttpClient,
    private modalService: ModalService
  ) {}

  cargando = false;
  procesandoId: number | null = null;
  filtroTexto = '';
  conductoresSubject = new BehaviorSubject<Conductor[]>([]);

  ngOnInit(): void {
    this.vehiculos$ = this.vehiculoService.obtenerVehiculos();
    
    this.cargando = true;
    combineLatest([
      this.http.get<any[]>(`${environment.apiUrl}/usuarios`),
      this.vehiculos$
    ]).subscribe({
      next: ([usuarios, vehiculos]) => {
        // Mapear los usuarios con cargo CONDUCTOR a la interfaz Conductor
        const conductoresMap = usuarios
          .filter(u => u.cargo === 'CONDUCTOR' && u.estado !== 'PENDIENTE')
          .map(u => {
            const veh = vehiculos.find(v => v.conductorId === u.id);
            return {
              id: u.id,
              nombre: u.nombre + ' ' + u.apellido,
              cedula: u.cedula,
              fichaNumerica: u.ficha || u.licencia || 'Sin ficha',
              licenciaVigente: true,
              fechaVencimientoLicencia: u.fechaVencimientoLicencia || '',
              fechaVencimientoCertificadoMedico: u.fechaVencimientoCertificadoMedico || '',
              urlLicencia: u.urlLicencia || '',
              urlCertificadoMedico: u.urlCertificadoMedico || '',
              fotoUrl: u.fotoUrl || '',
              vehiculoAsignadoId: veh ? veh.id : null,
              estado: u.estado
            };
          })
          .sort((a, b) => {
            return a.estado === 'ACTIVO' ? -1 : 1;
          });

        this.conductoresSubject.next(conductoresMap);
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando conductores:', err);
        this.cargando = false;
      }
    });

    // Filtro reactivo en tiempo real con comprobación de nulidad segura
    this.conductoresFiltrados$ = combineLatest([
      this.conductoresSubject.asObservable(),
      this.filtroBusqueda$
    ]).pipe(
      map(([conductores, texto]) => {
        if (!texto) return conductores;
        const term = texto.toLowerCase();
        return conductores.filter(c => 
          (c.cedula || '').toLowerCase().includes(term) || 
          (c.fichaNumerica || '').toLowerCase().includes(term) ||
          (c.nombre || '').toLowerCase().includes(term)
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
    this.vehiculoSeleccionadoId = conductor.vehiculoAsignadoId ?? null;
    this.mensajeAsignacion = '';
  }

  cerrarAsignacion(): void {
    this.conductorSeleccionado = null;
    this.vehiculoSeleccionadoId = null;
  }

  confirmarAsignacion(): void {
    if (this.vehiculoSeleccionadoId && this.conductorSeleccionado) {
      this.procesandoAsignacion = true;
      this.mensajeAsignacion = '';
      // Usamos la función del servicio pasándole la ficha del conductor seleccionado
      this.flotaService.asignarUnidad(
        Number(this.vehiculoSeleccionadoId), 
        this.conductorSeleccionado.fichaNumerica || ''
      ).subscribe({
        next: (res) => {
          this.mensajeAsignacion = 'ÉXITO: Unidad asignada correctamente.';
          setTimeout(() => {
            this.procesandoAsignacion = false;
            this.cerrarAsignacion();
            this.ngOnInit(); // Refresh to show the assigned vehicle
          }, 1500);
        },
        error: (err) => {
          this.procesandoAsignacion = false;
          this.mensajeAsignacion = 'ERROR: No se pudo asignar la unidad.';
        }
      });
    } else {
      this.mensajeAsignacion = 'ERROR: Debe seleccionar un vehículo de la lista.';
    }
  }

  async revocarAsignacion(conductor: Conductor): Promise<void> {
    const confirmado = await this.modalService.showConfirm(
      `¿Estás seguro de que deseas desvincular la unidad de ${conductor.nombre}?`
    );
    
    if (confirmado) {
      this.procesandoId = conductor.id;
      this.flotaService.desvincularUnidad(conductor.id).subscribe({
        next: () => {
          this.modalService.showAlert('Unidad desvinculada exitosamente.', 'Éxito', 'success');
          this.ngOnInit(); // Refresh to clear the assigned vehicle
          this.procesandoId = null;
        },
        error: (err) => {
          console.error(err);
          this.modalService.showAlert('Error al desvincular la unidad.', 'Error', 'error');
          this.procesandoId = null;
        }
      });
    }
  }

  async desactivarUsuario(id: number, nombre: string): Promise<void> {
    const confirmado = await this.modalService.showConfirm(
      `¿Estás seguro de que deseas desactivar a ${nombre}? Esta acción inhabilitará su acceso al sistema y lo desvinculará de cualquier unidad asignada.`
    );
    
    if (confirmado) {
      this.procesandoId = id;
      this.http.delete(`${environment.apiUrl}/usuarios/${id}`).subscribe({
        next: () => {
          this.modalService.showAlert(`Usuario ${nombre} desactivado correctamente.`, 'Éxito', 'success');
          this.ngOnInit(); // Refresh list
          this.procesandoId = null;
        },
        error: (err) => {
          console.error(err);
          this.modalService.showAlert('Ocurrió un error al intentar desactivar el usuario.', 'Error', 'error');
          this.procesandoId = null;
        }
      });
    }
  }

  async activarUsuario(id: number, nombre: string): Promise<void> {
    const confirmado = await this.modalService.showConfirm(
      `¿Estás seguro de que deseas activar a ${nombre}? Esta acción rehabilitará su acceso al sistema.`
    );
    
    if (confirmado) {
      this.procesandoId = id;
      this.http.put(`${environment.apiUrl}/usuarios/aprobar/${id}`, {}).subscribe({
        next: () => {
          this.modalService.showAlert(`Usuario ${nombre} activado correctamente.`, 'Éxito', 'success');
          this.ngOnInit(); // Refresh list
          this.procesandoId = null;
        },
        error: (err) => {
          console.error(err);
          this.modalService.showAlert('Ocurrió un error al intentar activar el usuario.', 'Error', 'error');
          this.procesandoId = null;
        }
      });
    }
  }
}