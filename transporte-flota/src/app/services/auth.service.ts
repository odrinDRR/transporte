import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
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

    const tienePreguntas = localStorage.getItem('smu_tiene_preguntas') === 'true';
    const debeCambiarClave = localStorage.getItem('smu_debe_cambiar_clave') === 'true';

    if (token) {
      this.usuarioActualSubject.next({ id, token, rol, nombre, correo, tienePreguntas, debeCambiarClave });
    }
  }

  // Login contra la base de datos
  login(username: string, password: string): Observable<any> {
    const hashedPassword = CryptoJS.SHA256(password).toString();
    return this.http.post<any>(`${this.apiUrl}/login`, { username, password: hashedPassword }).pipe(
      tap(res => {
        // Guardar la respuesta del servidor en el Storage
        localStorage.setItem('smu_id', res.id);
        localStorage.setItem('smu_token', res.token);
        localStorage.setItem('smu_rol', res.rol);
        localStorage.setItem('smu_nombre', res.nombre);
        localStorage.setItem('smu_correo', res.correo);
        localStorage.setItem('smu_tiene_preguntas', res.tienePreguntas);
        localStorage.setItem('smu_debe_cambiar_clave', res.debeCambiarClave);

        this.usuarioActualSubject.next(res);
      })
    );
  }

  // Registro de nuevo usuario
  // Registro de nuevo usuario
  register(datosRegistro: any): Observable<any> {
    if (datosRegistro.password) {
      datosRegistro.password = CryptoJS.SHA256(datosRegistro.password).toString();
    }
    return this.http.post<any>(`${this.apiUrl}/register`, datosRegistro, { responseType: 'text' as 'json' });
  }

  // Cerrar sesión
  logout(): void {
    localStorage.removeItem('smu_id');
    localStorage.removeItem('smu_token');
    localStorage.removeItem('smu_rol');
    localStorage.removeItem('smu_nombre');
    localStorage.removeItem('smu_correo');
    localStorage.removeItem('smu_tiene_preguntas');
    localStorage.removeItem('smu_debe_cambiar_clave');
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

  // Cambiar clave
  cambiarClave(payload: any): Observable<any> {
    const hashedPayload = {
      claveActual: CryptoJS.SHA256(payload.claveActual).toString(),
      nuevaClave: CryptoJS.SHA256(payload.nuevaClave).toString()
    };
    return this.http.post(`${this.apiUrl}/cambiar-clave`, hashedPayload, { responseType: 'text' });
  }

  // Obtener Preguntas Fijas
  obtenerPreguntasFijas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/preguntas-fijas`);
  }

  // Registrar Preguntas (encriptando las respuestas)
  registrarPreguntas(preguntas: any[]): Observable<any> {
    // Trim y Hash a las respuestas antes de mandarlas
    const preguntasHashed = preguntas.map(p => ({
      ...p,
      respuesta: CryptoJS.SHA256(p.respuesta.trim().toLowerCase()).toString()
    }));
    return this.http.post(`${this.apiUrl}/preguntas/registrar`, { preguntas: preguntasHashed }, { responseType: 'text' });
  }

  // Update local storage status
  actualizarEstadoSeguridad(tienePreguntas: boolean, debeCambiarClave: boolean): void {
    localStorage.setItem('smu_tiene_preguntas', tienePreguntas.toString());
    localStorage.setItem('smu_debe_cambiar_clave', debeCambiarClave.toString());
    const currentUser = this.usuarioActualSubject.value;
    if (currentUser) {
      this.usuarioActualSubject.next({ ...currentUser, tienePreguntas, debeCambiarClave });
    }
  }

  // --- MÉTODOS DE RECUPERACIÓN DE CLAVE ---
  
  obtenerPreguntasRecuperacion(usernameOCedula: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/recuperar-clave/preguntas?usernameOCedula=${usernameOCedula}`);
  }

  restablecerClave(payload: any): Observable<any> {
    // Hashear las respuestas y la nueva clave antes de enviar
    const hashedRespuestas = payload.respuestas.map((r: any) => ({
      ...r,
      respuesta: CryptoJS.SHA256(r.respuesta.trim().toLowerCase()).toString()
    }));

    const finalPayload = {
      usernameOCedula: payload.usernameOCedula,
      respuestas: hashedRespuestas,
      nuevaClave: CryptoJS.SHA256(payload.nuevaClave).toString()
    };

    return this.http.post(`${this.apiUrl}/recuperar-clave/restablecer`, finalPayload, { responseType: 'text' });
  }
}
