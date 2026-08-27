import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Conductor } from '../core/models/fleet.models';

@Injectable({ providedIn: 'root' })
export class ConductorService {
  private apiUrl = `${environment.apiUrl}/conductores`;

  constructor(private http: HttpClient) { }

  obtenerConductores(): Observable<Conductor[]> { return this.http.get<Conductor[]>(this.apiUrl); }
  crearConductor(conductor: Conductor): Observable<Conductor> { return this.http.post<Conductor>(this.apiUrl, conductor); }
  actualizarConductor(id: number, conductor: Conductor): Observable<Conductor> { return this.http.put<Conductor>(`${this.apiUrl}/${id}`, conductor); }
  eliminarConductor(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }
}