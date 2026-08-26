import { Component, OnInit } from '@angular/core';
import { FlotaService } from '../../core/services/flota.service';
import { CombustibleService } from '../../services/combustible.service';
import { RegistroCombustible } from '../../core/models/fleet.models';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-combustible',
  templateUrl: './combustible.component.html'
})
export class CombustibleComponent implements OnInit {
  registros$!: Observable<RegistroCombustible[]>;

  constructor(
    public flotaService: FlotaService,
    private combustibleService: CombustibleService
  ) {}

  ngOnInit(): void {
    this.registros$ = this.combustibleService.obtenerRegistros();
  }
}