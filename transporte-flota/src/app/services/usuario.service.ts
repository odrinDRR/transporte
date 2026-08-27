import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
// Importa tu modelo de Usuario y RolUsuario

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/usuarios`;
  
  // Mantenemos tu lógica reactiva para la sesión actual
  private rolActualSubject = new BehaviorSubject<string | null>(null);
  public rolActual$ = this.rolActualSubject.asObservable();

  constructor(private http: HttpClient) { }

  // --- MÉTODOS HTTP (CRUD) ---
  obtenerUsuarios(): Observable<any[]> { return this.http.get<any[]>(this.apiUrl); }
  crearUsuario(usuario: any): Observable<any> { return this.http.post<any>(this.apiUrl, usuario); }
  obtenerPorId(id: string | number): Observable<any> { return this.http.get<any>(`${this.apiUrl}/${id}`); }
  actualizarUsuario(id: string | number, usuario: any): Observable<any> { return this.http.put<any>(`${this.apiUrl}/${id}`, usuario); }

  // --- MÉTODOS DE ESTADO DE SESIÓN ---
  iniciarSesion(rol: string): void { this.rolActualSubject.next(rol); }
  cerrarSesion(): void { this.rolActualSubject.next(null); }
  
  puedeEditarOEliminar(): boolean {
    const rol = this.rolActualSubject.value;
    return rol === 'ADMIN' || rol === 'COORDINADOR';
  }
}