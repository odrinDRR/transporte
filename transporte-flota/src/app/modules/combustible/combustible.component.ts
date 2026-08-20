import { Component } from '@angular/core';
import { FlotaService } from '../../core/services/flota.service';

@Component({
  selector: 'app-combustible',
  templateUrl: './combustible.component.html'
})
export class CombustibleComponent {
  constructor(public flotaService: FlotaService) {}
}