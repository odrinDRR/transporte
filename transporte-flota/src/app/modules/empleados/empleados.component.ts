import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  constructor(private http: HttpClient, private modalService: ModalService) {}

  ngOnInit(): void {
    this.cargarEmpleados();
  }

  cargarEmpleados(): void {
    this.cargando = true;
    this.http.get<any[]>(`${environment.apiUrl}/usuarios`).subscribe({
      next: (usuarios) => {
        // Mostrar SOLO EMPLEADO y COORDINADOR que no estén pendientes
        this.empleados = usuarios
          .filter(u => u.estado !== 'PENDIENTE' && (u.cargo === 'EMPLEADO' || u.cargo === 'COORDINADOR'))
          .sort((a, b) => (a.estado === 'ACTIVO' ? -1 : 1));
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

  async desactivarUsuario(id: number, nombre: string): Promise<void> {
    const confirmado = await this.modalService.showConfirm(
      `¿Estás seguro de que deseas desactivar a ${nombre}? Esta acción inhabilitará su acceso al sistema y lo desvinculará de cualquier unidad asignada.`
    );
    
    if (confirmado) {
      this.procesandoId = id;
      this.http.delete(`${environment.apiUrl}/usuarios/${id}`).subscribe({
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
      this.http.put(`${environment.apiUrl}/usuarios/aprobar/${id}`, {}).subscribe({
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
}
