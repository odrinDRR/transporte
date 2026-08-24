import { Component, OnInit } from '@angular/core';
import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { FlotaService } from '../../core/services/flota.service';
import { Vehiculo, Conductor } from '../../core/models/fleet.models';

@Component({
  selector: 'app-flota',
  templateUrl: './flota.component.html',
  styleUrls: ['./flota.component.scss']
})
export class FlotaComponent implements OnInit {
// En flota.component.ts

validarSoloNumeros(event: Event, campo: string): void {
  const input = event.target as HTMLInputElement;
  const valorLimpio = input.value.replace(/[^0-9]/g, '');
  input.value = valorLimpio;
  
  if (this.nuevoVehiculo) {
    (this.nuevoVehiculo as any)[campo] = valorLimpio;
  }
}
  filtroTexto$ = new BehaviorSubject<string>('');
  filtroEstado$ = new BehaviorSubject<string>('TODOS');
  vehiculosFiltrados$!: Observable<Vehiculo[]>;
  conductores$!: Observable<Conductor[]>;
  
  // Ficha Técnica y QR
  vehiculoSeleccionado: Vehiculo | null = null;
  fotoFichaIndex: number = 0;

  // Galería / Carrusel Modal Ampliado
  mostrarCarrusel: boolean = false;
  fotosCarrusel: string[] = [];
  indiceFotoActual: number = 0;
  vehiculoCarrusel: Vehiculo | null = null;

  // Modal Nuevo Vehículo
  mostrarModalNuevo: boolean = false;
  nuevoVehiculo = {
    placa: '',
    identificador: '',
    marcaModelo: '',
    anio: new Date().getFullYear(),
    vin: '',
    kilometraje: 0,
    estado: 'OPERATIVO' as 'OPERATIVO' | 'TALLER' | 'INACTIVO',
    conductorId: null as number | null,
    ultimoServicio: '',
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
        return vehiculos.filter(v => {
          const coincideTexto = v.placa.toLowerCase().includes(texto.toLowerCase()) ||
                                v.identificador.toLowerCase().includes(texto.toLowerCase()) ||
                                v.marcaModelo.toLowerCase().includes(texto.toLowerCase());
          const coincideEstado = estado === 'TODOS' || v.estado === estado;
          return coincideTexto && coincideEstado;
        });
      })
    );
  }
  

  aplicarTexto(e: Event): void { 
    this.filtroTexto$.next((e.target as HTMLInputElement).value); 
  }

  aplicarEstado(est: string): void { 
    this.filtroEstado$.next(est); 
  }
  
  obtenerNombreConductor(id: number | null, conductores: Conductor[]): string {
    if (!id) return 'Sin Asignar';
    const c = conductores.find(item => item.id === id);
    return c ? c.nombre : 'Sin Asignar';
  }

  // --- FICHA TÉCNICA ---
  abrirFicha(v: Vehiculo): void { 
    this.vehiculoSeleccionado = v; 
    this.fotoFichaIndex = 0;
  }

  cerrarFicha(): void { 
    this.vehiculoSeleccionado = null; 
    this.fotoFichaIndex = 0;
  }

  siguienteFotoFicha(): void {
    if (!this.vehiculoSeleccionado?.fotos?.length) return;
    this.fotoFichaIndex = (this.fotoFichaIndex + 1) % this.vehiculoSeleccionado.fotos.length;
  }

  anteriorFotoFicha(): void {
    if (!this.vehiculoSeleccionado?.fotos?.length) return;
    this.fotoFichaIndex = (this.fotoFichaIndex - 1 + this.vehiculoSeleccionado.fotos.length) % this.vehiculoSeleccionado.fotos.length;
  }

  // --- CARRUSEL FULLSCREEN ---
  abrirCarrusel(v: Vehiculo, indexInicial: number = 0): void {
    if (!v.fotos || v.fotos.length === 0) return;
    this.vehiculoCarrusel = v;
    this.fotosCarrusel = v.fotos.slice(0, 10);
    this.indiceFotoActual = indexInicial;
    this.mostrarCarrusel = true;
  }

  cerrarCarrusel(): void {
    this.mostrarCarrusel = false;
    this.fotosCarrusel = [];
    this.indiceFotoActual = 0;
    this.vehiculoCarrusel = null;
  }

  siguienteFoto(): void {
    if (this.fotosCarrusel.length === 0) return;
    this.indiceFotoActual = (this.indiceFotoActual + 1) % this.fotosCarrusel.length;
  }

  anteriorFoto(): void {
    if (this.fotosCarrusel.length === 0) return;
    this.indiceFotoActual = (this.indiceFotoActual - 1 + this.fotosCarrusel.length) % this.fotosCarrusel.length;
  }

  seleccionarFoto(index: number): void {
    this.indiceFotoActual = index;
  }

  // --- REGISTRO DE NUEVO VEHÍCULO ---
  abrirModalNuevo(): void {
    this.nuevoVehiculo = {
      placa: '',
      identificador: '',
      marcaModelo: '',
      anio: new Date().getFullYear(),
      vin: '',
      kilometraje: 0,
      estado: 'OPERATIVO',
      conductorId: null,
      ultimoServicio: new Date().toISOString().split('T')[0],
      fotos: [],
      seguroRcvVigente: true
    };
    this.mostrarModalNuevo = true;
  }

  cerrarModalNuevo(): void {
    this.mostrarModalNuevo = false;
  }
  


// Genera la lista desplegable desde 2026 hasta 1980
aniosDisponibles: number[] = Array.from({ length: 2026 - 1980 + 1 }, (_, i) => 2026 - i);

validarKilometraje(event: Event): void {
  const input = event.target as HTMLInputElement;
  let valor = input.value.replace(/[^0-9]/g, '');

  if (valor.length > 6) {
    valor = valor.slice(0, 6);
  }

  if (Number(valor) > 350000) {
    valor = '350000';
  }

  input.value = valor;
  if (this.nuevoVehiculo) {
    this.nuevoVehiculo.kilometraje = valor ? Number(valor) : 0;
  }
}

  cargarFotosNuevoVehiculo(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const archivos = Array.from(input.files);
      const cuposDisponibles = 10 - this.nuevoVehiculo.fotos.length;

      if (cuposDisponibles <= 0) {
        alert('Has alcanzado el límite máximo de 10 imágenes para este vehículo.');
        return;
      }

      const procesar = archivos.slice(0, cuposDisponibles);
      procesar.forEach((file: File) => {
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          if (e.target?.result && this.nuevoVehiculo.fotos.length < 10) {
            this.nuevoVehiculo.fotos.push(e.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  }

  eliminarFotoNueva(index: number): void {
    this.nuevoVehiculo.fotos.splice(index, 1);
  }

  guardarNuevoVehiculo(): void {
    if (!this.nuevoVehiculo.placa || !this.nuevoVehiculo.identificador || !this.nuevoVehiculo.marcaModelo || !this.nuevoVehiculo.vin) {
      alert('Por favor completa todos los campos obligatorios (Placa, Código, Marca/Modelo y VIN).');
      return;
    }

    if (this.nuevoVehiculo.fotos.length === 0) {
      this.nuevoVehiculo.fotos.push('assets/images/default-truck.jpg');
    }

    this.flotaService.agregarVehiculo({ ...this.nuevoVehiculo });
    alert(`Unidad ${this.nuevoVehiculo.placa} registrada exitosamente.`);
    this.cerrarModalNuevo();
  }

  imprimirFicha(): void {
    window.print();
  }

  eliminar(id: number): void {
    if (confirm('¿Eliminar esta unidad de la flota?')) {
      this.flotaService.eliminarVehiculo(id);
    }
  }

  
}