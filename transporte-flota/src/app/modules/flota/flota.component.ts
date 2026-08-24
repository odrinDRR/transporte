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

  // Controles de Registro de Vehículo
  mostrarRegistro: boolean = false;
  fotoPerfilVehiculo: File | null = null;
  fotosVehiculo: File[] = [];
  nuevoVehiculo = {
    placa: '',
    identificador: '',
    marcaModelo: '',
    anio: null,
    vin: '',
    kilometraje: null,
    estado: 'OPERATIVO' as any,
    conductorId: null,
    fotos: [] as string[],
    seguroRcvVigente: true
  };

  constructor(public flotaService: FlotaService) {}

  ngOnInit(): void {
    this.conductores$ = this.flotaService.conductores$;
    this.vehiculosFiltrados$ = combineLatest([
      this.flotaService.vehiculos$,
      this.filtroTexto$,
      this.filtroEstado$
    ]).pipe(
      map(([vehiculos, texto, estado]) => {
        let resultado = vehiculos;

        if (estado !== 'TODOS') {
          resultado = resultado.filter(v => v.estado === estado);
        }

        if (texto) {
          const term = texto.toLowerCase();
          resultado = resultado.filter(v => 
            v.placa.toLowerCase().includes(term) ||
            v.identificador.toLowerCase().includes(term)
          );
        }

        return resultado;
      })
    );
  }

  aplicarFiltroBuscador(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filtroTexto$.next(input.value);
  }

  filtrarPorEstado(estado: string): void {
    this.filtroEstado$.next(estado);
  }

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

  // --- MÉTODOS DE REGISTRO ---
  alternarRegistro(): void {
    this.mostrarRegistro = !this.mostrarRegistro;
    this.fotosVehiculo = [];
    this.fotoPerfilVehiculo = null; // Limpiamos al salir
  }

  cargarFotoPerfil(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.fotoPerfilVehiculo = event.target.files[0];
    }
  }

  cargarFotos(event: any): void {
    if (event.target.files) {
      this.fotosVehiculo = Array.from(event.target.files);
    }
  }

 guardarVehiculo(): void {
    if (!this.nuevoVehiculo.placa || !this.nuevoVehiculo.identificador || !this.nuevoVehiculo.marcaModelo) {
      alert('Por favor, completa los datos básicos (Placa, Nombre y Marca/Modelo).');
      return;
    }

    if (!this.fotoPerfilVehiculo) {
      alert('Debe subir la Foto de Perfil principal del vehículo.');
      return;
    }

    if (this.fotosVehiculo.length !== 10) {
      alert(`Debe subir exactamente 10 fotos adicionales del vehículo. Lleva ${this.fotosVehiculo.length}.`);
      return;
    }

    // --- EL TRUCO VISUAL ---
    // Creamos una URL temporal local para que la imagen se vea al instante en la tarjeta
    const urlTemporal = URL.createObjectURL(this.fotoPerfilVehiculo);
    
    // Guardamos esa URL temporal como la foto principal del vehículo
    this.nuevoVehiculo.fotos = [urlTemporal]; 
    
    this.flotaService.agregarVehiculo(this.nuevoVehiculo as any);
    alert(`¡Vehículo ${this.nuevoVehiculo.placa} registrado con éxito!`);
    
    // Reseteamos el formulario
    this.nuevoVehiculo = { placa: '', identificador: '', marcaModelo: '', anio: null, vin: '', kilometraje: null, estado: 'OPERATIVO', conductorId: null, fotos: [], seguroRcvVigente: true };
    this.alternarRegistro();
  }
}