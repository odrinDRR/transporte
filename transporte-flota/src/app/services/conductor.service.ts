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

  obtenerConductores(): Observable<Conductor[]> { 
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(usuarios => usuarios.filter(u => u.cargo === 'CONDUCTOR' || u.cargo === 'COORDINADOR').map(u => ({
        id: u.id,
        nombre: u.nombre + ' ' + u.apellido,
        cedula: u.cedula,
        fichaNumerica: u.ficha || u.licencia,
        telefono: u.telefono,
        fotoUrl: u.fotoUrl,
        activo: u.activo
      })))
    );
  }
}