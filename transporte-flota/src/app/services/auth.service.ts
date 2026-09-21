import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, delay } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import * as CryptoJS from 'crypto-js';

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
    const id = localStorage.getItem('smu_id');
    const token = localStorage.getItem('smu_token');
    const rol = localStorage.getItem('smu_rol');
    const nombre = localStorage.getItem('smu_nombre');
    const correo = localStorage.getItem('smu_correo');

    if (token) {
      this.usuarioActualSubject.next({ id, token, rol, nombre, correo });
    }
  }

  // Login (ADAPTADO A MODO LOCAL / MOCK)
  login(username: string, password: string): Observable<any> {
    
    // =========================================================
    // 1. MODO LOCAL (Simulación para desarrollo frontend)
    // =========================================================
    
    // Asignamos el rol basándonos en el correo que genera tu LoginComponent
    let rolSimulado = 'ADMIN';
    const emailLower = username.toLowerCase();
    
    if (emailLower.includes('coordinador')) rolSimulado = 'COORDINADOR';
    else if (emailLower.includes('supervisor')) rolSimulado = 'SUPERVISOR';
    else if (emailLower.includes('empleado')) rolSimulado = 'EMPLEADO';
    else if (emailLower.includes('conductor')) rolSimulado = 'CONDUCTOR';

    // Objeto que simula la respuesta exitosa de tu Backend
    const respuestaMock = {
      id: '999',
      token: 'token-jwt-simulado-local-123456',
      rol: rolSimulado,
      nombre: `Usuario ${rolSimulado}`,
      correo: username
    };

    // Retornamos el objeto usando "of" y simulamos 800ms de carga en red
    return of(respuestaMock).pipe(
      delay(800),
      tap(res => {
        localStorage.setItem('smu_id', res.id);
        localStorage.setItem('smu_token', res.token);
        localStorage.setItem('smu_rol', res.rol);
        localStorage.setItem('smu_nombre', res.nombre);
        localStorage.setItem('smu_correo', res.correo);

        this.usuarioActualSubject.next(res);
      })
    );

    // =========================================================
    // 2. MODO SERVIDOR (Comentado hasta que el backend esté listo)
    // =========================================================
    /*
    const hashedPassword = CryptoJS.SHA256(password).toString();
    return this.http.post<any>(`${this.apiUrl}/login`, { username, password: hashedPassword }).pipe(
      tap(res => {
        localStorage.setItem('smu_id', res.id);
        localStorage.setItem('smu_token', res.token);
        localStorage.setItem('smu_rol', res.rol);
        localStorage.setItem('smu_nombre', res.nombre);
        localStorage.setItem('smu_correo', res.correo);
        this.usuarioActualSubject.next(res);
      })
    );
    */
  }

  // Registro de nuevo usuario (ADAPTADO A MODO LOCAL / MOCK)
  register(datosRegistro: any): Observable<any> {
    // Simulamos un registro exitoso local para que no falle tu formulario
    return of('Solicitud registrada con éxito (Simulación Local)').pipe(delay(1000));

    /*
    if (datosRegistro.password) {
      datosRegistro.password = CryptoJS.SHA256(datosRegistro.password).toString();
    }
    return this.http.post<any>(`${this.apiUrl}/register`, datosRegistro, { responseType: 'text' as 'json' });
    */
  }

  // Cerrar sesión
  logout(): void {
    localStorage.removeItem('smu_id');
    localStorage.removeItem('smu_token');
    localStorage.removeItem('smu_rol');
    localStorage.removeItem('smu_nombre');
    localStorage.removeItem('smu_correo');
    this.usuarioActualSubject.next(null);
  }

  getUsuarioId(): string | null {
    const id = localStorage.getItem('smu_id');
    if (!id || id === 'undefined' || id === 'null') {
      return null;
    }
    return id;
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