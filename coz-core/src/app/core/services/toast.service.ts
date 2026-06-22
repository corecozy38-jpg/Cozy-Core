import { Injectable, signal } from '@angular/core';
import { LanguageService } from './language.service';
import { TranslateService } from '@ngx-translate/core';
export interface ToastMessage {
  id: number;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

@Injectable({
  providedIn: 'root',
})


export class ToastService {
  private toasts = signal<ToastMessage[]>([]);
  private counter = 0;

  public readonly toastsSignal = this.toasts.asReadonly();
  constructor(private _translateService:TranslateService) { }
  private show(message: string, type: ToastMessage['type']) {
    const id = this.counter++;
    const toast = { id, type, message };
    this.toasts.update(list => [...list, toast]);
    setTimeout(() => this.remove(id), 4000);
  }

  success(message: string) { this.show(this._translateService.instant(message), 'success'); }
  error(message: string) { this.show(this._translateService.instant(message), 'error'); }
  info(message: string) { this.show(this._translateService.instant(message), 'info'); }
  warning(message: string) { this.show(this._translateService.instant(message), 'warning'); }

  private remove(id: number) {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }
}
