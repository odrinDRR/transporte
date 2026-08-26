import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  
  // Guardamos los datos del usuario logueado
  private usuarioActualSubject = new BehaviorSubject<any>(null);
  public usuarioActual$ = this.usuarioActualSubject.asObservable();

  constructor(private http: HttpClient) {
    this.cargarUsuarioDesdeStorage();
  }

  // Cargar desde localStorage al iniciar la app
  private cargarUsuarioDesdeStorage() {
    const token = localStorage.getItem('smu_token');
    const rol = localStorage.getItem('smu_rol');
    const nombre = localStorage.getItem('smu_nombre');
    const correo = localStorage.getItem('smu_correo');

    if (token) {
      this.usuarioActualSubject.next({ token, rol, nombre, correo });
    }
  }

  // Login contra la base de datos
  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { username, password }).pipe(
      tap(res => {
        // Guardar la respuesta del servidor en el Storage
        localStorage.setItem('smu_token', res.token);
        localStorage.setItem('smu_rol', res.rol);
        localStorage.setItem('smu_nombre', res.nombre);
        localStorage.setItem('smu_correo', res.correo);

        this.usuarioActualSubject.next(res);
      })
    );
  }

  // Registro de nuevo usuario
  register(datosRegistro: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, datosRegistro, { responseType: 'text' as 'json' });
  }

  // Cerrar sesión
  logout(): void {
    localStorage.removeItem('smu_token');
    localStorage.removeItem('smu_rol');
    localStorage.removeItem('smu_nombre');
    localStorage.removeItem('smu_correo');
    this.usuarioActualSubject.next(null);
  }

  // Obtener Token para el interceptor
  getToken(): string | null {
    return localStorage.getItem('smu_token');
  }

  getRolActual(): string | null {
    return localStorage.getItem('smu_rol');
  }

  // Verificamos si es ADMIN para permisos especiales
  esAdmin(): boolean {
    return this.getRolActual() === 'ADMIN';
  }
}
