import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

export interface DropdownOption {
  value: string;
  label: string;
}
@Component({
  selector: 'app-generic-drop-list',
  imports: [TranslatePipe],
  templateUrl: './generic-drop-list.html',
  styleUrl: './generic-drop-list.css',
})
export class GenericDropList {
  @Input() options: DropdownOption[] = [];
  @Input() selectedValue: string | null = null;
  @Output() selectionChange = new EventEmitter<string>();

  isOpen = false;

  constructor(private _translate: TranslateService) {}

  toggle(): void {
    this.isOpen = !this.isOpen;
  }

  selectOption(option: DropdownOption): void {
    if (this.selectedValue !== option.value) {
      this.selectionChange.emit(option.value);
    }
    this.isOpen = false;
  }

  getSelectedLabel(): string {
    const found = this.options.find(opt => opt.value === this.selectedValue);
    return found ? this._translate.instant(found.label) : 'اختر';
  }

  @HostListener('document:click')
onDocumentClick(): void {
  this.isOpen = false;
}
}
