import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Mantenimiento } from '../core/models/fleet.models';

@Injectable({
  providedIn: 'root'
})
export class MantenimientoService {
  private apiUrl = `${environment.apiUrl}/mantenimientos`;

  constructor(private http: HttpClient) { }

  obtenerMantenimientos(page: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?page=${page}&size=${size}`);
  }

  registrarMantenimiento(mantenimiento: Mantenimiento): Observable<Mantenimiento> {
    return this.http.post<Mantenimiento>(this.apiUrl, mantenimiento);
  }
}
