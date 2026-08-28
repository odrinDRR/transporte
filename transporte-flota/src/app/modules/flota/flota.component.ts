import { Component, OnInit } from '@angular/core';
import { Observable, combineLatest, BehaviorSubject, forkJoin, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { FlotaService } from '../../core/services/flota.service';
import { VehiculoService } from '../../services/vehiculo.service';
import { ConductorService } from '../../services/conductor.service';
import { ArchivoService } from '../../services/archivo.service';
import { SupabaseStorageService } from '../../services/supabase-storage.service';
import { Vehiculo, Conductor } from '../../core/models/fleet.models';

@Component({
  selector: 'app-flota',
  templateUrl: './flota.component.html',
  styleUrls: ['./flota.component.scss']
})
export class FlotaComponent implements OnInit {
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
  mostrarCarrusel: boolean = false;
  fotosCarrusel: string[] = [];
  indiceFotoActual: number = 0;
  vehiculoCarrusel: Vehiculo | null = null;
  mostrarRegistro: boolean = false;
  
  // Carga de Archivos
  fotoPerfilVehiculo: File | null = null; 
  fotosVehiculo: File[] = []; 
  
  // Arrays Dinámicos para Selects
  anios: number[] = Array.from({ length: 2026 - 1980 + 1 }, (_, i) => 2026 - i);
  cargasKg: number[] = [500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 5000, 6000, 7000, 8000];

  nuevoVehiculo: Partial<Vehiculo> = this.inicializarFormulario();

  constructor(
    public flotaService: FlotaService, 
    private vehiculoService: VehiculoService,
    private conductorService: ConductorService,
    private archivoService: ArchivoService,
    private supabaseStorage: SupabaseStorageService
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
            (v.placa && v.placa.toLowerCase().includes(term)) ||
            (v.marcaModelo && v.marcaModelo.toLowerCase().includes(term)) ||
            (v.identificador && v.identificador.toLowerCase().includes(term))
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

  private inicializarFormulario(): Partial<Vehiculo> {
    return {
      placa: '',
      tipoVehiculo: '',
      identificador: '',
      marca: '',
      modelo: '',
      marcaModelo: '',
      anio: new Date().getFullYear(),
      color: '',
      vin: '',
      capacidadCarga: undefined,
      kilometraje: 0,
      estado: 'OPERATIVO',
      conductorId: null
    };
  }

  async guardarVehiculo() {
    if (!this.nuevoVehiculo.placa || !this.nuevoVehiculo.identificador) {
      alert('Por favor, completa los datos básicos.');
      return;
    }

    if (!this.fotoPerfilVehiculo) {
      alert('Debes adjuntar la foto de perfil.');
      return;
    }

    if (this.fotosVehiculo.length !== 10) {
      alert('Debes adjuntar exactamente 10 fotos para la galería.');
      return;
    }

    try {
      // 1. Subir Foto de Perfil a Supabase
      const urlPerfil = await this.supabaseStorage.uploadFile(
        this.fotoPerfilVehiculo,
        'flota_archivos',
        'vehiculos/perfiles'
      );

      // 2. Subir Fotos Adicionales (hasta 10) a Supabase
      const urlsGaleria: string[] = [];
      const fotosParaSubir = this.fotosVehiculo.slice(0, 10); // Limitar a 10
      for (const foto of fotosParaSubir) {
        const urlAdicional = await this.supabaseStorage.uploadFile(
          foto,
          'flota_archivos',
          'vehiculos/galeria'
        );
        urlsGaleria.push(urlAdicional);
      }

      // 3. Construir Payload
      const payload = {
        ...this.nuevoVehiculo,
        urlFotoPerfil: urlPerfil,
        fotos: urlsGaleria,
        capacidadCarga: this.nuevoVehiculo.capacidadCarga ? Number(this.nuevoVehiculo.capacidadCarga) : undefined,
        marcaModelo: `${this.nuevoVehiculo.marca} ${this.nuevoVehiculo.modelo}`.trim()
      };

      // 4. Guardar en Backend
      this.vehiculoService.crearVehiculo(payload as any).subscribe({
        next: (vehiculoDb) => {
          alert(`¡Vehículo ${vehiculoDb.placa} registrado con éxito!`);
          this.cargarDatosBackend();
          this.alternarRegistro();
          this.resetearFormulario();
        },
        error: (err) => {
          console.error('Error guardando en BD', err);
          alert('Ocurrió un error al intentar guardar el vehículo.');
        }
      });
    } catch (error) {
      console.error('Error subiendo imágenes a Supabase', error);
      alert('Error subiendo las imágenes. Por favor, intenta de nuevo.');
    }
  }

  eliminar(id?: number): void {
    if (!id) return;
    if (confirm('¿Eliminar definitivamente esta unidad de la base de datos?')) {
      this.vehiculoService.eliminarVehiculo(id).subscribe({
        next: () => {
          alert('Vehículo eliminado');
          this.cargarDatosBackend(); 
        },
        error: (err) => console.error('Error al eliminar', err)
      });
    }
  }

  // --- MÉTODOS DE UTILIDAD Y UI ---
  resetearFormulario(): void {
    this.nuevoVehiculo = this.inicializarFormulario();
  }

  aplicarFiltroBuscador(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filtroTexto$.next(input.value);
  }

  filtrarPorEstado(estado: string): void {
    this.filtroEstado$.next(estado);
  }

  obtenerNombreConductor(id?: number | null, conductores?: Conductor[] | null): string {
    if (!id || !conductores) return 'Sin Asignar';
    const c = conductores.find(item => item.id === id);
    return c ? `${c.nombre}` : 'Sin Asignar';
  }

  alternarRegistro(): void {
    this.mostrarRegistro = !this.mostrarRegistro;
    this.fotosVehiculo = [];
    this.fotoPerfilVehiculo = null;
    if (!this.mostrarRegistro) {
      this.resetearFormulario();
    }
  }

  validarAlfanumerico(event: Event, campo: keyof Vehiculo): void {
    const input = event.target as HTMLInputElement;
    const valorLimpio = input.value.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase();
    input.value = valorLimpio;
    if (this.nuevoVehiculo) (this.nuevoVehiculo as any)[campo] = valorLimpio;
  }

  validarSoloNumeros(event: Event, campo: keyof Vehiculo): void {
    const input = event.target as HTMLInputElement;
    const valorLimpio = input.value.replace(/[^0-9]/g, '');
    input.value = valorLimpio;
    if (this.nuevoVehiculo) (this.nuevoVehiculo as any)[campo] = valorLimpio;
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


  cargarFotoPerfil(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.fotoPerfilVehiculo = event.target.files[0];
    }
  }

  cargarFotos(event: any): void {
    if (event.target.files) this.fotosVehiculo = Array.from(event.target.files);
  }

  abrirFicha(v: Vehiculo): void { this.vehiculoSeleccionado = v; }
  cerrarFicha(): void { this.vehiculoSeleccionado = null; }
  imprimirFicha(): void { window.print(); }

  // --- CARRUSEL FULLSCREEN ---
  abrirCarrusel(v: Vehiculo, indexInicial: number = 0): void {
    if (!v.fotos || v.fotos.length === 0) return;
    this.vehiculoCarrusel = v;
    this.fotosCarrusel = v.fotos.map(f => f.startsWith('http') ? f : 'http://localhost:8080' + f).slice(0, 10);
    this.indiceFotoActual = indexInicial;
    this.mostrarCarrusel = true;
  }

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
  }

  seleccionarFoto(index: number): void {
    this.indiceFotoActual = index;
  }
}