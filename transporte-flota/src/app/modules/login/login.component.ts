import { Component, Output, EventEmitter } from '@angular/core';
import { RolUsuario } from '../../core/models/fleet.models';
import { FlotaService } from '../../core/services/flota.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  @Output() loginCompletado = new EventEmitter<void>();
  
  // Variables del Login
  rolSeleccionado: RolUsuario | null = null;
  usuario: string = '';
  clave: string = '';

  // Variables del Registro 
  mostrarRegistro: boolean = false;
  pasoRegistro: number = 1; 
  
  nuevoUsuario = {
    nombre: '',
    apellido: '',
    cedula: '',
    edad: null,
    cargo: '',
    // Campos Conductor
    licencia: '',
    categoriaLicencia: '',
    vencimientoLicencia: '',
    vencimientoMedico: '',
    // Credenciales (Paso Final)
    correo: '',
    password: '',
    estado: 'PENDIENTE' // Clave para la lógica de aprobación
  };

  constructor(private flotaService: FlotaService) {}

  // --- MÉTODOS DE LOGIN ---
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

  ingresar(): void {
    if (this.usuario.trim() !== '' && this.clave.trim() !== '' && this.rolSeleccionado) {
      this.flotaService.iniciarSesion(this.rolSeleccionado);
      this.loginCompletado.emit();
    } else {
      alert('Por favor, ingrese credenciales válidas.');
    }
  }

  // --- MÉTODOS DE REGISTRO PASO A PASO ---
  alternarRegistro(): void {
    this.mostrarRegistro = !this.mostrarRegistro;
    this.pasoRegistro = 1;
    this.volverRoles();
    
    // Limpia los datos si se cancela el registro
    if (!this.mostrarRegistro) {
      this.nuevoUsuario = {
        nombre: '',
        apellido: '',
        cedula: '',
        edad: null,
        cargo: '',
        licencia: '',
        categoriaLicencia: '',
        vencimientoLicencia: '',
        vencimientoMedico: '',
        correo: '',
        password: '',
        estado: 'PENDIENTE'
      };
    }
  }

 // --- MÉTODOS DE REGISTRO PASO A PASO ---
  
  avanzarRegistro(): void {
    if (this.pasoRegistro === 1) {
      if (!this.nuevoUsuario.nombre || !this.nuevoUsuario.cedula || !this.nuevoUsuario.cargo) {
        alert('Por favor, completa tus datos básicos e indica tu cargo.');
        return;
      }
      
      // Validamos si el cargo requiere documentos de manejo
      const requiereDocumentos = this.nuevoUsuario.cargo === 'EMPLEADO';
      
      // Si los requiere, va al Paso 2. Si es Admin o Coordinador, salta directo al Paso 3.
      this.pasoRegistro = requiereDocumentos ? 2 : 3;
      
    } else if (this.pasoRegistro === 2) {
      this.pasoRegistro = 3;
    }
  }

  retrocederRegistro(): void {
    const requiereDocumentos = this.nuevoUsuario.cargo === 'EMPLEADO';
    
    // Si estamos en el paso final y el rol NO requiere documentos, al retroceder debe saltar al paso 1
    if (this.pasoRegistro === 3 && !requiereDocumentos) {
      this.pasoRegistro = 1; 
    } else {
      this.pasoRegistro--;
    }
  }

  enviarParaAprobacion(): void {
    if (!this.nuevoUsuario.correo || !this.nuevoUsuario.password) {
      alert('Debes crear un usuario y contraseña para acceder al sistema.');
      return;
    }
    
    if (this.nuevoUsuario.correo.length < 5 || this.nuevoUsuario.correo.length > 15) {
      alert('❌ El nombre de usuario o correo debe tener entre 5 y 15 caracteres.');
      return;
    }
    
    // --- NUEVO: VALIDACIÓN ESTRICTA DE CONTRASEÑA ---
    // Expresión regular: 
    // (?=.*[A-Z]) -> Al menos una mayúscula
    // (?=.*\d)    -> Al menos un número
    // (?=.*[^a-zA-Z0-9]) -> Al menos un carácter especial
    // .{8,14}     -> Entre 8 y 14 caracteres de longitud
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,14}$/;
    
    if (!passwordRegex.test(this.nuevoUsuario.password)) {
      alert('❌ La contraseña no es válida. Asegúrate de cumplir con los requisitos mínimos de seguridad indicados en la pantalla.');
      return;
    }
    // ------------------------------------------------

    // Simulación de envío al backend
    console.log('Usuario enviado para aprobación:', this.nuevoUsuario);
    
    alert(`¡Listo ${this.nuevoUsuario.nombre}! Tu solicitud fue enviada.\n\nRecuerda que un Coordinador o Supervisor debe aprobar tu perfil antes de que puedas iniciar sesión.`);
    
    // Reset y vuelta al inicio
    this.alternarRegistro();
  }

  // --- VALIDACIONES DE CONTRASEÑA EN TIEMPO REAL ---
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