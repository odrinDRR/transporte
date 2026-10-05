import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../core/services/modal.service';

@Component({
  selector: 'app-configurar-seguridad',
  templateUrl: './configurar-seguridad.component.html',
  styleUrls: ['./configurar-seguridad.component.scss']
})
export class ConfigurarSeguridadComponent implements OnInit {

  @Output() configuracionCompletada = new EventEmitter<void>();

  necesitaPreguntas = false;
  necesitaClave = false;

  pasoActual = 1; // 1: Preguntas, 2: Clave
  
  // -- Datos Preguntas --
  preguntasFijas: any[] = [];
  pregunta1Id: number | null = null;
  respuesta1: string = '';
  
  pregunta2Id: number | null = null;
  respuesta2: string = '';
  
  preguntaPersonalizada: string = '';
  respuestaPersonalizada: string = '';

  guardandoPreguntas = false;

  // -- Datos Clave --
  claveActual: string = '';
  nuevaClave: string = '';
  confirmarNuevaClave: string = '';
  mostrarClaveActual = false;
  mostrarNuevaClave = false;
  mostrarConfirmarClave = false;
  guardandoClave = false;

  constructor(private authService: AuthService, private modalService: ModalService) { }

  ngOnInit(): void {
    const tienePreguntas = localStorage.getItem('smu_tiene_preguntas') === 'true';
    const debeCambiarClave = localStorage.getItem('smu_debe_cambiar_clave') === 'true';

    this.necesitaPreguntas = !tienePreguntas;
    this.necesitaClave = debeCambiarClave;

    if (this.necesitaPreguntas) {
      this.pasoActual = 1;
      this.cargarPreguntasFijas();
    } else if (this.necesitaClave) {
      this.pasoActual = 2;
    } else {
      this.finalizar();
    }
  }

  cargarPreguntasFijas() {
    this.authService.obtenerPreguntasFijas().subscribe({
      next: (res) => this.preguntasFijas = res,
      error: (err) => {
        console.error(err);
        this.modalService.showAlert('Error cargando preguntas de seguridad', 'Error', 'error');
      }
    });
  }

  get preguntasFiltradasParaCombo2() {
    return this.preguntasFijas.filter(p => p.id !== this.pregunta1Id);
  }

  get formularioPreguntasValido(): boolean {
    return !!this.pregunta1Id && this.respuesta1.trim().length > 0 &&
           !!this.pregunta2Id && this.respuesta2.trim().length > 0 &&
           this.preguntaPersonalizada.trim().length > 0 && this.respuestaPersonalizada.trim().length > 0;
  }

  guardarPreguntas() {
    if (!this.formularioPreguntasValido) return;

    this.guardandoPreguntas = true;
    const payload = [
      { preguntaId: this.pregunta1Id, respuesta: this.respuesta1 },
      { preguntaId: this.pregunta2Id, respuesta: this.respuesta2 },
      { preguntaPersonalizada: this.preguntaPersonalizada, respuesta: this.respuestaPersonalizada }
    ];

    this.authService.registrarPreguntas(payload).subscribe({
      next: () => {
        this.guardandoPreguntas = false;
        this.modalService.showAlert('Preguntas registradas exitosamente.', 'Éxito', 'success');
        
        // Actualizar estado local
        this.authService.actualizarEstadoSeguridad(true, this.necesitaClave);

        if (this.necesitaClave) {
          this.pasoActual = 2;
        } else {
          this.finalizar();
        }
      },
      error: (err) => {
        console.error(err);
        this.guardandoPreguntas = false;
        this.modalService.showAlert(err.error || 'Error guardando preguntas', 'Error', 'error');
      }
    });
  }

  // --- LOGICA DE CLAVES ---
  toggleVisibility(campo: string): void {
    if (campo === 'actual') this.mostrarClaveActual = !this.mostrarClaveActual;
    else if (campo === 'nueva') this.mostrarNuevaClave = !this.mostrarNuevaClave;
    else if (campo === 'confirmar') this.mostrarConfirmarClave = !this.mostrarConfirmarClave;
  }

  get tieneLongitudCorrecta(): boolean {
    return this.nuevaClave.length >= 8 && this.nuevaClave.length <= 14;
  }

  get tieneMayuscula(): boolean {
    return /[A-Z]/.test(this.nuevaClave);
  }

  get tieneNumero(): boolean {
    return /[0-9]/.test(this.nuevaClave);
  }

  get tieneEspecial(): boolean {
    return /[^a-zA-Z0-9]/.test(this.nuevaClave);
  }

  get claveValida(): boolean {
    return this.tieneLongitudCorrecta && this.tieneMayuscula && this.tieneNumero && this.tieneEspecial;
  }

  get formularioClaveValido(): boolean {
    return this.claveActual.trim().length > 0 &&
           this.claveValida &&
           this.nuevaClave === this.confirmarNuevaClave;
  }

  cambiarClave(): void {
    if (!this.formularioClaveValido) return;

    this.guardandoClave = true;
    const payload = {
      claveActual: this.claveActual,
      nuevaClave: this.nuevaClave
    };

    this.authService.cambiarClave(payload).subscribe({
      next: () => {
        this.guardandoClave = false;
        this.modalService.showAlert('Contraseña actualizada. Ya puedes acceder al sistema.', 'Éxito', 'success');
        this.authService.actualizarEstadoSeguridad(true, false);
        this.finalizar();
      },
      error: (err) => {
        console.error(err);
        this.guardandoClave = false;
        this.modalService.showAlert(err.error || 'Ocurrió un error al cambiar la contraseña', 'Error', 'error');
      }
    });
  }

  finalizar() {
    this.configuracionCompletada.emit();
  }
}
