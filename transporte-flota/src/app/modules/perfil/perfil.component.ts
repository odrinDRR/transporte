import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UsuarioService } from '../../services/usuario.service';
import { ArchivoService } from '../../services/archivo.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements OnInit {
  usuarioData: any = {};
  cargando: boolean = true;
  guardando: boolean = false;
  isEmpleadoOConductor: boolean = false;

  archivoLicencia: File | null = null;
  archivoLicenciaNombre: string = '';
  archivoMedico: File | null = null;
  archivoMedicoNombre: string = '';

  constructor(
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private archivoService: ArchivoService
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
          this.isEmpleadoOConductor = (data.cargo === 'EMPLEADO' || data.cargo === 'CONDUCTOR');
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error cargando perfil:', err);
          this.cargando = false;
        }
      });
    } else {
      this.cargando = false;
    }
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
        const resLicencia = await this.archivoService.subirArchivo(this.archivoLicencia).toPromise();
        urlLicencia = resLicencia?.url;
      }

      if (this.archivoMedico) {
        const resMedico = await this.archivoService.subirArchivo(this.archivoMedico).toPromise();
        urlMedico = resMedico?.url;
      }

      const payload = {
        ...this.usuarioData,
        urlLicencia,
        urlCertificadoMedico: urlMedico
      };

      this.usuarioService.actualizarUsuario(id, payload).subscribe({
        next: (res) => {
          this.guardando = false;
          alert('¡Perfil actualizado con éxito!');
          this.usuarioData = res;
          // Limpiamos los archivos subidos de la cola
          this.archivoLicencia = null;
          this.archivoLicenciaNombre = '';
          this.archivoMedico = null;
          this.archivoMedicoNombre = '';
        },
        error: (err) => {
          console.error(err);
          this.guardando = false;
          alert('Hubo un error al guardar el perfil.');
        }
      });
    } catch (error) {
      console.error(error);
      this.guardando = false;
      alert('Error subiendo los nuevos documentos.');
    }
  }
}
