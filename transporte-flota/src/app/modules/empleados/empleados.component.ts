import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-empleados',
  templateUrl: './empleados.component.html'
})
export class EmpleadosComponent implements OnInit {
  empleados: any[] = [];
  cargando = false;
  filtroTexto = '';
  filtroRol: 'TODOS' | 'EMPLEADOS' | 'COORDINADORES' = 'TODOS';

  constructor(private http: HttpClient) {}

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

  desactivarUsuario(id: number, nombre: string): void {
    if (confirm(`¿Estás seguro de que deseas desactivar a ${nombre}? Esta acción inhabilitará su acceso al sistema y lo desvinculará de cualquier unidad asignada.`)) {
      this.http.delete(`${environment.apiUrl}/usuarios/${id}`).subscribe({
        next: () => {
          alert(`Usuario ${nombre} desactivado correctamente.`);
          this.cargarEmpleados();
        },
        error: (err) => {
          console.error(err);
          alert('Ocurrió un error al intentar desactivar el usuario.');
        }
      });
    }
  }

  activarUsuario(id: number, nombre: string): void {
    if (confirm(`¿Estás seguro de que deseas activar a ${nombre}? Esta acción rehabilitará su acceso al sistema.`)) {
      this.http.put(`${environment.apiUrl}/usuarios/aprobar/${id}`, {}).subscribe({
        next: () => {
          alert(`Usuario ${nombre} activado correctamente.`);
          this.cargarEmpleados();
        },
        error: (err) => {
          console.error(err);
          alert('Ocurrió un error al intentar activar el usuario.');
        }
      });
    }
  }
}
