import { Component, ElementRef, ViewChild, AfterViewInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { VehiculoService } from '../../services/vehiculo.service';

export interface InspeccionLivianoDanoDTO {
  codigoDano: number;
  nombreDano: string;
  coordX: number;
  coordY: number;
}

@Component({
  selector: 'app-inspeccion',
  templateUrl: './inspeccion.component.html',
  styleUrls: ['./inspeccion.component.scss']
})
export class InspeccionComponent implements AfterViewInit, OnChanges {
  // ---- ENTRADAS PARA MODO AUDITORIA ----
  @Input() isAuditoria: boolean = false;
  @Input() inspeccionOrigenId?: number;
  @Input() vehiculoAuditoria: any = null;
  @Input() conductorAuditoria: any = null;
  @Output() onFinalizado = new EventEmitter<any>();

  // Control de las grandes fases de la vista
  fasePrincipal: 'INGRESO_CEDULA' | 'SELECCION_TIPO' | 'FORMULARIO' = 'INGRESO_CEDULA';
  
  // Datos del conductor
  cedulaInput: string = '';
  nombreConductorActual: string = '';
  tipoInspeccionActual: 'INICIO' | 'CIERRE' = 'INICIO';
  tieneInspeccionAbierta: boolean = false;
  verificando = false;
  guardando = false;

  // Stepper del formulario
  etapaActual: number = 1;

  conductorActual: any = null;
  vehiculoActual: any = null;

  // Daños Canvas
  danos: InspeccionLivianoDanoDTO[] = [];
  codigoDanoSeleccionado = 1;
  tipoDanoSeleccionado = 'GOLPE';

  // Firmas Canvas
  @ViewChild('sig1') sig1!: ElementRef<HTMLCanvasElement>;
  @ViewChild('sig2') sig2!: ElementRef<HTMLCanvasElement>;
  @ViewChild('sig3') sig3!: ElementRef<HTMLCanvasElement>;

  drawing1 = false; drawing2 = false; drawing3 = false;
  ctx1!: CanvasRenderingContext2D;
  ctx2!: CanvasRenderingContext2D;
  ctx3!: CanvasRenderingContext2D;

  dto: any = {
    // Paso 1
    motivo: 'RUTINARIO',
    gerenciaSolicitante: '',
    unidadUsuaria: '',
    centroCosto: '',
    kilometrajeEntregado: null,
    kilometrajeRecibido: null,
    transmision: 'AUTOMATICO',

    // Paso 2
    nivelCombustible: 'ALTO',
    nivelAceiteMotor: 'ALTO',
    nivelLigaFrenos: 'ALTO',
    nivelAceiteCaja: 'ALTO',
    nivelRefrigerante: 'ALTO',
    tipoCobertura: '',
    docCarnet: true,
    docAutorizacion: true,
    docAsignacion: true,
    docLicencia: true,
    docCertificadoMedico: true,

    // Paso 3
    observacionesDanos: '',

    // Paso 4: Seguridad
    segAlarma: true,
    segBoveda: true,
    segExtintor: true,
    segTrancaPalanca: true,

    // Paso 4: Accesorios
    accCables: true,
    accCauchoRepuesto: true,
    accCornetas: true,
    accGato: true,
    accHerramientas: true,
    accLlaveCruz: true,
    accPalancaGato: true,
    accRadio: true,
    accRines: true,
    accTasa: true,
    accTriangulo: true,

    // Paso 4: Estado General
    revAire: 'B',
    revAntena: 'B',
    revCauchos: 'B',
    revFaros: 'B',
    revFrenos: 'B',
    revVidrios: 'B',
    revTapiceria: 'B',
    revTablero: 'B',

    // Paso 4: Especificaciones
    batMarca: '', batModelo: '', batCodigo: '', batVida: '',
    cauMarca: '', cauModelo: '', cauCodigo: '', cauVida: '',

    // Paso 5: Firmas
    inspectorNombre: '', inspectorCargo: '', inspectorPersonal: '',
    entregaNombre: '', entregaCargo: '', entregaPersonal: '',
    recibeNombre: '', recibeCargo: '', recibePersonal: '',
    
    // Core relations
    vehiculoId: null,
    usuarioId: null
  };

  constructor(
    private http: HttpClient,
    private vehiculoService: VehiculoService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.isAuditoria && this.vehiculoAuditoria && this.conductorAuditoria) {
      this.vehiculoActual = this.vehiculoAuditoria;
      this.conductorActual = this.conductorAuditoria;
      this.nombreConductorActual = this.conductorActual.nombre;
      
      this.dto.vehiculoId = Number(this.vehiculoActual.id);
      this.dto.usuarioId = this.conductorActual.id;
      this.dto.inspectorNombre = 'AUDITOR';
      
      this.tipoInspeccionActual = 'CIERRE';
      this.dto.tipoInspeccion = 'CIERRE';
      this.dto.inspeccionOrigenId = this.inspeccionOrigenId;
      this.dto.motivo = 'AUDITORIA';
      
      this.fasePrincipal = 'FORMULARIO';
      this.etapaActual = 1;
    }
  }

  ngAfterViewInit() {}

  // --- PASO 1: VALIDAR CÉDULA O FICHA ---
  verificarCedula(): void {
    if(!this.cedulaInput) return;
    this.verificando = true;
    
    this.http.get<any[]>(`${environment.apiUrl}/usuarios`).subscribe({
      next: (usuarios) => {
        const term = this.cedulaInput.trim().toLowerCase();
        const usuarioActual = usuarios.find(u => 
          u.cargo === 'CONDUCTOR' && 
          u.estado !== 'PENDIENTE' &&
          (
            (u.cedula && u.cedula.toLowerCase() === term) ||
            (u.ficha && u.ficha.toLowerCase() === term) ||
            (u.licencia && u.licencia.toLowerCase() === term)
          )
        );

        if (usuarioActual) {
          this.vehiculoService.obtenerVehiculos().subscribe({
            next: (vehs) => {
              this.vehiculoActual = vehs.find(v => v.conductorId === usuarioActual.id) || null;
              
              if (this.vehiculoActual) {
                this.nombreConductorActual = usuarioActual.nombre;
                this.conductorActual = {
                  id: usuarioActual.id,
                  nombre: usuarioActual.nombre + ' ' + usuarioActual.apellido,
                  cedula: usuarioActual.cedula,
                  fichaNumerica: usuarioActual.ficha || usuarioActual.licencia || 'Sin ficha',
                  vehiculoAsignadoId: this.vehiculoActual.id
                };

                this.dto.vehiculoId = Number(this.vehiculoActual.id);
                this.dto.usuarioId = usuarioActual.id;
                this.dto.inspectorNombre = this.conductorActual?.nombre;
                this.dto.entregaNombre = this.conductorActual?.nombre;
                
                // Jump straight to the form
                this.tipoInspeccionActual = 'INICIO';
                this.dto.motivo = 'RUTINARIO';
                this.fasePrincipal = 'FORMULARIO';
                this.etapaActual = 1;
              } else {
                alert('El conductor fue encontrado pero no tiene un vehículo asignado.');
              }
              this.verificando = false;
            },
            error: () => { alert('Error al verificar los vehículos.'); this.verificando = false; }
          });
        } else {
          alert('Conductor no encontrado. Verifica la cédula o ficha ingresada.');
          this.verificando = false;
        }
      },
      error: () => { alert('Error al verificar el conductor en el servidor.'); this.verificando = false; }
    });
  }

  // --- PASO 2: ELEGIR TIPO DE RUTA ---
  seleccionarRuta(tipo: 'INICIO' | 'CIERRE'): void {
    this.tipoInspeccionActual = tipo;
    this.dto.motivo = tipo === 'INICIO' ? 'RUTINARIO' : 'RUTINARIO'; // Opcional
    this.fasePrincipal = 'FORMULARIO';
    this.etapaActual = 1;
  }

  avanzar(): void { 
    if (this.etapaActual < 5) this.etapaActual++; 
    if (this.etapaActual === 5) setTimeout(() => this.initCanvasFirmas(), 300);
  }
  
  retroceder(): void { 
    if (this.etapaActual > 1) this.etapaActual--; 
  }

  seleccionarDano(codigo: number, nombre: string) {
    this.codigoDanoSeleccionado = codigo;
    this.tipoDanoSeleccionado = nombre;
  }

  agregarDano(event: MouseEvent) {
    const container = event.currentTarget as HTMLElement;
    const rect = container.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    
    this.danos.push({
      codigoDano: this.codigoDanoSeleccionado,
      nombreDano: this.tipoDanoSeleccionado,
      coordX: x,
      coordY: y
    });
  }

  quitarDano(index: number) {
    this.danos.splice(index, 1);
  }

  // --- FIRMAS ---
  initCanvasFirmas() {
    if(this.sig1) this.ctx1 = this.setupCanvas(this.sig1.nativeElement, 1);
    if(this.sig2) this.ctx2 = this.setupCanvas(this.sig2.nativeElement, 2);
    if(this.sig3) this.ctx3 = this.setupCanvas(this.sig3.nativeElement, 3);
  }

  setupCanvas(canvas: HTMLCanvasElement, num: number): CanvasRenderingContext2D {
    const ctx = canvas.getContext('2d')!;
    if(canvas.parentElement) {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = 150; // Fixed height for signatures
    }

    const startDraw = (x: number, y: number) => {
      if(num===1) this.drawing1 = true;
      if(num===2) this.drawing2 = true;
      if(num===3) this.drawing3 = true;
      ctx.beginPath(); ctx.moveTo(x, y);
    };

    const draw = (x: number, y: number) => {
      const isDrawing = num===1 ? this.drawing1 : num===2 ? this.drawing2 : this.drawing3;
      if(isDrawing) {
        ctx.lineTo(x, y);
        ctx.strokeStyle = '#fff'; // White ink for dark mode
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    };

    const stopDraw = () => {
      if(num===1) this.drawing1 = false;
      if(num===2) this.drawing2 = false;
      if(num===3) this.drawing3 = false;
    };

    canvas.onmousedown = (e) => startDraw(e.offsetX, e.offsetY);
    canvas.onmousemove = (e) => draw(e.offsetX, e.offsetY);
    canvas.onmouseup = stopDraw;
    canvas.onmouseleave = stopDraw;

    canvas.ontouchstart = (e) => { e.preventDefault(); const rect = canvas.getBoundingClientRect(); startDraw(e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top); };
    canvas.ontouchmove = (e) => { e.preventDefault(); const rect = canvas.getBoundingClientRect(); draw(e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top); };
    canvas.ontouchend = stopDraw;

    return ctx;
  }

  clearSignature(num: number) {
    if(num===1 && this.ctx1 && this.sig1) this.ctx1.clearRect(0, 0, this.sig1.nativeElement.width, this.sig1.nativeElement.height);
    if(num===2 && this.ctx2 && this.sig2) this.ctx2.clearRect(0, 0, this.sig2.nativeElement.width, this.sig2.nativeElement.height);
    if(num===3 && this.ctx3 && this.sig3) this.ctx3.clearRect(0, 0, this.sig3.nativeElement.width, this.sig3.nativeElement.height);
  }

  finalizarInspeccion() {
    this.guardando = true;
    this.dto.danos = this.danos;
    if(this.sig1) this.dto.inspectorFirmaBase64 = this.sig1.nativeElement.toDataURL();
    if(this.sig2) this.dto.entregaFirmaBase64 = this.sig2.nativeElement.toDataURL();
    if(this.sig3) this.dto.recibeFirmaBase64 = this.sig3.nativeElement.toDataURL();

    this.http.post(`${environment.apiUrl}/inspecciones-livianos`, this.dto).subscribe({
      next: (response) => {
        alert(`¡Inspección de ${this.tipoInspeccionActual} completada con éxito!`);
        this.guardando = false;
        
        if (this.isAuditoria) {
           this.onFinalizado.emit(response);
        } else {
           // Volver a inicio para flujo normal
           this.fasePrincipal = 'INGRESO_CEDULA';
           this.etapaActual = 1;
           this.cedulaInput = '';
           this.danos = [];
        }
      },
      error: (err) => {
        console.error(err);
        alert('Error al guardar la inspección');
        this.guardando = false;
      }
    });
  }

  get isMoto(): boolean {
    const t = this.vehiculoActual?.tipoVehiculo?.toUpperCase() || this.vehiculoActual?.tipo?.toUpperCase() || '';
    return t.includes('MOTO');
  }
}