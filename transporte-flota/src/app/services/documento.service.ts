import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Documento } from '../core/models/fleet.models';

@Injectable({
  providedIn: 'root'
})
export class DocumentoService {
  private apiUrl = `${environment.apiUrl}/documentos`;

  constructor(private http: HttpClient) { }

  obtenerDocumentosPorVehiculo(vehiculoId: number): Observable<Documento[]> {
    return this.http.get<Documento[]>(`${this.apiUrl}/vehiculo/${vehiculoId}`);
  }

  subirDocumento(documento: Documento): Observable<Documento> {
    return this.http.post<Documento>(this.apiUrl, documento);
  }
}
