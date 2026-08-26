import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Vehiculo } from '../core/models/fleet.models';

@Injectable({
  providedIn: 'root'
})
export class VehiculoService {
  
  // Apunta al endpoint de Spring Boot configurado en tus environments
  private apiUrl = `${environment.apiUrl}/vehiculos`;

  constructor(private http: HttpClient) { }

  // GET: Obtener todos los vehículos
  obtenerVehiculos(): Observable<Vehiculo[]> {
    return this.http.get<Vehiculo[]>(this.apiUrl);
  }

  // GET: Obtener un vehículo por su ID (Opcional, pero muy útil para editar)
  obtenerVehiculoPorId(id: number): Observable<Vehiculo> {
    return this.http.get<Vehiculo>(`${this.apiUrl}/${id}`);
  }

  // POST: Crear un nuevo vehículo
  crearVehiculo(vehiculo: Vehiculo): Observable<Vehiculo> {
    return this.http.post<Vehiculo>(this.apiUrl, vehiculo);
  }

  // PUT: Actualizar un vehículo existente
  actualizarVehiculo(id: number, vehiculo: Vehiculo): Observable<Vehiculo> {
    return this.http.put<Vehiculo>(`${this.apiUrl}/${id}`, vehiculo);
  }

  // DELETE: Eliminar un vehículo
  eliminarVehiculo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}