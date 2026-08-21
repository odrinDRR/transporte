import { Component, Output, EventEmitter } from '@angular/core';
import { RolUsuario } from '../../core/models/fleet.models';
import { FlotaService } from '../../core/services/flota.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  @Output() loginCompletado = new EventEmitter<void>();
  
  // Variables para controlar la vista y el formulario
  rolSeleccionado: RolUsuario | null = null;
  usuario: string = '';
  clave: string = '';
  mostrarClave: boolean = false;

  constructor(private flotaService: FlotaService) {}

  toggleClave(): void {
    this.mostrarClave = !this.mostrarClave;
  }

  seleccionarRol(rol: RolUsuario): void {
    this.rolSeleccionado = rol;
    // Autocompletamos un usuario de prueba para agilizar la demo
    this.usuario = `${rol.toLowerCase()}@empresa.com`;
    this.clave = '123456';
  }

  volver(): void {
    this.rolSeleccionado = null;
    this.usuario = '';
    this.clave = '';
  }

  ingresar(): void {
    if (this.usuario.trim() !== '' && this.clave.trim() !== '' && this.rolSeleccionado) {
      this.flotaService.iniciarSesion(this.rolSeleccionado);
      this.loginCompletado.emit();
    } else {
      alert('Por favor, ingrese un usuario y clave válidos para la demostración.');
    }
  }
}