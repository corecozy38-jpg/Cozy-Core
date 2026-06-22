import { ChangeDetectorRef, Component, HostListener, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Observable, firstValueFrom } from 'rxjs';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';
import {
  Product,
  Variant,
  Image,
  Size,
  AdminProductRequest
} from '../../../core/interfaces/product.interface';
import { AdminProductResponse } from '../../../core/interfaces/admin.interface';
import { ProductService } from '../../../core/services/product.service';
import { Products } from '../../products/products';

type SizeFormData = Omit<Size, 'sku'> & { sku?: string };

type ProductFormData = Omit<Product, '_id' | 'slug' | 'rating' | 'reviewsCount' | 'createdAt'> & {
  variants: Variant[];
};

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslatePipe],
  templateUrl: './product-form.html',
  styleUrls: ['./product-form.css']
})
export class ProductFormComponent implements OnInit {
  product: ProductFormData = {
    name: '',
    productType: 'T-SHIRTS',
    collection: 'SUMMER',
    features: [],
    price: 0,
    compareAtPrice: null,
    sizeFit: { fitType: '', modelHeight: null, wearingSize: '' },
    sizeGuid: { description: '', image: null },
    variants: []
  };

  isEditMode = false;
  productSlug: string | null = null;
  loading = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);

  productTypes = ['T-SHIRTS', 'JERSEY', 'SWEATPANTS', 'SHORTS', 'TANK TOPS', 'COMPRESSIONS'];
  collections = ['SUMMER', 'WINTER'];
  sizesOptions = ['S', 'M', 'L', 'XL', 'XXL'];

  newFeature = '';
  isUploading = false;
  uploadingSizeGuide = false;


  errors: { [key: string]: string | null } = {
    name: null,
    productType: null,
    collection: null,
    price: null,
    features: null,
    fitType: null,
    variants: null,
  };

  constructor(
    private _adminService: AdminService,
    private _route: ActivatedRoute,
    public _router: Router,
    private _toast: ToastService,
    private _productService: ProductService,
    private _translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this._route.params.subscribe(params => {
      const slug = params['slug'];
      if (slug) {
        this.isEditMode = true;
        this.productSlug = slug;
        this.loadProduct(slug);
      }
    });
  }

  loadProduct(slug: string): void {
    this.loading.set(true);
    this._productService.getProductBySlug(slug).subscribe({
      next: (res: AdminProductResponse) => {
        const data = res.data;
        this.product = {
          name: data.name,
          productType: data.productType,
          collection: data.collection,
          features: data.features || [],
          price: data.price,
          compareAtPrice: data.compareAtPrice ?? null,
          sizeFit: data.sizeFit || { fitType: '', modelHeight: null, wearingSize: '' },
          sizeGuid: data.sizeGuid || { description: '', image: null },
          variants: data.variants?.map(v => ({
            colorName: v.colorName,
            colorCode: v.colorCode ?? '#000000',
            images: v.images || [],
            sizes: v.sizes.map(s => ({
              size: s.size,
              stock: s.stock,
              sku: s.sku || ''
            }))
          })) || []
        };
        this.loading.set(false);
      this.errors['features'] = this.product.features.length > 0 ? null : this._translate.instant('admin.products.errors.features_required');
      this.loading.set(false);
      this.cdr.detectChanges();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load product');
        this.loading.set(false);
      }
    });
  }

  addFeature(): void {
  const trimmed = this.newFeature.trim();
  if (trimmed) {
    this.product.features.push(trimmed);
    this.newFeature = '';
    this.errors['features'] = null;
    if (this.error() === this._translate.instant('admin.products.errors.form_invalid')) {
      this.error.set(null);
    }
    this.cdr.detectChanges();
  }
}

removeFeature(index: number): void {
  this.product.features.splice(index, 1);
  this.errors['features'] = this.product.features.length > 0 ? null : this._translate.instant('admin.products.errors.features_required');
  if (this.product.features.length > 0 && this.error() === this._translate.instant('admin.products.errors.form_invalid')) {
    this.error.set(null);
  }
  this.cdr.detectChanges();
}

  addVariant(): void {
    this.product.variants.push({
      colorName: '',
      colorCode: '#000000',
      images: [],
      sizes: []
    });
  }

  removeVariant(index: number): void {
    this.product.variants.splice(index, 1);
  }

  uploadVariantImage(variantIndex: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files || files.length === 0) return;

    const currentImages = this.product.variants[variantIndex].images;
    const remainingSlots = 20 - currentImages.length;
    if (remainingSlots <= 0) {
      this._toast.error('Maximum 20 images allowed per color');
      input.value = '';
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    this._uploadMultipleVariantImages(variantIndex, filesToUpload);
  }

  private async _uploadMultipleVariantImages(variantIndex: number, files: File[]): Promise<void> {
    this.isUploading = true;

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        const result = await firstValueFrom(this._adminService.uploadImage(formData));
        return {
          url: result?.data.url || '',
          publicId: result?.data.publicId ?? null
        } as Image;
      });

      const uploadedImages = await Promise.all(uploadPromises);

      this.product.variants[variantIndex].images.push(...uploadedImages);
      this.isUploading = false;

      if (uploadedImages.length > 0) {
        this._toast.success(`${uploadedImages.length} image(s) uploaded successfully`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      this._toast.error('Failed to upload images');
      this.isUploading = false;
    } finally {
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (input) input.value = '';
    }
  }
  removeVariantImage(variantIndex: number, imageIndex: number): void {
    this.product.variants[variantIndex].images.splice(imageIndex, 1);
  }

  addSize(variantIndex: number): void {
    this.product.variants[variantIndex].sizes.push({
      size: '',
      stock: 0,
      sku: ''
    });
  }

  removeSize(variantIndex: number, sizeIndex: number): void {
    this.product.variants[variantIndex].sizes.splice(sizeIndex, 1);
  }


  validateField(field: string): void {
    switch (field) {
      case 'name':
        this.errors['name'] = this.product.name.trim() ? null : this._translate.instant('admin.products.errors.name_required');
        break;
      case 'productType':
        this.errors['productType'] = this.product.productType ? null : this._translate.instant('admin.products.errors.product_type_required');
        break;
      case 'collection':
        this.errors['collection'] = this.product.collection ? null : this._translate.instant('admin.products.errors.collection_required');
        break;
      case 'price':
        this.errors['price'] = (this.product.price && this.product.price > 0) ? null : this._translate.instant('admin.products.errors.price_positive');
        break;
      case 'features':
        this.errors['features'] = this.product.features.length > 0 ? null : this._translate.instant('admin.products.errors.features_required');
        break;
      case 'fitType':
        this.errors['fitType'] = this.product.sizeFit.fitType.trim() ? null : this._translate.instant('admin.products.errors.fit_type_required');
        break;
      case 'variants':
        this.errors['variants'] = this.product.variants.length > 0 ? null : this._translate.instant('admin.products.errors.variants_required');
        break;
    }
  }

  validateAll(): boolean {
    this.validateField('name');
    this.validateField('productType');
    this.validateField('collection');
    this.validateField('price');
    this.validateField('features');
    this.validateField('fitType');
    this.validateField('variants');
    return Object.values(this.errors).every(e => e === null);
  }



  async uploadSizeGuideImage(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.uploadingSizeGuide = true;
    try {
      const formData = new FormData();
      formData.append('image', file);
      const result = await firstValueFrom(this._adminService.uploadImage(formData));
      const image: Image = {
        url: result?.data.url || '',
        publicId: result?.data.publicId ?? null
      };
      if (!this.product.sizeGuid) {
        this.product.sizeGuid = { description: '', image: null };
      }
      this.product.sizeGuid.image = image;
      this.uploadingSizeGuide = false;
    } catch {
      this._toast.error('Failed to upload size guide image');
      this.uploadingSizeGuide = false;
    }
  }
  saveProduct(): void {
    if (!this.validateAll()) {
      this.error.set(this._translate.instant('admin.products.errors.form_invalid'));
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const payload: AdminProductRequest = {
      name: this.product.name,
      productType: this.product.productType,
      collection: this.product.collection,
      features: this.product.features,
      price: this.product.price,
      compareAtPrice: this.product.compareAtPrice,
      sizeFit: this.product.sizeFit,
      sizeGuid: this.product.sizeGuid,
      variants: this.product.variants.map(v => ({
        colorName: v.colorName,
        colorCode: v.colorCode ?? null,
        images: v.images,
        sizes: v.sizes.map(s => ({
          size: s.size,
          stock: s.stock,
          sku: s.sku || undefined
        }))
      }))
    };

    const request: Observable<AdminProductRequest> = this.isEditMode
      ? this._adminService.updateProduct(this.productSlug!, payload)
      : this._adminService.createProduct(payload);

    request.subscribe({
      next: () => {
        this._toast.success(this.isEditMode ? 'Product updated' : 'Product created');
        this._router.navigate(['/admin/products']);
        this.saving.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to save product');
        this.saving.set(false);
      }
    });
  }

  getVariantTotalStock(variant: Variant): number {
    return variant.sizes.reduce((sum, s) => sum + (s.stock || 0), 0);
  }

  getVariantStockStatus(variant: Variant): string {
    const total = this.getVariantTotalStock(variant);
    if (total === 0) return 'Out of Stock';
    if (total < 5) return 'Low Stock';
    return 'In Stock';
  }


  //  DROP LISTS SELECTOR
  productTypeDropdownOpen = false;
  selectedProductType = '';

  toggleProductTypeDropdown() {
    this.productTypeDropdownOpen = !this.productTypeDropdownOpen;
  }

  selectProductType(type: string) {
    this.product.productType = type;
    this.productTypeDropdownOpen = false;
  }

  collectionDropdownOpen = false;
  selectedCollection = '';

  toggleCollectionDropdown() {
    this.collectionDropdownOpen = !this.collectionDropdownOpen;
  }

  selectCollection(col: string) {
    this.product.collection = col;
    this.collectionDropdownOpen = false;
  }

  sizeDropdownOpen: { [key: string]: boolean } = {};


  toggleSizeDropdown(variantIndex: number, sizeIndex: number): void {
    const key = `${variantIndex}-${sizeIndex}`;
    this.sizeDropdownOpen[key] = !this.sizeDropdownOpen[key];
  }

  selectSize(variantIndex: number, sizeIndex: number, value: string): void {
    this.product.variants[variantIndex].sizes[sizeIndex].size = value;
    const key = `${variantIndex}-${sizeIndex}`;
    this.sizeDropdownOpen[key] = false;
  }

  isSizeDropdownOpen(variantIndex: number, sizeIndex: number): boolean {
    const key = `${variantIndex}-${sizeIndex}`;
    return this.sizeDropdownOpen[key] || false;
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.product-type-dropdown')) {
      this.productTypeDropdownOpen = false;
    }
    if (!target.closest('.collection-dropdown')) {
      this.collectionDropdownOpen = false;
    }
  }

  // TO MAKE SURE SIZEGUIDE NOT NULL
  get sizeGuideDescription(): string {
    return this.product.sizeGuid?.description || '';
  }

  set sizeGuideDescription(value: string) {
    if (this.product.sizeGuid) {
      this.product.sizeGuid.description = value;
    } else {
      this.product.sizeGuid = { description: value, image: null };
    }
  }
}
