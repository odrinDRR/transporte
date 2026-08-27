import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

// ==========================================
// IMPORTACIÓN DEL MODELO GLOBAL
// ==========================================
import { Vehiculo } from 'src/app/core/models/fleet.models';

export interface Conductor {
  id: number; // CORRECCIÓN: Se cambió de string a number para coincidir con Vehiculo.conductorId
  nombre: string;
}

@Component({
  selector: 'app-flota',
  templateUrl: './flota.component.html',
  styleUrls: ['./flota.component.scss']
})
export class FlotaComponent implements OnInit {

  // ==========================================
  // ESTADOS Y PROPIEDADES DEL COMPONENTE
  // ==========================================
  mostrarRegistro: boolean = false;
  mostrarCarrusel: boolean = false;
  vehiculoSeleccionado: Vehiculo | null = null;
  
  // Gestión de Galería/Carrusel
  fotosCarrusel: string[] = [];
  indiceFotoActual: number = 0;

  // Carga de Archivos
  fotoPerfilVehiculo: string | null = null;
  fotosVehiculo: string[] = [];

  // Arrays Dinámicos para Selects
  anios: number[] = Array.from({ length: 2026 - 1980 + 1 }, (_, i) => 2026 - i);
  cargasKg: number[] = [500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 5000, 6000, 7000, 8000];

  // Modelo de Formulario
  nuevoVehiculo: Partial<Vehiculo> = this.inicializarFormulario();

  // Mock de Servicios y Observables para RxJS
  conductores$: Observable<Conductor[]> = of([
    { id: 1, nombre: 'Carlos Mendoza' }, // CORRECCIÓN: IDs numéricos
    { id: 2, nombre: 'José Rodríguez' },
    { id: 3, nombre: 'Luis Alvarado' }
  ]);

  private vehiculosSubject = new BehaviorSubject<Vehiculo[]>([
    {
      id: 1,
      placa: 'A82BC3',
      tipoVehiculo: 'Camión Ligero',
      identificador: 'Plataforma 01',
      marcaModelo: 'Ford Triton V8',
      anio: 2022,
      color: 'Blanco',
      vin: '839201928301',
      capacidadCarga: 3500,
      kilometraje: 45000,
      estado: 'OPERATIVO',
      conductorId: 1, // CORRECCIÓN: asignación numérica
      fotos: ['https://images.unsplash.com/photo-1586191582119-940dd7e273f5?q=80&w=600']
    },
    {
      id: 2,
      placa: 'A91XY8',
      tipoVehiculo: 'Furgón',
      identificador: 'Reparto Zona Norte',
      marcaModelo: 'Chevrolet N300',
      anio: 2021,
      color: 'Gris',
      vin: '109283746501',
      capacidadCarga: 1500,
      kilometraje: 82000,
      estado: 'TALLER',
      conductorId: 2, // CORRECCIÓN: asignación numérica
      fotos: ['https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=600']
    }
  ]);

  vehiculosFiltrados$: BehaviorSubject<Vehiculo[]> = new BehaviorSubject<Vehiculo[]>([]);
  
  // Mock de servicio local para validaciones de rol
  flotaService = {
    vehiculos$: this.vehiculosSubject.asObservable(),
    puedeEditarOEliminar: () => true
  };
  
  flota: Vehiculo[] | null = null;

  ngOnInit(): void {
    this.vehiculosSubject.subscribe(lista => {
      this.vehiculosFiltrados$.next(lista);
    });
  }

  // ==========================================
  // LÓGICA Y VALIDACIONES DE FORMULARIO
  // ==========================================

  private inicializarFormulario(): Partial<Vehiculo> {
    return {
      placa: '',
      tipoVehiculo: '',
      identificador: '',
      marcaModelo: '',
      anio: undefined,           // CORRECCIÓN: undefined para evitar error con number
      color: '',
      vin: '',
      capacidadCarga: undefined, // CORRECCIÓN: undefined para evitar error con number
      kilometraje: undefined, 
      estado: 'OPERATIVO' as any // Se fuerza el tipo temporalmente si es enum en el modelo
    };
  }

  validarKilometraje(event: Event): void {
    const input = event.target as HTMLInputElement;
    let valor = parseInt(input.value, 10);

    if (isNaN(valor) || valor < 0) {
      this.nuevoVehiculo.kilometraje = undefined;
      input.value = '';
    } else if (valor > 400000) {
      this.nuevoVehiculo.kilometraje = 400000;
      input.value = '400000';
    } else {
      this.nuevoVehiculo.kilometraje = valor;
    }
  }

  validarAlfanumerico(event: Event, campo: keyof Vehiculo): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    (this.nuevoVehiculo as any)[campo] = input.value;
  }

  validarSoloNumeros(event: Event, campo: keyof Vehiculo): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '');
    (this.nuevoVehiculo as any)[campo] = input.value;
  }

  // ==========================================
  // GESTIÓN DE BÚSQUEDA Y FILTROS
  // ==========================================

  aplicarFiltroBuscador(event: Event): void {
    const termino = (event.target as HTMLInputElement).value.toLowerCase();
    const listaCompleta = this.vehiculosSubject.getValue();

    const filtrados = listaCompleta.filter(v =>
      v.placa.toLowerCase().includes(termino) ||
      v.identificador.toLowerCase().includes(termino) ||
      v.marcaModelo.toLowerCase().includes(termino)
    );

    this.vehiculosFiltrados$.next(filtrados);
  }

  filtrarPorEstado(estado: string): void {
    const listaCompleta = this.vehiculosSubject.getValue();
    if (estado === 'TODOS') {
      this.vehiculosFiltrados$.next(listaCompleta);
    } else {
      this.vehiculosFiltrados$.next(listaCompleta.filter(v => v.estado === estado));
    }
  }

  // ==========================================
  // MANEJO DE ARCHIVOS Y GALERÍA
  // ==========================================

  cargarFotoPerfil(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => this.fotoPerfilVehiculo = e.target.result;
      reader.readAsDataURL(file);
    }
  }

  cargarFotos(event: any): void {
    const files: FileList = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        if (this.fotosVehiculo.length < 10) {
          const reader = new FileReader();
          reader.onload = (e: any) => this.fotosVehiculo.push(e.target.result);
          reader.readAsDataURL(files[i]);
        }
      }
    }
  }

  alternarRegistro(): void {
    this.mostrarRegistro = !this.mostrarRegistro;
    if (!this.mostrarRegistro) {
      this.nuevoVehiculo = this.inicializarFormulario();
      this.fotoPerfilVehiculo = null;
      this.fotosVehiculo = [];
    }
  }

  guardarVehiculo(): void {
    if (!this.fotoPerfilVehiculo || this.fotosVehiculo.length !== 10) return;

    // Convertimos de vuelta los valores tipo "select/string" a números si es necesario
    const nuevo: Vehiculo = {
      ...(this.nuevoVehiculo as Vehiculo),
      id: Date.now(),
      anio: Number(this.nuevoVehiculo.anio),
      capacidadCarga: Number(this.nuevoVehiculo.capacidadCarga),
      fotos: [this.fotoPerfilVehiculo, ...this.fotosVehiculo]
    };

    const listaActual = this.vehiculosSubject.getValue();
    this.vehiculosSubject.next([nuevo, ...listaActual]);
    this.alternarRegistro();
  }

  eliminar(id?: number): void {
    if (!id) return;
    const listaActual = this.vehiculosSubject.getValue().filter(v => v.id !== id);
    this.vehiculosSubject.next(listaActual);
  }

  // ==========================================
  // MODALES, VISTA PREVIA Y AUXILIARES
  // ==========================================

  abrirFicha(v: Vehiculo): void {
    this.vehiculoSeleccionado = v;
  }

  cerrarFicha(): void {
    this.vehiculoSeleccionado = null;
  }

  imprimirFicha(): void {
    window.print();
  }

  abrirCarrusel(v: Vehiculo): void {
    this.fotosCarrusel = v.fotos || [];
    this.indiceFotoActual = 0;
    this.mostrarCarrusel = true;
  }

  cerrarCarrusel(): void {
    this.mostrarCarrusel = false;
  }

  siguienteFoto(): void {
    if (this.indiceFotoActual < this.fotosCarrusel.length - 1) {
      this.indiceFotoActual++;
    } else {
      this.indiceFotoActual = 0;
    }
  }

  anteriorFoto(): void {
    if (this.indiceFotoActual > 0) {
      this.indiceFotoActual--;
    } else {
      this.indiceFotoActual = this.fotosCarrusel.length - 1;
    }
  }

  // CORRECCIÓN: El parámetro conductorId ahora espera number | null
  obtenerNombreConductor(conductorId?: number | null, conductores?: Conductor[] | null): string {
    if (!conductorId || !conductores) return 'Sin Asignar';
    const c = conductores.find(item => item.id === conductorId);
    return c ? c.nombre : 'Sin Asignar';
  }
}