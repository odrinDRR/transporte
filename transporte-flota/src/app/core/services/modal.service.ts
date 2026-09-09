import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface ModalData {
  title: string;
  message: string;
  type: 'alert' | 'confirm';
  icon?: 'success' | 'error' | 'warning' | 'info';
  resolve?: (value: boolean) => void;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalSubject = new Subject<ModalData | null>();
  public modalState$: Observable<ModalData | null> = this.modalSubject.asObservable();

  constructor() {}

  showAlert(message: string, title: string = 'Atención', icon: 'success' | 'error' | 'warning' | 'info' = 'info'): void {
    this.modalSubject.next({
      title,
      message,
      type: 'alert',
      icon
    });
  }

  showConfirm(message: string, title: string = 'Confirmar Acción', icon: 'warning' | 'info' = 'warning'): Promise<boolean> {
    return new Promise((resolve) => {
      this.modalSubject.next({
        title,
        message,
        type: 'confirm',
        icon,
        resolve
      });
    });
  }

  closeModal(): void {
    this.modalSubject.next(null);
  }
}
