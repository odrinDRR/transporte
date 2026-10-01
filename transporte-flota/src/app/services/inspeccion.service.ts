import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Inspeccion } from '../core/models/fleet.models';

@Injectable({
  providedIn: 'root'
})
export class InspeccionService {
  private apiUrl = `${environment.apiUrl}/inspecciones`;

  constructor(private http: HttpClient) { }

  obtenerInspecciones(page: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?page=${page}&size=${size}`);
  }

  crearInspeccion(inspeccion: Inspeccion): Observable<Inspeccion> {
    return this.http.post<Inspeccion>(this.apiUrl, inspeccion);
  }

  obtenerInspeccionesLivianos(page: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/inspecciones-livianos?page=${page}&size=${size}`);
  }
}
