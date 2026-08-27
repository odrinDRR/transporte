import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Mantenimiento } from '../core/models/fleet.models';

@Injectable({
  providedIn: 'root'
})
export class MantenimientoService {
  private apiUrl = `${environment.apiUrl}/mantenimientos`;

  constructor(private http: HttpClient) { }

  obtenerMantenimientos(): Observable<Mantenimiento[]> {
    return this.http.get<Mantenimiento[]>(this.apiUrl);
  }

  registrarMantenimiento(mantenimiento: Mantenimiento): Observable<Mantenimiento> {
    return this.http.post<Mantenimiento>(this.apiUrl, mantenimiento);
  }
}
