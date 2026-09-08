import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { RolUsuario, Vehiculo, Conductor, RegistroCombustible } from '../models/fleet.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FlotaService {

  // CONTROL DE ROLES Y SESIÓN
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

    return this.http.post(`${this.apiUrl}/usuarios/asignar-unidad`, payload, { responseType: 'text' });
  }

  desvincularUnidad(conductorId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/usuarios/desvincular-unidad/${conductorId}`, {}, { responseType: 'text' });
  }

  // --- MÉTODOS DE ROL ---
  cambiarRol(rol: RolUsuario): void {
    this.rolActualSubject.next(rol);
  }

  puedeEditarOEliminar(): boolean {
    const rol = this.rolActualSubject.value;
    return rol === 'ADMIN' || rol === 'COORDINADOR' || rol === null;
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