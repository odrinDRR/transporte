import { Component, OnInit } from '@angular/core';
import { UsuarioService } from '../../services/usuario.service';
import { environment } from '../../../environments/environment';
import { ModalService } from '../../core/services/modal.service';

@Component({
  selector: 'app-empleados',
  templateUrl: './empleados.component.html'
})
export class EmpleadosComponent implements OnInit {
  empleados: any[] = [];
  cargando = false;
  procesandoId: number | null = null;
  filtroTexto = '';
  filtroRol: 'TODOS' | 'EMPLEADOS' | 'COORDINADORES' = 'TODOS';
  empleadoDetalle: any = null;

  currentPage: number = 0;
  totalPages: number = 1;
  pageSize: number = 10;
  totalElements: number = 0;

  constructor(private usuarioService: UsuarioService, private modalService: ModalService) {}

  ngOnInit(): void {
    this.cargarEmpleados();
  }

  cargarEmpleados(): void {
    this.cargando = true;
    this.usuarioService.obtenerUsuarios(this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        this.totalPages = res.totalPages;
        this.totalElements = res.totalElements;
        const usuarios = res.content || res; // Ya viene con .content si se paginó
        // Mostrar SOLO EMPLEADO y COORDINADOR que no estén pendientes
        this.empleados = usuarios
          .filter((u: any) => u.estado !== 'PENDIENTE' && (u.cargo === 'EMPLEADO' || u.cargo === 'COORDINADOR'))
          .sort((a: any, b: any) => (a.estado === 'ACTIVO' ? -1 : 1));
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando empleados', err);
        this.cargando = false;
      }
    });
  }

  get empleadosFiltrados(): any[] {
    let filtrados = this.empleados;

    if (this.filtroRol === 'EMPLEADOS') {
      filtrados = filtrados.filter(e => e.cargo === 'EMPLEADO');
    } else if (this.filtroRol === 'COORDINADORES') {
      filtrados = filtrados.filter(e => e.cargo === 'COORDINADOR');
    }

    if (this.filtroTexto) {
      const term = this.filtroTexto.toLowerCase();
      filtrados = filtrados.filter(e => 
        (e.nombre || '').toLowerCase().includes(term) ||
        (e.cedula || '').toLowerCase().includes(term)
      );
    }
    return filtrados;
  }

  verDetalles(empleado: any): void {
    this.empleadoDetalle = empleado;
  }

  cerrarDetalles(): void {
    this.empleadoDetalle = null;
  }

  async desactivarUsuario(id: number, nombre: string): Promise<void> {
    const confirmado = await this.modalService.showConfirm(
      `¿Estás seguro de que deseas desactivar a ${nombre}? Esta acción inhabilitará su acceso al sistema y lo desvinculará de cualquier unidad asignada.`
    );
    
    if (confirmado) {
      this.procesandoId = id;
      this.usuarioService.rechazarUsuario(id).subscribe({
        next: () => {
          this.modalService.showAlert(`Usuario ${nombre} desactivado correctamente.`, 'Éxito', 'success');
          this.cargarEmpleados();
          this.procesandoId = null;
        },
        error: (err) => {
          console.error(err);
          this.modalService.showAlert('Ocurrió un error al intentar desactivar el usuario.', 'Error', 'error');
          this.procesandoId = null;
        }
      });
    }
  }

  async activarUsuario(id: number, nombre: string): Promise<void> {
    const confirmado = await this.modalService.showConfirm(
      `¿Estás seguro de que deseas activar a ${nombre}? Esta acción rehabilitará su acceso al sistema.`
    );

    if (confirmado) {
      this.procesandoId = id;
      this.usuarioService.aprobarUsuario(id).subscribe({
        next: () => {
          this.modalService.showAlert(`Usuario ${nombre} activado correctamente.`, 'Éxito', 'success');
          this.cargarEmpleados();
          this.procesandoId = null;
        },
        error: (err) => {
          console.error(err);
          this.modalService.showAlert('Ocurrió un error al intentar activar el usuario.', 'Error', 'error');
          this.procesandoId = null;
        }
      });
    }
  }

  cambiarPagina(nuevaPagina: number): void {
    if (nuevaPagina >= 0 && nuevaPagina < this.totalPages && nuevaPagina !== this.currentPage) {
      this.currentPage = nuevaPagina;
      this.cargarEmpleados();
    }
  }
}
