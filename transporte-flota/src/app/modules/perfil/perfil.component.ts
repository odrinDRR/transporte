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
}
