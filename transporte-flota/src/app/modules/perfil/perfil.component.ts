import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UsuarioService } from '../../services/usuario.service';
import { ArchivoService } from '../../services/archivo.service';
import { SupabaseStorageService } from '../../services/supabase-storage.service';
import { ModalService } from '../../core/services/modal.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements OnInit {
  usuarioData: any = {};
  originalData: string = '';
  cargando: boolean = true;
  guardando: boolean = false;
  isEmpleadoOConductor: boolean = false;
  isConductor: boolean = false;

  archivoLicencia: File | null = null;
  archivoLicenciaNombre: string = '';
  archivoMedico: File | null = null;
  archivoMedicoNombre: string = '';

  // Cambiar Clave
  claveActual: string = '';
  nuevaClave: string = '';
  confirmarNuevaClave: string = '';
  mostrarClaveActual: boolean = false;
  mostrarNuevaClave: boolean = false;
  mostrarConfirmarClave: boolean = false;
  cambiandoClave: boolean = false;

  constructor(
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private archivoService: ArchivoService,
    private supabaseStorage: SupabaseStorageService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.cargarDatosUsuario();
  }

  cargarDatosUsuario(): void {
    const id = this.authService.getUsuarioId();
    if (id) {
      this.usuarioService.obtenerPorId(id).subscribe({
        next: (data) => {
          this.usuarioData = data;
          this.originalData = JSON.stringify(data);
          this.isEmpleadoOConductor = (data.cargo === 'EMPLEADO' || data.cargo === 'CONDUCTOR');
          this.isConductor = (data.cargo === 'CONDUCTOR');
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error cargando perfil:', err);
          this.cargando = false;
        }
      });
    } else {
      this.cargando = false;
      this.modalService.showAlert('Error de sesión: No se encontró el ID del usuario. Por favor, cierra sesión y vuelve a entrar.', 'Error', 'error');
    }
  }

  get haCambiado(): boolean {
    if (!this.usuarioData || !this.originalData) return false;
    // Si seleccionó algún archivo nuevo, consideramos que hay cambios
    if (this.archivoLicencia || this.archivoMedico) return true;
    
    // Comparar con el original para ver si modificó algún texto
    return JSON.stringify(this.usuarioData) !== this.originalData;
  }

  onFileSelected(event: Event, tipo: 'licencia' | 'medico'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (tipo === 'licencia') {
        this.archivoLicencia = file;
        this.archivoLicenciaNombre = file.name;
      } else {
        this.archivoMedico = file;
        this.archivoMedicoNombre = file.name;
      }
    }
  }

  async guardarCambios(): Promise<void> {
    this.guardando = true;
    const id = this.authService.getUsuarioId();
    if (!id) return;

    try {
      let urlLicencia = this.usuarioData.urlLicencia;
      let urlMedico = this.usuarioData.urlCertificadoMedico;

      if (this.archivoLicencia) {
        const urlLicenciaSupabase = await this.supabaseStorage.uploadFile(
          this.archivoLicencia,
          'flota_archivos',
          'usuarios/documentos'
        );
        urlLicencia = urlLicenciaSupabase;
      }

      if (this.archivoMedico) {
        const urlMedicoSupabase = await this.supabaseStorage.uploadFile(
          this.archivoMedico,
          'flota_archivos',
          'usuarios/documentos'
        );
        urlMedico = urlMedicoSupabase;
      }

      const payload = {
        ...this.usuarioData,
        urlLicencia,
        urlCertificadoMedico: urlMedico
      };

      this.usuarioService.actualizarUsuario(id, payload).subscribe({
        next: (res) => {
          this.guardando = false;
          this.modalService.showAlert('¡Perfil actualizado con éxito!', 'Éxito', 'success');
          this.usuarioData = res;
          this.originalData = JSON.stringify(res);
          // Limpiamos los archivos subidos de la cola
          this.archivoLicencia = null;
          this.archivoLicenciaNombre = '';
          this.archivoMedico = null;
          this.archivoMedicoNombre = '';
        },
        error: (err) => {
          console.error(err);
          this.guardando = false;
          this.modalService.showAlert('Hubo un error al guardar el perfil.', 'Error', 'error');
        }
      });
    } catch (error) {
      console.error(error);
      this.guardando = false;
      this.modalService.showAlert('Error subiendo los nuevos documentos.', 'Error', 'error');
    }
  }

  // Pestañas
  activeTab: 'DATOS_PERSONALES' | 'SEGURIDAD' = 'DATOS_PERSONALES';

  // --- LÓGICA DE CAMBIO DE CLAVE ---

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

    this.cambiandoClave = true;
    const payload = {
      claveActual: this.claveActual,
      nuevaClave: this.nuevaClave
    };

    this.authService.cambiarClave(payload).subscribe({
      next: (res) => {
        this.cambiandoClave = false;
        this.modalService.showAlert('Contraseña cambiada exitosamente.', 'Éxito', 'success');
        this.claveActual = '';
        this.nuevaClave = '';
        this.confirmarNuevaClave = '';
      },
      error: (err) => {
        console.error(err);
        this.cambiandoClave = false;
        const msg = err.error || 'Ocurrió un error al cambiar la contraseña';
        this.modalService.showAlert(msg, 'Error', 'error');
      }
    });
  }
}
