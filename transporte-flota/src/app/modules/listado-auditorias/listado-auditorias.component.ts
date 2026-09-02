import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-listado-auditorias',
  templateUrl: './listado-auditorias.component.html',
  styleUrls: ['./listado-auditorias.component.scss']
})
export class ListadoAuditoriasComponent implements OnInit {

  tabActiva: 'EN_TRANSITO' | 'AUDITADAS' = 'EN_TRANSITO';
  
  auditoriasEnTransito: any[] = [];
  auditoriasCompletadas: any[] = [];
  cargando: boolean = false;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    this.cargando = true;
    
    // 1. Cargar inspecciones abiertas (en patio / en transito)
    this.http.get<any[]>(`${environment.apiUrl}/inspecciones-livianos`).subscribe({
      next: (inspecciones) => {
        this.auditoriasEnTransito = inspecciones.filter(ins => ins.tipoInspeccion === 'INICIO' && ins.estado === 'ABIERTA');
        
        // 2. Cargar auditorias de patio
        this.http.get<any[]>(`${environment.apiUrl}/auditorias-patio`).subscribe({
          next: (auditorias) => {
            this.auditoriasCompletadas = auditorias.sort((a, b) => b.id - a.id); // Orden desc
            this.cargando = false;
          },
          error: () => this.cargando = false
        });
      },
      error: () => this.cargando = false
    });
  }

  cambiarTab(tab: 'EN_TRANSITO' | 'AUDITADAS') {
    this.tabActiva = tab;
  }
}
