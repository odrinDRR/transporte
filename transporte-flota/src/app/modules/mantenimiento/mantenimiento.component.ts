import { Component, OnInit } from '@angular/core';
import { FlotaService } from '../../core/services/flota.service';
import { VehiculoService } from '../../services/vehiculo.service';
import { DependenciaService, Dependencia } from '../../services/dependencia.service';
import { Vehiculo, EstadoVehiculo } from '../../core/models/fleet.models';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-mantenimiento',
  templateUrl: './mantenimiento.component.html'
})
export class MantenimientoComponent implements OnInit {
  constructor(
    public flotaService: FlotaService,
    private vehiculoService: VehiculoService,
    private dependenciaService: DependenciaService
  ) {}

  // Pestaña activa
  activeTab: 'VEHICULOS' | 'DEPENDENCIAS' = 'VEHICULOS';

  cargando = false;
  cargandoDependencias = false;
  
  private vehiculosSubject = new BehaviorSubject<Vehiculo[]>([]);
  vehiculos$ = this.vehiculosSubject.asObservable();
  
  // Lista de todas las dependencias
  listaDependencias: Dependencia[] = [];
  nuevaDependenciaNombre: string = '';
  creandoDependencia = false;

  // Contadores
  totalVehiculos = 0;
  totalOperativos = 0;
  totalInoperativos = 0;
  totalMantenimiento = 0;

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.vehiculoService.obtenerVehiculos().subscribe({
      next: (data) => {
        this.vehiculosSubject.next(data);
        this.calcularEstadisticas(data);
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar vehículos', err);
        this.cargando = false;
      }
    });

    this.cargarDependencias();
  }

  cargarDependencias(): void {
    this.cargandoDependencias = true;
    this.dependenciaService.obtenerTodasDependencias().subscribe({
      next: (data) => {
        this.listaDependencias = data;
        this.cargandoDependencias = false;
      },
      error: (err) => {
        console.error('Error al cargar dependencias', err);
        this.cargandoDependencias = false;
      }
    });
  }

  calcularEstadisticas(vehiculos: Vehiculo[]): void {
    this.totalVehiculos = vehiculos.length;
    this.totalOperativos = vehiculos.filter(v => v.estado === 'OPERATIVO').length;
    this.totalInoperativos = vehiculos.filter(v => v.estado === 'INOPERATIVO' || v.estado === 'INACTIVO').length;
    this.totalMantenimiento = vehiculos.filter(v => v.estado === 'TALLER').length;
  }

  // --- ACCIONES VEHÍCULOS ---
  cambiarEstadoVehiculo(vehiculo: Vehiculo, event: any): void {
    const nuevoEstado = event.target.value as EstadoVehiculo;
    const estadoOriginal = vehiculo.estado;
    const fechaOriginal = vehiculo.fechaCambioOperatividad;
    
    // Optimistic UI update
    vehiculo.estado = nuevoEstado;
    // Format local time to yyyy-MM-dd'T'HH:mm:ss to match backend Jackson format
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    vehiculo.fechaCambioOperatividad = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 19);
    this.calcularEstadisticas(this.vehiculosSubject.getValue());

    this.vehiculoService.actualizarVehiculo(vehiculo.id, vehiculo).subscribe({
      next: (res) => {
        console.log('Estado actualizado correctamente', res);
        // Ensure we use the date from backend
        if (res.fechaCambioOperatividad) {
          vehiculo.fechaCambioOperatividad = res.fechaCambioOperatividad;
        }
      },
      error: (err) => {
        console.error('Error al actualizar estado', err);
        // Revertir si falla
        vehiculo.estado = estadoOriginal;
        vehiculo.fechaCambioOperatividad = fechaOriginal;
        this.calcularEstadisticas(this.vehiculosSubject.getValue());
        alert('Error al actualizar el estado del vehículo.');
      }
    });
  }

  // --- ACCIONES DEPENDENCIAS ---
  toggleDependencia(dependencia: Dependencia): void {
    // Optimistic
    dependencia.activa = !dependencia.activa;
    
    if(dependencia.id) {
      this.dependenciaService.actualizarDependencia(dependencia.id, dependencia).subscribe({
        next: () => {},
        error: (err) => {
          console.error('Error al actualizar dependencia', err);
          dependencia.activa = !dependencia.activa; // Revert
          alert('Error al actualizar dependencia.');
        }
      });
    }
  }

  agregarDependencia(): void {
    if(!this.nuevaDependenciaNombre || this.nuevaDependenciaNombre.trim() === '') return;
    
    this.creandoDependencia = true;
    const nueva: Dependencia = {
      nombre: this.nuevaDependenciaNombre.trim(),
      activa: true
    };

    this.dependenciaService.crearDependencia(nueva).subscribe({
      next: (res) => {
        this.listaDependencias.push(res);
        this.nuevaDependenciaNombre = '';
        this.creandoDependencia = false;
      },
      error: (err) => {
        console.error('Error creando dependencia', err);
        alert('Error creando dependencia. Asegúrate de que el nombre no esté duplicado.');
        this.creandoDependencia = false;
      }
    });
  }
}