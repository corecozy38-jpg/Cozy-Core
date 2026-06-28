import { Component, ElementRef, signal, ViewChild, viewChild, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ProductService } from '../../core/services/product.service';
import { LanguageService } from '../../core/services/language.service';
import { Product } from '../../core/interfaces/product.interface';
import { Filter } from '../../shared/components/filter/filter';
import { Subscription } from 'rxjs';
import { DropdownOption, GenericDropList } from '../../shared/components/generic-drop-list/generic-drop-list';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslatePipe, Filter,GenericDropList],
  templateUrl: './products.html',
  styleUrls: ['./products.css']
})
export class Products implements OnInit {
  products = signal<Product[]>([]);
  loading = false;
  error = false;
  totalProducts = 0;
  currentPage = 1;
  pageSize = 12;
  totalPages = 1;
  mobileFiltersOpen = false;

  filterParams: any = {};
  sortOption = 'newest';
  searchQuery = '';
  hideCollectionFilter = false;
  currentLang: string = 'en';
  isSortDropdownOpen = false;
  private querySub!: Subscription;
  @ViewChild(Filter) filter!: Filter;
  readonly productsContainer = viewChild<ElementRef>('productsContainer');
  selectedSort: string = 'newest';
  sortOptions: DropdownOption[] = [
  { value: 'newest', label: 'products.sort_newest' },
  { value: 'price_asc', label: 'products.sort_price_low_high' },
  { value: 'price_desc', label: 'products.sort_price_high_low' },
  { value: 'rating', label: 'products.sort_rating' }
];
  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router,
    public langService: LanguageService
  ) { }

  ngOnInit() {
    this.querySub = this.route.queryParamMap.subscribe(params => {
      const searchWord = params.get('q');
      if (searchWord) {
        this.loadProducts(searchWord);
      }
    });
    this.currentLang = this.langService.getCurrentLang();
    this.langService.currentLang$.subscribe(lang => {
      this.currentLang = lang;
    });

    this.route.params.subscribe(params => {
      const collectionName = params['collectionName'];
      if (collectionName) {
        this.filterParams.collections = [collectionName.toUpperCase()];
        this.hideCollectionFilter = true;
      } else {
        this.filterParams.collections = [];
        this.hideCollectionFilter = false;
      }
      this.currentPage = 1;
      this.loadProducts();
    });

    this.route.queryParams.subscribe(queryParams => {
      this.searchQuery = queryParams['q'] || '';
      this.currentPage = 1;
      this.loadProducts();
    });
  }

  loadProducts(searchQ: string = '') {
    this.error = false;
    this.loading = true;

    const params: any = {
    page: this.currentPage,
    limit: this.pageSize,
    sort: this.sortOption,
    search: this.searchQuery || searchQ || ''
  };

    if (this.filterParams.collections?.length)
          params.collection = this.filterParams.collections.join(',');
    if (this.filterParams.availability?.length)
            params.availability = this.filterParams.availability.join(',');
    if (this.filterParams.productTypes?.length)
      params.productType = this.filterParams.productTypes.join(',');
    if (this.filterParams.colors?.length)
      params.colors = this.filterParams.colors.join(',');
    if (this.filterParams.sizes?.length)
      params.sizes = this.filterParams.sizes.join(',');
    if (this.filterParams.minPrice)
      params.minPrice = this.filterParams.minPrice;
    if (this.filterParams.maxPrice)
      params.maxPrice = this.filterParams.maxPrice;

    this.productService.getProducts(params).subscribe({
      next: (res) => {
        this.products.set(res.data);
        this.totalProducts = res.pagination.totalProducts;
        this.totalPages = res.pagination.totalPages;
        this.loading = false;
      },
      error: (err) => {
        this.error = true;
        this.loading = false;
      }
    });
  }

  onFiltersChange(filters: any) {
    this.filterParams = filters;
    this.currentPage = 1;
    this.loadProducts();
  }

  getProductImage(product: any): string {
  return product.variants?.[0]?.images?.[0]?.url || '';
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadProducts();
      this.productsContainer()?.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  openMobileFilters() {
    this.mobileFiltersOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeMobileFilters() {
    this.mobileFiltersOpen = false;
    document.body.style.overflow = '';
  }

  retryLoad() {
    this.loadProducts();
  }

  clearFiltersAndReload() {
    if (this.filter) {
      this.filter.clearFilters();
    } else {
      this.filterParams = {};
      this.currentPage = 1;
      this.loadProducts();
    }
  }
  onSortChange(value: string): void {
  this.sortOption = value;
  this.selectedSort = value;
  this.currentPage = 1;
  this.loadProducts();
}

}
