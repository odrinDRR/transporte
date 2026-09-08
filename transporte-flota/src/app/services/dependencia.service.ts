import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface Dependencia {
  id?: number;
  nombre: string;
  activa: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DependenciaService {

  private apiUrl = `${environment.apiUrl}/dependencias`;

  constructor(private http: HttpClient) { }

  obtenerDependencias(): Observable<Dependencia[]> {
    return this.http.get<Dependencia[]>(this.apiUrl);
  }

  obtenerTodasDependencias(): Observable<Dependencia[]> {
    return this.http.get<Dependencia[]>(`${this.apiUrl}/all`);
  }

  crearDependencia(dependencia: Dependencia): Observable<Dependencia> {
    return this.http.post<Dependencia>(this.apiUrl, dependencia);
  }

  actualizarDependencia(id: number, dependencia: Dependencia): Observable<Dependencia> {
    return this.http.put<Dependencia>(`${this.apiUrl}/${id}`, dependencia);
  }
}
