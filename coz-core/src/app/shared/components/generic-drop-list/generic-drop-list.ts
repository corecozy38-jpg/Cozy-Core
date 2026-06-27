import { Component, EventEmitter, HostListener, Input, Output, ChangeDetectorRef, ElementRef } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../core/services/language.service';

export interface DropdownOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-generic-drop-list',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './generic-drop-list.html',
  styleUrl: './generic-drop-list.css',
})
export class GenericDropList {
  @Input() options: DropdownOption[] = [];
  @Input() selectedValue: string | null = null;
  @Input() position: 'fixed' | 'absolute' = 'absolute';
  @Output() selectionChange = new EventEmitter<string>();

  isOpen = false;
  dropdownTop = '0px';
  dropdownLeft = '0px';
  dropdownWidth = '0px';


  constructor(private  _languageService: LanguageService, 
    private translate: TranslateService, 
    private cdr:ChangeDetectorRef, 
    private elementRef:ElementRef) { }

  toggle(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.isOpen) {
      this.isOpen = true;
      this.cdr.detectChanges();

      const button = event.currentTarget as HTMLElement;
      const rect = button.getBoundingClientRect();

      this.dropdownTop = rect.bottom + 4 + 'px';
      this.dropdownLeft = rect.left + 'px';
      this.dropdownWidth = rect.width + 'px';

      this.cdr.detectChanges();
    } else {
      this.isOpen = false;
    }
  }

  selectOption(option: DropdownOption): void {
    if (this.selectedValue !== option.value) {
      this.selectionChange.emit(option.value);
    }
    this.isOpen = false;
  }

  getSelectedLabel(): string {
    const found = this.options.find(opt => opt.value === this.selectedValue);
    return found ? this.translate.instant(found.label) : 
    this._languageService.getCurrentLang()==='ar'? 'اختر': "select";
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!this.elementRef.nativeElement.contains(target)) {
      this.isOpen = false;
    }
  }
}