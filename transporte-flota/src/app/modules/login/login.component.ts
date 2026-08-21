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

  // Variables del Registro (Estilo Duolingo)
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
  }

  avanzarRegistro(): void {
    if (this.pasoRegistro === 1) {
      if (!this.nuevoUsuario.nombre || !this.nuevoUsuario.cedula || !this.nuevoUsuario.cargo) {
        alert('Por favor, completa tus datos básicos e indica tu cargo.');
        return;
      }
      // Si es conductor, va al paso 2 (Documentos). Si no, salta al paso 3 (Credenciales)
      this.pasoRegistro = this.nuevoUsuario.cargo === 'CONDUCTOR' ? 2 : 3;
    } else if (this.pasoRegistro === 2) {
      this.pasoRegistro = 3;
    }
  }

  retrocederRegistro(): void {
    if (this.pasoRegistro === 3 && this.nuevoUsuario.cargo !== 'CONDUCTOR') {
      this.pasoRegistro = 1; // Salta de vuelta al paso 1
    } else {
      this.pasoRegistro--;
    }
  }

  enviarParaAprobacion(): void {
    if (!this.nuevoUsuario.correo || !this.nuevoUsuario.password) {
      alert('Debes crear un usuario y contraseña para acceder al sistema.');
      return;
    }
    
    // Aquí el backend guardaría el usuario con estado 'PENDIENTE'
    console.log('Usuario enviado para aprobación:', this.nuevoUsuario);
    
    alert(`¡Listo ${this.nuevoUsuario.nombre}! Tu solicitud fue enviada.\n\nRecuerda que un Coordinador o Supervisor debe aprobar tu perfil antes de que puedas iniciar sesión.`);
    
    // Reset y vuelta al inicio
    this.alternarRegistro();
  }
}