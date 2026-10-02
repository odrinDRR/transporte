import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-paginador',
  templateUrl: './paginador.component.html',
  styleUrls: ['./paginador.component.scss']
})
export class PaginadorComponent {
  @Input() currentPage: number = 0;
  @Input() totalPages: number = 1;
  @Input() totalElements: number = 0;
  @Output() pageChange = new EventEmitter<number>();

  inputPage: number | string = '';

  get pages(): (number | string)[] {
    const pagesList: (number | string)[] = [];
    if (this.totalPages <= 7) {
      for (let i = 0; i < this.totalPages; i++) {
        pagesList.push(i);
      }
    } else {
      if (this.currentPage <= 3) {
        for (let i = 0; i < 5; i++) pagesList.push(i);
        pagesList.push('...');
        pagesList.push(this.totalPages - 1);
      } else if (this.currentPage >= this.totalPages - 4) {
        pagesList.push(0);
        pagesList.push('...');
        for (let i = this.totalPages - 5; i < this.totalPages; i++) pagesList.push(i);
      } else {
        pagesList.push(0);
        pagesList.push('...');
        pagesList.push(this.currentPage - 1);
        pagesList.push(this.currentPage);
        pagesList.push(this.currentPage + 1);
        pagesList.push('...');
        pagesList.push(this.totalPages - 1);
      }
    }
    return pagesList;
  }

  cambiarPagina(page: number | string): void {
    if (typeof page === 'number' && page >= 0 && page < this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }

  jumpToPage(): void {
    const p = parseInt(this.inputPage as string, 10);
    if (!isNaN(p) && p >= 1 && p <= this.totalPages) {
      this.cambiarPagina(p - 1);
      this.inputPage = ''; // Limpiar el input luego de ir a la página
    }
  }
}
