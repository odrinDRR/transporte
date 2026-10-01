import { Component, Input, HostBinding } from '@angular/core';

@Component({
  selector: 'app-empty-state, [app-empty-state]',
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.scss']
})
export class EmptyStateComponent {
  @Input() titulo: string = 'No hay datos';
  @Input() mensaje: string = 'La lista se encuentra vacía.';
  @Input() icono: string = 'bi-inbox';
  @Input() @HostBinding('attr.colspan') colspan: string | number | null = null;
}
