import { Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Vehiculo, Conductor } from '../../core/models/fleet.models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-ficha-publica',
  templateUrl: './ficha-publica.component.html',
  styleUrls: ['./ficha-publica.component.scss']
})
export class FichaPublicaComponent implements OnInit {
  @Input() vehiculoId!: number;
  
  vehiculo: Vehiculo | null = null;
  conductor: Conductor | null = null;
  cargando = true;
  error = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    if (this.vehiculoId) {
      this.cargarVehiculo(this.vehiculoId);
    } else {
      this.error = 'No se proporcionó un ID de vehículo.';
      this.cargando = false;
    }
  }

  cargarVehiculo(id: number) {
    this.http.get<Vehiculo>(`${environment.apiUrl}/vehiculos/${id}`).subscribe({
      next: (v) => {
        this.vehiculo = v;
        if (v.conductorId) {
          this.cargarConductor(v.conductorId);
        } else {
          this.cargando = false;
        }
      },
      error: (err) => {
        this.error = 'Error al cargar los datos del vehículo. Puede que no exista.';
        this.cargando = false;
      }
    });
  }

  cargarConductor(id: number) {
    this.http.get<Conductor>(`${environment.apiUrl}/conductores/${id}`).subscribe({
      next: (c) => {
        this.conductor = c;
        this.cargando = false;
      },
      error: (err) => {
        this.cargando = false; // No importa si el conductor falla
      }
    });
  }
}
