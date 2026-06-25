import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { SiteSettingsService } from '../../../core/services/site-settings.service';
import { LanguageService } from '../../../core/services/language.service';
import { AttributeItem, ColorItem } from '../../../core/interfaces/settings';

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './filter.html',
  styleUrls: ['./filter.css']
})
export class Filter implements OnInit {
  @Input() hideCollectionFilter = false;
  @Output() filtersChange = new EventEmitter<any>();

  selectedCollections: string[] = [];
  selectedAvailability: string[] = [];
  selectedProductTypes: string[] = [];
  selectedColors: string[] = [];
  selectedSizes: string[] = [];
  minPrice: number | null = null;
  maxPrice: number | null = null;

  productTypes: AttributeItem[] = [];
  collectionTypes: AttributeItem[] = [];
  colors: ColorItem[] = [];
  sizes: string[] = [];

  availabilityOptions = ['in_stock', 'out_of_stock'];

  loading = true;
  currentLang = 'en';

  constructor(
    private _siteSettingsService: SiteSettingsService,
    private _languageService: LanguageService,
    private _translate: TranslateService
  ) {}

  ngOnInit() {
    this.currentLang = this._languageService.getCurrentLang();
    this._languageService.currentLang$.subscribe(lang => {
      this.currentLang = lang;
    });

    this.loadAttributes();
  }

  loadAttributes() {
    this.loading = true;
    this._siteSettingsService.getAttributes().subscribe({
      next: (res) => {
        if (res.success !== false) {
          const data = res.data;
          this.productTypes = data.productTypes || [];
          this.collectionTypes = data.collectionTypes || [];
          this.colors = data.colors || [];
          this.sizes = data.sizes || [];
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.productTypes = [];
        this.collectionTypes = [];
        this.colors = [];
        this.sizes = [];
      }
    });
  }

  getTranslatedName(item: AttributeItem | ColorItem): string {
    if (!item) return '';
    return this.currentLang === 'ar' ? item.name_ar || item.name : item.name;
  }

  emitFilters() {
    this.filtersChange.emit({
      collections: this.selectedCollections,
      availability: this.selectedAvailability,
      productTypes: this.selectedProductTypes,
      colors: this.selectedColors,
      sizes: this.selectedSizes,
      minPrice: this.minPrice,
      maxPrice: this.maxPrice
    });
  }

  toggleSelection(array: string[], value: string) {
    const index = array.indexOf(value);
    if (index === -1) array.push(value);
    else array.splice(index, 1);
    this.emitFilters();
  }

  isSelected(array: string[], value: string): boolean {
    return array.includes(value);
  }

  clearFilters() {
    this.selectedCollections = [];
    this.selectedAvailability = [];
    this.selectedProductTypes = [];
    this.selectedColors = [];
    this.selectedSizes = [];
    this.minPrice = null;
    this.maxPrice = null;
    this.emitFilters();
  }

  trackByIndex(index: number): number {
    return index;
  }
}
