import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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

  obtenerDependencias(page: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?page=${page}&size=${size}`);
  }

  obtenerTodasDependencias(page: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/all?page=${page}&size=${size}`);
  }

  crearDependencia(dependencia: Dependencia): Observable<Dependencia> {
    return this.http.post<Dependencia>(this.apiUrl, dependencia);
  }

  actualizarDependencia(id: number, dependencia: Dependencia): Observable<Dependencia> {
    return this.http.put<Dependencia>(`${this.apiUrl}/${id}`, dependencia);
  }
}
