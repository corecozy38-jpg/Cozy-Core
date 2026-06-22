import { Component, HostListener } from '@angular/core';
import { SiteSettingsService } from '../../core/services/site-settings.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-order-guide',
  standalone: true,
  imports: [TranslatePipe, CommonModule],
  templateUrl: './order-guide.html',
  styleUrl: './order-guide.css',
})
export class OrderGuide {
  images: { url: string; publicId: string }[] = [];
  loading = true;
  isModalOpen = false;
  currentIndex = 0;

  constructor(
    private _settingsService: SiteSettingsService,
    private _translate: TranslateService
  ) {}

  ngOnInit(): void {
    this._settingsService.getOrderGuide().subscribe({
      next: (res) => {
        this.images = res.data.images || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  getStepAlt(index: number): string {
    return this._translate.instant('order_guide.step') + ' ' + (index + 1);
  }

  openModal(index: number): void {
    this.currentIndex = index;
    this.isModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    this.isModalOpen = false;
    document.body.style.overflow = '';
  }

  nextImage(): void {
    if (this.images.length > 0) {
      this.currentIndex = (this.currentIndex + 1) % this.images.length;
    }
  }

  prevImage(): void {
    if (this.images.length > 0) {
      this.currentIndex =
        (this.currentIndex - 1 + this.images.length) % this.images.length;
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (!this.isModalOpen) return;
    if (event.key === 'Escape') {
      this.closeModal();
    } else if (event.key === 'ArrowRight') {
      this.nextImage();
    } else if (event.key === 'ArrowLeft') {
      this.prevImage();
    }
  }
}