import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Conductor } from '../core/models/fleet.models';

@Injectable({ providedIn: 'root' })
export class ConductorService {
  private apiUrl = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) { }

  obtenerConductores(page: number = 0, size: number = 10, cedula: string = '', ficha: string = '', nombre: string = ''): Observable<any> { 
    let url = `${this.apiUrl}?page=${page}&size=${size}`;
    if (cedula) url += `&cedula=${encodeURIComponent(cedula)}`;
    if (ficha) url += `&ficha=${encodeURIComponent(ficha)}`;
    if (nombre) url += `&nombre=${encodeURIComponent(nombre)}`;
    return this.http.get<any>(url).pipe(
      map(res => {
        const usuarios = res.content || res;
        const pageData = { ...res };
        pageData.content = usuarios.filter((u: any) => u.cargo === 'CONDUCTOR' || u.cargo === 'COORDINADOR').map((u: any) => ({
          id: u.id,
          nombre: u.nombre + ' ' + (u.apellido || ''),
          cedula: u.cedula,
          fichaNumerica: u.ficha || u.licencia,
          telefono: u.telefono,
          fotoUrl: u.fotoUrl,
          activo: u.activo
        }));
        return pageData;
      })
    );
  }
}