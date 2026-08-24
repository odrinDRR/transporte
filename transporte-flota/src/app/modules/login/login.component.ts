import { Component, Output, EventEmitter } from '@angular/core';
import { RolUsuario } from '../../core/models/fleet.models';
import { FlotaService } from '../../core/services/flota.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  @Output() loginCompletado = new EventEmitter<void>();

  roles: RolUsuario[] = ['ADMIN', 'COORDINADOR', 'SUPERVISOR', 'EMPLEADO'];

  rolSeleccionado: RolUsuario | null = null;
  usuario: string = '';
  clave: string = '';
  mostrarPassword: boolean = false;

  mostrarRegistro: boolean = false;
  pasoRegistro: number = 1;

  archivoLicencia: File | null = null;
  archivoLicenciaNombre: string = '';
  archivoMedico: File | null = null;
  archivoMedicoNombre: string = '';

  nuevoUsuario = {
    nombre: '',
    apellido: '',
    cedula: '',
    edad: null as number | null,
    cargo: '' as RolUsuario | '',
    categoriaLicencia: '2da',
    correo: '',
    password: '',
    estado: 'PENDIENTE'
  };

  constructor(private flotaService: FlotaService) {}

  getRoleName(rol: RolUsuario | string | null): string {
    switch (rol) {
      case 'ADMIN': return 'Gerencia Exec';
      case 'COORDINADOR': return 'Coordinador';
      case 'SUPERVISOR': return 'Supervisor Patio';
      case 'EMPLEADO': return 'Conductor / Flota';
      default: return '';
    }
  }

  getRoleDescription(rol: RolUsuario | string): string {
    switch (rol) {
      case 'ADMIN': return 'Control Total';
      case 'COORDINADOR': return 'Logística';
      case 'SUPERVISOR': return 'Auditoría';
      case 'EMPLEADO': return 'Operativo';
      default: return '';
    }
  }

  getRoleIcon(rol: RolUsuario | string): string {
    switch (rol) {
      case 'ADMIN': return 'bi-shield-lock-fill';
      case 'COORDINADOR': return 'bi-diagram-3-fill';
      case 'SUPERVISOR': return 'bi-speedometer2';
      case 'EMPLEADO': return 'bi-truck-front-fill';
      default: return 'bi-person-badge';
    }
  }

  getRoleButtonClass(rol: RolUsuario): string {
    return this.rolSeleccionado === rol ? 'active-role' : '';
  }

  seleccionarRol(rol: RolUsuario): void {
    this.rolSeleccionado = rol;
    this.usuario = `${rol.toLowerCase()}@empresa.com`;
    this.clave = '123456';
  }

  volverRoles(): void {
    this.rolSeleccionado = null;
    this.usuario = '';
    this.clave = '';
  }

  togglePasswordVisibility(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  // Sanitizar entrada de Cédula (Solo números)
 validarCedulaInput(event: Event): void {
  const input = event.target as HTMLInputElement;
  let valor = input.value.replace(/\D/g, '');
  if (valor.length > 8) {
    valor = valor.substring(0, 8);
  }
  input.value = valor;
  this.nuevoUsuario.cedula = valor;
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

  ingresar(): void {
    if (this.usuario.trim() !== '' && this.clave.trim() !== '' && this.rolSeleccionado) {
      this.flotaService.iniciarSesion(this.rolSeleccionado);
      this.loginCompletado.emit();
    } else {
      alert('Por favor, selecciona un perfil e ingresa tus credenciales.');
    }
  }

  alternarRegistro(): void {
    this.mostrarRegistro = !this.mostrarRegistro;
    this.pasoRegistro = 1;
    this.volverRoles();

    if (!this.mostrarRegistro) {
      this.archivoLicencia = null;
      this.archivoLicenciaNombre = '';
      this.archivoMedico = null;
      this.archivoMedicoNombre = '';
      this.nuevoUsuario = {
        nombre: '',
        apellido: '',
        cedula: '',
        edad: null,
        cargo: '',
        categoriaLicencia: '2da',
        correo: '',
        password: '',
        estado: 'PENDIENTE'
      };
    }
  }

 avanzarRegistro(): void {
  if (this.pasoRegistro === 1) {
    if (!this.nuevoUsuario.nombre || !this.nuevoUsuario.apellido || !this.nuevoUsuario.cedula || !this.nuevoUsuario.cargo) {
      alert('Por favor completa todos los datos obligatorios.');
      return;
    }

    if (this.nuevoUsuario.cedula.length > 8) {
      alert('La cédula no puede exceder los 8 dígitos.');
      return;
    }

    if (this.nuevoUsuario.edad === null || this.nuevoUsuario.edad < 18 || this.nuevoUsuario.edad > 80) {
      alert('La edad permitida debe estar comprendida entre 18 y 80 años.');
      return;
    }

    const requiereDocumentos = this.nuevoUsuario.cargo === 'EMPLEADO';
    this.pasoRegistro = requiereDocumentos ? 2 : 3;
  } else if (this.pasoRegistro === 2) {
    if (!this.archivoLicencia || !this.archivoMedico) {
      alert('Debes adjuntar el documento de tu Licencia y tu Certificado Médico para continuar.');
      return;
    }
    this.pasoRegistro = 3;
  }
}

  retrocederRegistro(): void {
    const requiereDocumentos = this.nuevoUsuario.cargo === 'EMPLEADO';
    if (this.pasoRegistro === 3 && !requiereDocumentos) {
      this.pasoRegistro = 1;
    } else {
      this.pasoRegistro--;
    }
  }

  enviarParaAprobacion(): void {
    if (!this.nuevoUsuario.correo || !this.nuevoUsuario.password) {
      alert('Indica un usuario y contraseña válidos.');
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,14}$/;
    if (!passwordRegex.test(this.nuevoUsuario.password)) {
      alert('La contraseña debe cumplir las reglas de seguridad requeridas.');
      return;
    }

    alert(`Solicitud registrada para ${this.nuevoUsuario.nombre}. La documentación en PDF/Foto fue enviada a revisión.`);
    this.alternarRegistro();
  }

  get tieneLongitudCorrecta(): boolean {
    const pw = this.nuevoUsuario.password || '';
    return pw.length >= 8 && pw.length <= 14;
  }

  get tieneMayuscula(): boolean {
    return /[A-Z]/.test(this.nuevoUsuario.password || '');
  }

  get tieneNumero(): boolean {
    return /\d/.test(this.nuevoUsuario.password || '');
  }

  get tieneEspecial(): boolean {
    return /[^a-zA-Z0-9]/.test(this.nuevoUsuario.password || '');
  }
}