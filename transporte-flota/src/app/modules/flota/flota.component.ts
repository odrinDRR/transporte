import { Component, OnInit } from '@angular/core';
<<<<<<< HEAD
import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { FlotaService } from '../../core/services/flota.service';
import { VehiculoService } from '../../services/vehiculo.service';
import { ConductorService } from '../../services/conductor.service';
import { ArchivoService } from '../../services/archivo.service';
import { Vehiculo, Conductor } from '../../core/models/fleet.models';
=======
import { BehaviorSubject, Observable, of } from 'rxjs';

// ==========================================
// IMPORTACIÓN DEL MODELO GLOBAL
// ==========================================
import { Vehiculo } from 'src/app/core/models/fleet.models';

export interface Conductor {
  id: number; // CORRECCIÓN: Se cambió de string a number para coincidir con Vehiculo.conductorId
  nombre: string;
}
>>>>>>> origin/diego

@Component({
  selector: 'app-flota',
  templateUrl: './flota.component.html',
  styleUrls: ['./flota.component.scss']
})
export class FlotaComponent implements OnInit {
<<<<<<< HEAD
  // Subjects locales para almacenar la data real de la BD
  private vehiculosSubject = new BehaviorSubject<Vehiculo[]>([]);
  public vehiculos$ = this.vehiculosSubject.asObservable();

  private conductoresSubject = new BehaviorSubject<Conductor[]>([]);
  public conductores$ = this.conductoresSubject.asObservable();

  filtroTexto$ = new BehaviorSubject<string>('');
  filtroEstado$ = new BehaviorSubject<string>('TODOS');
  vehiculosFiltrados$!: Observable<Vehiculo[]>;

  // Variables de UI (Modales, Galería, etc.)
  vehiculoSeleccionado: Vehiculo | null = null;
=======

  // ==========================================
  // ESTADOS Y PROPIEDADES DEL COMPONENTE
  // ==========================================
  mostrarRegistro: boolean = false;
>>>>>>> origin/diego
  mostrarCarrusel: boolean = false;
  vehiculoSeleccionado: Vehiculo | null = null;
  
  // Gestión de Galería/Carrusel
  fotosCarrusel: string[] = [];
  indiceFotoActual: number = 0;
<<<<<<< HEAD
  vehiculoCarrusel: Vehiculo | null = null;
  mostrarRegistro: boolean = false;
  fotoPerfilVehiculo: File | null = null;
  fotosVehiculo: File[] = [];

  // ⚠️ ATENCIÓN: Ajusté "marca" y "modelo" para que coincidan con la tabla de PostgreSQL
  nuevoVehiculo = {
    placa: '',
    identificador: '',
    marca: '', 
    modelo: '',
    anio: new Date().getFullYear(),
    vin: '',
    kilometraje: 0,
    estado: 'OPERATIVO',
    tipo: 'CARGA', // Agregado según tu base de datos
    conductorId: null
  };

  constructor(
    public flotaService: FlotaService, // Mantenemos para validación de roles
    private vehiculoService: VehiculoService,
    private conductorService: ConductorService,
    private archivoService: ArchivoService
  ) {}

  ngOnInit(): void {
    this.cargarDatosBackend();

    this.vehiculosFiltrados$ = combineLatest([
      this.vehiculos$,
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
            (v.marca && v.marca.toLowerCase().includes(term))
          );
        }
        return resultado;
      })
    );
  }

  // --- MÉTODOS HTTP (CONEXIÓN A SPRING BOOT) ---
  cargarDatosBackend(): void {
    this.vehiculoService.obtenerVehiculos().subscribe({
      next: (data) => this.vehiculosSubject.next(data),
      error: (err) => console.error('Error al cargar vehículos', err)
    });

    this.conductorService.obtenerConductores().subscribe({
      next: (data) => this.conductoresSubject.next(data),
      error: (err) => console.error('Error al cargar conductores', err)
    });
  }

  guardarVehiculo(): void {
    if (!this.nuevoVehiculo.placa || !this.nuevoVehiculo.identificador || !this.nuevoVehiculo.modelo) {
      alert('Por favor, completa los datos básicos.');
      return;
    }

    if (!this.fotoPerfilVehiculo) {
      alert('Debes adjuntar la foto de perfil.');
      return;
    }

    // 1. Subir la foto primero
    this.archivoService.subirArchivo(this.fotoPerfilVehiculo).subscribe({
      next: (res) => {
        // 2. Construir el payload del vehículo con la URL devuelta por el servidor
        const payload = {
          ...this.nuevoVehiculo,
          urlFotoPerfil: res.url,
          marcaModelo: `${this.nuevoVehiculo.marca} ${this.nuevoVehiculo.modelo}`.trim()
        };
        
        // 3. Guardar el vehículo en la base de datos
        this.vehiculoService.crearVehiculo(payload as any).subscribe({
          next: (vehiculoDb) => {
            alert(`¡Vehículo ${vehiculoDb.placa} registrado con éxito en la base de datos!`);
            this.cargarDatosBackend(); // Refrescar la grilla
            this.alternarRegistro();
            this.resetearFormulario();
          },
          error: (err) => {
            console.error('Error guardando en BD', err);
            alert('Ocurrió un error al intentar guardar el vehículo.');
          }
        });
      },
      error: (err) => {
        console.error('Error subiendo foto', err);
        alert('Ocurrió un error al intentar subir la foto de perfil.');
      }
    });
  }

  eliminar(id: number): void {
    if (confirm('¿Eliminar definitivamente esta unidad de la base de datos?')) {
      this.vehiculoService.eliminarVehiculo(id).subscribe({
        next: () => {
          alert('Vehículo eliminado');
          this.cargarDatosBackend(); // Refrescar la grilla
        },
        error: (err) => console.error('Error al eliminar', err)
      });
    }
  }

  // --- MÉTODOS DE UTILIDAD Y UI (Mantienen tu lógica original) ---
  resetearFormulario(): void {
    this.nuevoVehiculo = { placa: '', identificador: '', marca: '', modelo: '', anio: new Date().getFullYear(), vin: '', kilometraje: 0, estado: 'OPERATIVO', tipo: 'CARGA', conductorId: null };
  }
=======

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
>>>>>>> origin/diego

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

<<<<<<< HEAD
  filtrarPorEstado(estado: string): void {
    this.filtroEstado$.next(estado);
  }

  obtenerNombreConductor(id: number | null, conductores: Conductor[]): string {
    if (!id) return 'Sin Asignar';
    const c = conductores.find(item => item.id === id);
    return c ? `${c.nombre}` : 'Sin Asignar';
  }

  alternarRegistro(): void {
    this.mostrarRegistro = !this.mostrarRegistro;
    this.fotosVehiculo = [];
    this.fotoPerfilVehiculo = null;
  }

  validarAlfanumerico(event: Event, campo: string): void {
    const input = event.target as HTMLInputElement;
    const valorLimpio = input.value.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase();
    input.value = valorLimpio;
    if (this.nuevoVehiculo) (this.nuevoVehiculo as any)[campo] = valorLimpio;
  }

  validarSoloNumeros(event: Event, campo: string): void {
    const input = event.target as HTMLInputElement;
    const valorLimpio = input.value.replace(/[^0-9]/g, '');
    input.value = valorLimpio;
    if (this.nuevoVehiculo) (this.nuevoVehiculo as any)[campo] = valorLimpio;
  }

  // (Mantén aquí el resto de tus métodos visuales como cargarFotoPerfil, abrirFicha, cerrarCarrusel, etc.)
=======
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

>>>>>>> origin/diego
  cargarFotoPerfil(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => this.fotoPerfilVehiculo = e.target.result;
      reader.readAsDataURL(file);
    }
  }
  cargarFotos(event: any): void {
<<<<<<< HEAD
    if (event.target.files) this.fotosVehiculo = Array.from(event.target.files);
=======
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
>>>>>>> origin/diego
  }
  abrirFicha(v: Vehiculo): void { this.vehiculoSeleccionado = v; }
  cerrarFicha(): void { this.vehiculoSeleccionado = null; }
  imprimirFicha(): void { window.print(); }

  eliminar(id?: number): void {
    if (!id) return;
    const listaActual = this.vehiculosSubject.getValue().filter(v => v.id !== id);
    this.vehiculosSubject.next(listaActual);
  }

<<<<<<< HEAD
  cerrarCarrusel(): void {
    this.mostrarCarrusel = false;
    this.fotosCarrusel = [];
    this.indiceFotoActual = 0;
  }

  siguienteFoto(): void {
    if (this.fotosCarrusel.length === 0) return;
    this.indiceFotoActual = (this.indiceFotoActual + 1) % this.fotosCarrusel.length;
  }

  anteriorFoto(): void {
    if (this.fotosCarrusel.length === 0) return;
    this.indiceFotoActual = (this.indiceFotoActual - 1 + this.fotosCarrusel.length) % this.fotosCarrusel.length;
=======
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
>>>>>>> origin/diego
  }
}