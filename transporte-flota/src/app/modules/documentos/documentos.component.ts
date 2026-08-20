import { Component } from '@angular/core';
import { FlotaService } from '../../core/services/flota.service';

@Component({
  selector: 'app-documentos',
  templateUrl: './documentos.component.html'
})
export class DocumentosComponent {
  constructor(public flotaService: FlotaService) {}
}