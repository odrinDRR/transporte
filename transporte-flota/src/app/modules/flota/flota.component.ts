import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Observable, combineLatest, BehaviorSubject, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { FlotaService } from '../../core/services/flota.service';
import { VehiculoService } from '../../services/vehiculo.service';
import { ConductorService } from '../../services/conductor.service';
import { ArchivoService } from '../../services/archivo.service';
import { SupabaseStorageService } from '../../services/supabase-storage.service';
import { Vehiculo, Conductor, FotosFichaTecnica } from '../../core/models/fleet.models';

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
  guardandoVehiculo: boolean = false;
  mostrarCarrusel: boolean = false;
  vehiculoSeleccionado: Vehiculo | null = null;
  imagenesCargadas: { [key: string]: boolean } = {};
  modoImpresion: 'FICHA' | 'QR' | 'NADA' = 'NADA';
  
  // Gestión de Galería/Carrusel (Se mantiene para ver fotos en la ficha)
  fotosCarrusel: string[] = [];
  indiceFotoActual: number = 0;

  // Carga de Archivos
  fotoPerfilVehiculo: File | null = null;
  fotosEstructuradasArchivos: { [key: string]: File } = {};

  // Arrays Dinámicos para Selects
  anios: number[] = Array.from({ length: 2026 - 1980 + 1 }, (_, i) => 2026 - i);
  cargasKg: number[] = [500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 5000, 6000, 7000, 8000];

  // Modelo de Formulario
  nuevoVehiculo: Partial<Vehiculo> = this.inicializarFormulario();

  prefijoTelefono: string = '0414';
  numeroTelefono: string = '';

  private vehiculosSubject = new BehaviorSubject<Vehiculo[]>([]);
  public vehiculos$: Observable<Vehiculo[]> = this.vehiculosSubject.asObservable();

  private conductoresSubject = new BehaviorSubject<Conductor[]>([]);
  public conductores$: Observable<Conductor[]> = this.conductoresSubject.asObservable();

  filtroTexto$ = new BehaviorSubject<string>('');
  filtroEstado$ = new BehaviorSubject<string>('TODOS');
  vehiculosFiltrados$!: Observable<Vehiculo[]>;

  constructor(
    public flotaService: FlotaService, 
    private vehiculoService: VehiculoService,
    private conductorService: ConductorService,
    private archivoService: ArchivoService,
    private supabaseStorage: SupabaseStorageService,
    private cdr: ChangeDetectorRef
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

  cargandoVehiculos = false;
  cargandoConductores = false;

  // --- MÉTODOS HTTP (CONEXIÓN A SPRING BOOT) ---
  cargarDatosBackend(): void {
    this.cargandoVehiculos = true;
    this.vehiculoService.obtenerVehiculos().subscribe({
      next: (data) => {
        this.vehiculosSubject.next(data);
        this.cargandoVehiculos = false;
      },
      error: (err) => {
        console.error('Error al cargar vehículos', err);
        this.cargandoVehiculos = false;
      }
    });

    this.cargandoConductores = true;
    this.conductorService.obtenerConductores().subscribe({
      next: (data) => {
        this.conductoresSubject.next(data);
        this.cargandoConductores = false;
      },
      error: (err) => {
        console.error('Error al cargar conductores', err);
        this.cargandoConductores = false;
      }
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
      marca: '',
      modelo: '',
      marcaModelo: '',
      anio: undefined,
      color: '',
      vin: '',
      numeroBien: '',
      dependencia: '',
      capacidadCarga: undefined,
      kilometraje: undefined,
      estado: 'OPERATIVO',
      observaciones: '',
      fotosEstructuradas: {}
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

    this.guardandoVehiculo = true;
    try {
      // 1. Preparar subida de Foto de Perfil
      const perfilPromise = this.supabaseStorage.uploadFile(
        this.fotoPerfilVehiculo,
        'flota_archivos',
        'vehiculos/perfiles',
        `perfil_${this.nuevoVehiculo.placa}`
      );

      // 2. Preparar subidas de Fotos Estructuradas (6 vistas)
      const llaves = Object.keys(this.fotosEstructuradasArchivos);
      const subidasPromises = llaves.map(llave => {
        const archivo = this.fotosEstructuradasArchivos[llave];
        if (archivo) {
          return this.supabaseStorage.uploadFile(
            archivo,
            'flota_archivos',
            'vehiculos/ficha_tecnica',
            `${llave}_${this.nuevoVehiculo.placa}`
          ).then(url => ({ llave, url }));
        }
        return Promise.resolve(null);
      });

      // Ejecutar TODAS las subidas en paralelo para máxima velocidad
      const [urlPerfil, resultadosEstructuradas] = await Promise.all([
        perfilPromise,
        Promise.all(subidasPromises)
      ]);

      const urlsEstructuradas: FotosFichaTecnica = {};
      resultadosEstructuradas.forEach(res => {
        if (res) {
          urlsEstructuradas[res.llave as keyof FotosFichaTecnica] = res.url;
        }
      });

      // 3. Construir Payload
      
      const payload = {
        ...this.nuevoVehiculo,
        urlFotoPerfil: urlPerfil,
        fotosEstructuradas: urlsEstructuradas,
        fotos: Object.values(urlsEstructuradas).filter(url => url !== undefined),
        capacidadCarga: this.nuevoVehiculo.capacidadCarga ? Number(this.nuevoVehiculo.capacidadCarga) : undefined
      };

      // 4. Guardar en Backend
      this.vehiculoService.crearVehiculo(payload as any).subscribe({
        next: (vehiculoDb) => {
          alert(`¡Vehículo ${vehiculoDb.placa} registrado con éxito!`);
          this.cargarDatosBackend();
          this.alternarRegistro();
          this.resetearFormulario();
          this.guardandoVehiculo = false;
        },
        error: (err) => {
          console.error('Error guardando en BD', err);
          alert('Ocurrió un error al intentar guardar el vehículo.');
          this.guardandoVehiculo = false;
        }
      });
    } catch (error) {
      console.error('Error subiendo imágenes a Supabase', error);
      alert('Error subiendo las imágenes. Por favor, intenta de nuevo.');
      this.guardandoVehiculo = false;
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
    this.prefijoTelefono = '0414';
    this.numeroTelefono = '';
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

  obtenerDetallesConductor(id?: number | null, conductores?: Conductor[] | null): Conductor | null {
    if (!id || !conductores) return null;
    return conductores.find(item => item.id === id) || null;
  }

  alternarRegistro(): void {
    this.mostrarRegistro = !this.mostrarRegistro;
    this.fotosEstructuradasArchivos = {};
    this.fotoPerfilVehiculo = null;
    if (!this.mostrarRegistro) {
      this.resetearFormulario();
    }
    
    // Test for runtime template crash
    try {
      this.cdr.detectChanges();
    } catch (e: any) {
      console.error('Crash in template!', e);
      alert('Error en el formulario: ' + e.message);
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

  soloNumeros(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
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

  // ==========================================
  // MANEJO DE ARCHIVOS (Ficha Técnica)
  // ==========================================

  cargarFotoPerfil(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.fotoPerfilVehiculo = event.target.files[0];
    }
  }

  cargarFotoEspecifica(event: Event, llave: keyof FotosFichaTecnica): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      // Guardar el File original para enviarlo a Supabase
      this.fotosEstructuradasArchivos[llave] = file;

      // Crear preview en base64 para la UI
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (!this.nuevoVehiculo.fotosEstructuradas) {
          this.nuevoVehiculo.fotosEstructuradas = {};
        }
        this.nuevoVehiculo.fotosEstructuradas[llave] = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // ==========================================
  // MODALES Y VISTA PREVIA
  // ==========================================

  abrirFicha(v: Vehiculo): void {
    this.vehiculoSeleccionado = v;
    this.imagenesCargadas = {};
  }

  cerrarFicha(): void {
    this.vehiculoSeleccionado = null;
  }

  imprimirFicha(): void {
    const printContents = document.getElementById('ficha-print-section')?.innerHTML;
    if (printContents) {
      this.imprimirHtml(printContents, 'Ficha Técnica Vehicular');
    }
  }

  imprimirQR(): void {
    const printContents = document.getElementById('qr-print-section')?.innerHTML;
    if (printContents) {
      this.imprimirHtml(printContents, 'QR Vehicular');
    }
  }

  private imprimirHtml(htmlContent: string, title: string): void {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
    
    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`
        <html>
          <head>
            <title>${title}</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
              @media print {
                @page { size: A4 portrait; margin: 0; }
                body { 
                  padding: 1.5cm; /* Margen interno para que no pegue del borde */
                  background: white; 
                  color: black;
                  -webkit-print-color-adjust: exact; 
                  print-color-adjust: exact;
                }
                .table-bordered, .table-bordered td, .table-bordered th {
                  border: 2px solid #000 !important;
                }
              }
              body { font-family: system-ui, -apple-system, sans-serif; background: white; }
            </style>
          </head>
          <body onload="setTimeout(() => { window.print(); setTimeout(() => { window.parent.document.body.removeChild(window.frameElement); }, 100); }, 500);">
            ${htmlContent}
          </body>
        </html>
      `);
      doc.close();
    }
  }

  abrirCarrusel(v: Vehiculo): void {
    this.fotosCarrusel = v.fotos || [];
    this.indiceFotoActual = 0;
    this.imagenesCargadas = {};
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
    this.imagenesCargadas['carrusel'] = false;
  }

  anteriorFoto(): void {
    if (this.indiceFotoActual > 0) {
      this.indiceFotoActual--;
    } else {
      this.indiceFotoActual = this.fotosCarrusel.length - 1;
    }
    this.imagenesCargadas['carrusel'] = false;
  }

  seleccionarFoto(index: number): void {
    this.indiceFotoActual = index;
    this.imagenesCargadas['carrusel'] = false;
  }
}