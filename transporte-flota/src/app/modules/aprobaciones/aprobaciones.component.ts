import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-aprobaciones',
  templateUrl: './aprobaciones.component.html'
})
export class AprobacionesComponent implements OnInit {
  solicitudesPendientes: any[] = [];
  solicitudesVisibles: any[] = [];
  rolActual: string | null = null;
  apiUrl = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient, public authService: AuthService) {}

  ngOnInit(): void {
    this.authService.usuarioActual$.subscribe(user => {
      this.rolActual = user?.rol || null;
      this.cargarUsuarios();
    });
  }

  cargando = false;

  cargarUsuarios(): void {
    this.cargando = true;
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (usuarios) => {
        // Filtrar los que están PENDIENTES
        this.solicitudesPendientes = usuarios.filter(u => u.estado === 'PENDIENTE');
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
    } else {
      this.solicitudesVisibles = [];
    }
  }

  aprobar(id: number, nombre: string): void {
    if (confirm(`¿Estás seguro de APROBAR el acceso para ${nombre}?`)) {
      this.http.put(`${this.apiUrl}/aprobar/${id}`, {}).subscribe({
        next: () => {
          this.cargarUsuarios();
          alert('Usuario aprobado y notificado. Ya puede iniciar sesión.');
        },
        error: (err) => console.error('Error al aprobar', err)
      });
    }
  }

  rechazar(id: number): void {
    if (confirm('¿Deseas RECHAZAR y eliminar esta solicitud?')) {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe({
        next: () => this.cargarUsuarios(),
        error: (err) => console.error('Error al rechazar', err)
      });
    }
  }
}