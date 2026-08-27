import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { RolUsuario } from '../models/fleet.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FlotaService {

  private rolActualSubject = new BehaviorSubject<RolUsuario | null>(null);
  public rolActual$ = this.rolActualSubject.asObservable();
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  get rolActual(): RolUsuario | null {
    return this.rolActualSubject.value;
  }

  // --- MÉTODOS HTTP AL BACKEND ---
  asignarUnidad(idVehiculo: number, terminoBusqueda: string): Observable<any> {
    const payload = { 
      vehiculoId: idVehiculo, 
      identificadorConductor: terminoBusqueda.trim() 
    };

    return this.http.post<any>(`${this.apiUrl}/asignar-unidad`, payload);
  }

  // --- MÉTODOS DE ROL ---
  cambiarRol(rol: RolUsuario): void {
    this.rolActualSubject.next(rol);
  }

  puedeEditarOEliminar(): boolean {
    const rol = this.rolActualSubject.value;
    return rol === 'ADMIN' || rol === 'COORDINADOR';
  }

  puedeRegistrarOAsignar(): boolean {
    const rol = this.rolActualSubject.value;
    return rol === 'ADMIN' || rol === 'COORDINADOR' || rol === 'EMPLEADO';
  }

  iniciarSesion(rol: RolUsuario): void {
    this.rolActualSubject.next(rol);
  }

  cerrarSesion(): void {
    this.rolActualSubject.next(null);
  }
}