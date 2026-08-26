import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Inspeccion } from '../core/models/fleet.models';

@Injectable({
  providedIn: 'root'
})
export class InspeccionService {
  private apiUrl = `${environment.apiUrl}/inspecciones`;

  constructor(private http: HttpClient) { }

  obtenerInspecciones(): Observable<Inspeccion[]> {
    return this.http.get<Inspeccion[]>(this.apiUrl);
  }

  crearInspeccion(inspeccion: Inspeccion): Observable<Inspeccion> {
    return this.http.post<Inspeccion>(this.apiUrl, inspeccion);
  }
}
