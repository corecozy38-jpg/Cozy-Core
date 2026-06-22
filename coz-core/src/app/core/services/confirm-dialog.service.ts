import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ConfirmDialogService {
  private confirmSignal = signal<ConfirmOptions | null>(null);
  private resolveFn?: (value: boolean) => void;

  readonly confirmData = this.confirmSignal.asReadonly();

  open(options: ConfirmOptions): Promise<boolean> {
    this.confirmSignal.set(options);
    return new Promise((resolve) => {
      this.resolveFn = resolve;
    });
  }

  confirm(confirmed: boolean) {
    if (this.resolveFn) {
      this.resolveFn(confirmed);
      this.resolveFn = undefined;
    }
    this.confirmSignal.set(null);
  }
}
