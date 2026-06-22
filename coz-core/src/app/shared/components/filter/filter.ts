import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './filter.html',
  styleUrls: ['./filter.css']
})
export class Filter{
  @Input() hideCollectionFilter = false;
  @Output() filtersChange = new EventEmitter<any>();

  selectedCollections: string[] = [];
  selectedAvailability: string[] = [];
  selectedProductTypes: string[] = [];
  selectedColors: string[] = [];
  selectedSizes: string[] = [];
  minPrice: number | null = null;
  maxPrice: number | null = null;

  filterOptions = {
    collections: ['SUMMER', 'WINTER'],
    availability: ['in_stock', 'out_of_stock'],
    productTypes: ['T-SHIRTS', 'SWEATPANTS', 'COMPRESSIONS', 'JERSEY', 'SHORTS', 'TANK TOPS'],
    colors: ['GREEN CAMO', 'BLACK CAMO', 'BURGUNDY', 'BLACK', 'NAVY', 'CHARCOAL', 'WHITE', 'HEATHER GREY'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  };

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

  public clearFilters() {
    this.selectedCollections = [];
    this.selectedAvailability = [];
    this.selectedProductTypes = [];
    this.selectedColors = [];
    this.selectedSizes = [];
    this.minPrice = null;
    this.maxPrice = null;
    this.emitFilters();
  }
}
