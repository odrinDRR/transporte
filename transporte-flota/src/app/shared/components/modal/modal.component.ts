import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ModalService, ModalData } from '../../../core/services/modal.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit, OnDestroy {
  modalData: ModalData | null = null;
  private subscription!: Subscription;

  constructor(private modalService: ModalService) {}

  ngOnInit(): void {
    this.subscription = this.modalService.modalState$.subscribe(data => {
      this.modalData = data;
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  getIconClass(): string {
    if (!this.modalData) return '';
    switch (this.modalData.icon) {
      case 'success': return 'bi-check-circle text-success';
      case 'error': return 'bi-x-circle text-danger';
      case 'warning': return 'bi-exclamation-triangle text-warning';
      case 'info': return 'bi-info-circle text-info';
      default: return 'bi-info-circle text-info';
    }
  }

  onAccept(): void {
    if (this.modalData?.type === 'confirm' && this.modalData.resolve) {
      this.modalData.resolve(true);
    }
    this.close();
  }

  onCancel(): void {
    if (this.modalData?.type === 'confirm' && this.modalData.resolve) {
      this.modalData.resolve(false);
    }
    this.close();
  }

  close(): void {
    this.modalService.closeModal();
  }
}
