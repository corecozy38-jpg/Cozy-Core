import { Component, computed, HostListener, OnInit, signal } from '@angular/core';
import { ProductService } from '../../../core/services/product.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Product } from '../../../core/interfaces/product.interface';
import { AdminService } from '../../../core/services/admin.service';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-products',
  imports: [TranslatePipe, RouterModule, FormsModule],
  templateUrl: './admin-products.html',
  styleUrl: './admin-products.css',
})
export class adminProducts implements OnInit {
  products = signal<Product[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  Math = Math;
  totalPages = 1;
  currentPage = 1;
  limit = 10;
  totalProducts = 0;

  searchQuery = '';
  searchDebounce: any;
  currentLang: string = 'en';

  constructor(
    private _productService: ProductService,
    private _toast: ToastService,
    private _confirmDialog: ConfirmDialogService,
    private _translate: TranslateService,
    private _adminService: AdminService,
    private _translateService:LanguageService,
    private langService :LanguageService
  ) {
  }

  filterOptions = computed(()=>
  [
      { value: 'all', label: this._translateService.t('admin.products.filter_all') },
      { value: 'in_stock', label: this._translateService.t('admin.products.filter_in_stock') },
      { value: 'low_stock', label: this._translateService.t('admin.products.filter_low_stock') },
      {
        value: 'out_of_stock',
        label: this._translateService.t('admin.products.filter_out_of_stock'),
      },
    ]
  );

  ngOnInit() {
    this.currentLang = this.langService.getCurrentLang();
    this.langService.currentLang$.subscribe(lang => {
      this.currentLang = lang;
    });
    this.loadProducts();

  }

  stockFilter = 'all';

  loadProducts() {
    this.loading.set(true);
    const params: any = {
      page: this.currentPage,
      limit: this.limit,
      search: this.searchQuery.trim() || undefined,
    };

    if (this.stockFilter !== 'all') {
      params.availability = [this.stockFilter];
    }

    this._productService
      .getProducts(params)
      .subscribe({
        next: (res) => {
          this.products.set(res.data);
          this.totalPages = res.pagination.totalPages;
          this.totalProducts = res.pagination.totalProducts;
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Failed to load products');
          this.loading.set(false);
        },
      });
  }

  onSearchInput() {
    if (this.searchDebounce) clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => {
      this.currentPage = 1;
      this.loadProducts();
    }, 400);
  }

  clearSearch() {
    this.searchQuery = '';
    this.currentPage = 1;
    this.loadProducts();
  }

  setStockFilter(filter: string) {
    this.stockFilter = filter;
    this.currentPage = 1;
    this.loadProducts();
  }

  async deleteProduct(slug: string) {
  const confirmed = await this._confirmDialog.open({
    title: this._translate.instant('common.confirm'),
    message: this._translate.instant('admin.products.delete_confirmation'),
    confirmText: this._translate.instant('common.delete'),
    cancelText: this._translate.instant('common.cancel'),
  });
  if (!confirmed) return;

  const deletedProduct = this.products().find(p => p.slug === slug);

  this.products.update(products => products.filter(p => p.slug !== slug));
  this.totalProducts--;

  this._adminService.deleteProduct(slug).subscribe({
    next: () => {
      this._toast.success(this._translate.instant('admin.products.delete_success'));
    },
    error: (err) => {
      if (deletedProduct) {
        this.products.update(products => [...products, deletedProduct]);
        this.totalProducts++;
      }
      this._toast.error(err.error?.message || this._translate.instant('admin.products.delete_failed'));
    },
  });
}

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadProducts();
  }

  getTotalStock(product: any): number {
    return (
      product.variants?.reduce((sum: number, v: any) => {
        return sum + (v.sizes?.reduce((s: number, size: any) => s + (size.stock || 0), 0) || 0);
      }, 0) || 0
    );
  }

  getStockStatus(product: any): { label: string; class: string } {
    const stock = this.getTotalStock(product);
    if (stock === 0)
      return { label: 'admin.products.out_of_stock', class: 'bg-red-100 text-red-700' };
    if (stock <= 5)
      return { label: 'admin.products.low_stock', class: 'bg-yellow-100 text-yellow-700' };
    return { label: 'admin.products.in_stock', class: 'bg-green-100 text-green-700' };
  }

}
