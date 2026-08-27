import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { RegistroCombustible } from '../core/models/fleet.models';

@Injectable({
  providedIn: 'root'
})
export class CombustibleService {
  private apiUrl = `${environment.apiUrl}/combustible`;

  constructor(private http: HttpClient) { }

  obtenerRegistros(): Observable<RegistroCombustible[]> {
    return this.http.get<RegistroCombustible[]>(this.apiUrl);
  }

  agregarRegistro(registro: RegistroCombustible): Observable<RegistroCombustible> {
    return this.http.post<RegistroCombustible>(this.apiUrl, registro);
  }
}
