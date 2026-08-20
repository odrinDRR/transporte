import { Pipe, PipeTransform } from '@angular/core';
import { Vehiculo } from '../../core/models/fleet.models';

@Pipe({ name: 'filterStatus' })
export class FilterStatusPipe implements PipeTransform {
  transform(items: Vehiculo[] | null, status: string): Vehiculo[] {
    if (!items) return [];
    return items.filter(item => item.estado === status);
  }
}