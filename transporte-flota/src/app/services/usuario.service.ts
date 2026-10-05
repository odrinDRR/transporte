import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
// Importa tu modelo de Usuario y RolUsuario

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/usuarios`;
  
  // Mantenemos tu lógica reactiva para la sesión actual
  private rolActualSubject = new BehaviorSubject<string | null>(null);
  public rolActual$ = this.rolActualSubject.asObservable();

  constructor(private http: HttpClient) { }

  obtenerUsuarios(page: number = 0, size: number = 10): Observable<any> { 
    return this.http.get<any>(`${this.apiUrl}?page=${page}&size=${size}`); 
  }
  obtenerPendientes(cargo?: string, page: number = 0, size: number = 10): Observable<any> { 
    let url = `${this.apiUrl}/pendientes?page=${page}&size=${size}`;
    if (cargo) {
      url += `&cargo=${cargo}`;
    }
    return this.http.get<any>(url);
  }
  crearUsuario(usuario: any): Observable<any> { return this.http.post<any>(this.apiUrl, usuario); }
  obtenerPorId(id: string | number): Observable<any> { return this.http.get<any>(`${this.apiUrl}/${id}`); }
  actualizarUsuario(id: string | number, usuario: any): Observable<any> { return this.http.put<any>(`${this.apiUrl}/${id}`, usuario); }
  aprobarUsuario(id: string | number): Observable<any> { return this.http.put<any>(`${this.apiUrl}/aprobar/${id}`, {}); }
  rechazarUsuario(id: string | number): Observable<any> { return this.http.delete<any>(`${this.apiUrl}/${id}`); }
  restablecerCredenciales(id: string | number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/restablecer-credenciales`, {}, { responseType: 'text' });
  }
  // --- MÉTODOS DE ESTADO DE SESIÓN ---
  iniciarSesion(rol: string): void { this.rolActualSubject.next(rol); }
  cerrarSesion(): void { this.rolActualSubject.next(null); }
  
  puedeEditarOEliminar(): boolean {
    const rol = this.rolActualSubject.value;
    return rol === 'ADMIN' || rol === 'COORDINADOR';
  }
}