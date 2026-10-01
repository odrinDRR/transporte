import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { UsuarioService } from '../../services/usuario.service';
import { environment } from '../../../environments/environment';
import { ModalService } from '../../core/services/modal.service';

@Component({
  selector: 'app-aprobaciones',
  templateUrl: './aprobaciones.component.html'
})
export class AprobacionesComponent implements OnInit {
  solicitudesPendientes: any[] = [];
  solicitudesVisibles: any[] = [];
  solicitudDetalle: any = null;
  rolActual: string | null = null;

  currentPage: number = 0;
  totalPages: number = 1;
  pageSize: number = 10;
  totalElements: number = 0;

  constructor(private usuarioService: UsuarioService, public authService: AuthService, private modalService: ModalService) { }

  ngOnInit(): void {
    this.authService.usuarioActual$.subscribe(user => {
      this.rolActual = user?.rol || null;
      this.cargarUsuarios();
    });
  }

  verDetalles(solicitud: any): void {
    this.solicitudDetalle = solicitud;
  }

  cerrarDetalles(): void {
    this.solicitudDetalle = null;
  }

  cargando = false;

  cargarUsuarios(): void {
    this.cargando = true;
    
    const cargoFiltro = this.rolActual === 'EMPLEADO' ? 'CONDUCTOR' : undefined;

    this.usuarioService.obtenerPendientes(cargoFiltro, this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        this.totalPages = res.totalPages;
        this.totalElements = res.totalElements;
        const usuarios = res.content || res;
        // Ya vienen filtrados por estado PENDIENTE desde el backend
        this.solicitudesPendientes = usuarios;
        this.filtrarPorNivelDeAcceso();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando aprobaciones', err);
        this.cargando = false;
      }
    });
  }

  filtrarPorNivelDeAcceso(): void {
    if (this.rolActual === 'ADMIN' || this.rolActual === 'COORDINADOR') {
      this.solicitudesVisibles = [...this.solicitudesPendientes];
    } else if (this.rolActual === 'SUPERVISOR') {
      this.solicitudesVisibles = this.solicitudesPendientes.filter(s => s.cargo === 'EMPLEADO' || s.cargo === 'CONDUCTOR');
    } else if (this.rolActual === 'EMPLEADO') {
      this.solicitudesVisibles = this.solicitudesPendientes.filter(s => s.cargo === 'CONDUCTOR');
    } else {
      this.solicitudesVisibles = [];
    }
  }

  async aprobar(id: number, nombre: string): Promise<void> {
    const isConfirmed = await this.modalService.showConfirm(`¿Estás seguro de APROBAR el acceso para ${nombre}?`, 'Confirmar Aprobación', 'info');
    if (isConfirmed) {
      this.usuarioService.aprobarUsuario(id).subscribe({
        next: () => {
          if (this.solicitudDetalle?.id === id) this.cerrarDetalles();
          this.cargarUsuarios();
          this.modalService.showAlert('Usuario aprobado. Ya puede iniciar sesión.', 'Éxito', 'success');
        },
        error: (err) => console.error('Error al aprobar', err)
      });
    }
  }

  async rechazar(id: number): Promise<void> {
    const isConfirmed = await this.modalService.showConfirm('¿Deseas RECHAZAR y eliminar esta solicitud?', 'Confirmar Rechazo', 'warning');
    if (isConfirmed) {
      this.usuarioService.rechazarUsuario(id).subscribe({
        next: () => {
          if (this.solicitudDetalle?.id === id) this.cerrarDetalles();
          this.cargarUsuarios();
        },
        error: (err) => console.error('Error al rechazar', err)
      });
    }
  }

  cambiarPagina(incremento: number): void {
    const nuevaPagina = this.currentPage + incremento;
    if (nuevaPagina >= 0 && nuevaPagina < this.totalPages) {
      this.currentPage = nuevaPagina;
      this.cargarUsuarios();
    }
  }
}