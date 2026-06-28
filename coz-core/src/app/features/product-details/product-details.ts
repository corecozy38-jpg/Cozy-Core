import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { RefreshTokenService } from '../../core/services/refresh-token.service';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { LanguageService } from '../../core/services/language.service';
import { ReviewsService } from '../../core/services/reviews.service';
import { AuthService } from '../../core/services/auth.service';
import {
  Product,
  ProductsResponse,
  CreateReviewPayload,
  Review,
  ReviewsResponse
} from '../../core/interfaces/product.interface';
import { CartItem, CartI } from '../../core/interfaces/cart.interface';
import { AdminService } from '../../core/services/admin.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe, FormsModule, NgOptimizedImage],
  templateUrl: './product-details.html',
  styleUrls: ['./product-details.css']
})
export class ProductDetails implements OnInit, OnDestroy {
  product: Product | null = null;
  loading: boolean = true;
  error: boolean = false;

  selectedColorIndex: number = 0;
  selectedSize: string = '';
  quantity: number = 1;
  galleryImages: string[] = [];
  currentImageIndex: number = 0;
  activeTab: 'features' | 'size' = 'features';
  relatedProducts: Product[] = [];
  maxQuantity: number = 0;
  isSizeGuideOpen: boolean = false;

  reviews: Review[] = [];
  reviewsLoading: boolean = false;
  reviewsPage: number = 1;
  reviewsLimit: number = 5;
  reviewsTotal: number = 0;
  reviewsTotalPages: number = 0;
  allReviewsLoaded: boolean = false;
  showAllReviews: boolean = false;

  reviewForm: {
    rating: number;
    content: string;
    guestName: string;
    guestEmail: string;
    images: { url: string; publicId: string }[];
  } = {
      rating: 0,
      content: '',
      guestName: '',
      guestEmail: '',
      images: []
    };
  reviewSubmitting: boolean = false;
  reviewSubmitError: string = '';
  reviewSubmitSuccess: boolean = false;
  isUploadingImages: boolean = false;
  maxReviewImages: number = 5;

  isLoggedIn: boolean = false;

  private cartItems: CartItem[] = [];
  currentLang: string = 'en';
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private toast: ToastService,
    private translate: TranslateService,
    private langService: LanguageService,
    private reviewsService: ReviewsService,
    private authService: AuthService,
    private refreshTokenService: RefreshTokenService,
    private adminService: AdminService
  ) { }

  ngOnInit(): void {
    this.currentLang = this.langService.getCurrentLang();
    this.langService.currentLang$
      .pipe(takeUntil(this.destroy$))
      .subscribe((lang: string) => {
        this.currentLang = lang;
      });

    const token = this.refreshTokenService.getAccessToken();
    this.isLoggedIn = !!token;

    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        const slug = params.get('slug');
        if (slug) {
          this.loadProduct(slug);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProduct(slug: string): void {
    this.loading = true;
    this.productService.getProductBySlug(slug).subscribe({
      next: (res: { data: Product }) => {
        this.product = res.data;
        if (this.product?.variants.length) {
          this.updateGalleryForColor(0);
          const firstVariant = this.product.variants[0];
          if (firstVariant.sizes.length) {
            this.selectedSize = firstVariant.sizes[0].size;
            this.refreshCartAndUpdateMaxQuantity();
          }
          this.loadRelatedProducts();
          this.loadReviews(1);
        }
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      }
    });
  }

  loadRelatedProducts(): void {
    if (!this.product) return;
    this.productService.getProducts({
      productType: this.product.productType,
      limit: 10
    }).subscribe({
      next: (res: ProductsResponse) => {
        this.relatedProducts = res.data.filter((p: Product) => p._id !== this.product!._id).slice(0, 6);
      },
      error: () => {
        this.relatedProducts = [];
      }
    });
  }

  updateGalleryForColor(index: number): void {
    this.selectedColorIndex = index;
    const variant = this.product?.variants[index];
    this.galleryImages = variant?.images?.map((img) => img.url) || [];
    this.currentImageIndex = 0;
  }

  setMainImage(img: string, idx: number): void {
    const index = this.galleryImages.findIndex((i) => i === img);
    if (index !== -1) {
      this.currentImageIndex = index;
    }
  }

  nextImage(): void {
    if (this.galleryImages.length > 1) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.galleryImages.length;
    }
  }

  prevImage(): void {
    if (this.galleryImages.length > 1) {
      this.currentImageIndex = (this.currentImageIndex - 1 + this.galleryImages.length) % this.galleryImages.length;
    }
  }

  selectColor(index: number): void {
    this.updateGalleryForColor(index);
    const variant = this.product?.variants[index];
    if (variant?.sizes.length) {
      const availableSize = variant.sizes.find((s) => s.stock > 0);
      if (availableSize) {
        this.selectedSize = availableSize.size;
        this.quantity = 1;
        this.refreshCartAndUpdateMaxQuantity();
      } else {
        this.selectedSize = variant.sizes[0]?.size || '';
        this.maxQuantity = 0;
        this.quantity = 1;
        this.toast.warning(this.translate.instant('products.color_out_of_stock'));
      }
    }
  }

  selectSize(size: string): void {
    this.selectedSize = size;
    this.quantity = 1;
    this.refreshCartAndUpdateMaxQuantity();
  }

  private refreshCartAndUpdateMaxQuantity(): void {
    this.updateMaxQuantity();
  }

  updateMaxQuantity(): void {
    const variant = this.product?.variants[this.selectedColorIndex];
    if (!variant) return;

    const sizeObj = variant.sizes.find((s) => s.size === this.selectedSize);
    const stock = sizeObj?.stock || 0;

    const existingCartItem = this.cartItems.find((item) => {
      return item.product._id === this.product?._id &&
        item.color.id === variant._id &&
        item.size === this.selectedSize;
    });

    const quantityInCart = existingCartItem ? existingCartItem.quantity : 0;
    this.maxQuantity = Math.max(0, stock - quantityInCart);

    if (this.quantity > this.maxQuantity) {
      this.quantity = this.maxQuantity > 0 ? this.maxQuantity : 1;
    }
  }

  get isSelectedSizeOutOfStock(): boolean {
    return this.maxQuantity === 0;
  }

  incrementQuantity(): void {
    if (this.quantity < this.maxQuantity) this.quantity++;
  }

  decrementQuantity(): void {
    if (this.quantity > 1) this.quantity--;
  }

  addToCart(): void {
    if (!this.product) return;
    if (this.isSelectedSizeOutOfStock) {
      this.toast.error(this.translate.instant('products.size_out_of_stock'));
      return;
    }
    const variantId = this.product.variants[this.selectedColorIndex]?._id;
    if (!variantId || !this.selectedSize) {
      this.toast.error(this.translate.instant('products.invalid_selection'));
      return;
    }

    this.cartService.addToCart(variantId, this.selectedSize, this.quantity).subscribe({
      next: (updatedCart: CartI) => {
        this.toast.success(this.translate.instant('products.added_to_cart'));
        this.cartItems = updatedCart.items || [];
        this.updateMaxQuantity();
      },
      error: () => {
        this.toast.error(this.translate.instant('products.add_to_cart_failed'));
      }
    });
  }

  toggleReviews(): void {
    this.showAllReviews = !this.showAllReviews;
  }

  setActiveTab(tab: 'features' | 'size'): void {
    this.activeTab = tab;
  }

  get currentPrice(): number {
    return this.product?.price || 0;
  }

  get oldPrice(): number | null | undefined {
    return this.product?.compareAtPrice;
  }

  get discountPercent(): number {
    if (this.oldPrice && this.oldPrice > this.currentPrice) {
      return Math.round(((this.oldPrice - this.currentPrice) / this.oldPrice) * 100);
    }
    return 0;
  }

  getProductImage(product: Product): string {
    return product.variants?.[0]?.images?.[0]?.url || '';
  }

  hasColorImages(index: number): boolean {
    const variant = this.product?.variants[index];
    return variant?.images ? variant.images.length > 0 : false;
  }

  loadReviews(page: number): void {
  if (!this.product) return;
  this.reviewsLoading = true;
  this.reviewsService.getProductReviews(this.product._id, page, this.reviewsLimit)
    .subscribe({
      next: (res: ReviewsResponse) => {
        this.reviews = res.data;
        this.reviewsPage = page;
        this.reviewsTotal = res.pagination.totalReviews;
        this.reviewsTotalPages = res.pagination.totalPages;
        this.allReviewsLoaded = page >= this.reviewsTotalPages;
        this.reviewsLoading = false;
      },
      error: () => {
        this.reviewsLoading = false;
        this.toast.error('Failed to load reviews');
      }
    });
}
  reviewImageIndices: { [reviewId: string]: number } = {};

  getReviewImageIndex(reviewId: string): number {
    return this.reviewImageIndices[reviewId] || 0;
  }

  nextReviewImage(reviewId: string, imagesCount: number): void {
    const current = this.reviewImageIndices[reviewId] || 0;
    this.reviewImageIndices[reviewId] = (current + 1) % imagesCount;
  }

  setReviewImageIndex(reviewId: string, index: number): void {
    this.reviewImageIndices[reviewId] = index;
  }

  prevReviewImage(reviewId: string, imagesCount: number): void {
    const current = this.reviewImageIndices[reviewId] || 0;
    this.reviewImageIndices[reviewId] = (current - 1 + imagesCount) % imagesCount;
  }

  loadMoreReviews(): void {
    if (!this.allReviewsLoaded && !this.reviewsLoading) {
      this.loadReviews(this.reviewsPage + 1);
    }
  }

  setRating(value: number): void {
    this.reviewForm.rating = value;
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const remaining = this.maxReviewImages - this.reviewForm.images.length;
    if (remaining <= 0) {
      this.toast.warning(this.translate.instant('product.max_images_reached'));
      input.value = '';
      return;
    }

    this.isUploadingImages = true;
    const file = input.files[0];
    const formData = new FormData();
    formData.append('image', file);

    this.adminService.uploadImage(formData).subscribe({
      next: (res: { data: { url: string; publicId: string } }) => {
        this.reviewForm.images.push(res.data);
        this.isUploadingImages = false;
        this.toast.success(this.translate.instant('product.image_uploaded'));
        input.value = '';
      },
      error: (err: HttpErrorResponse) => {
        this.isUploadingImages = false;
        this.toast.error(err.error?.message || 'Image upload failed');
        input.value = '';
      }
    });
  }

  removeReviewImage(index: number): void {
    this.reviewForm.images.splice(index, 1);
  }

  submitReview(): void {
    if (!this.product) return;

    if (!this.reviewForm.content || this.reviewForm.rating === 0) {
      this.reviewSubmitError = this.translate.instant('product.review_required_fields');
      return;
    }

    const payload: CreateReviewPayload = {
      content: this.reviewForm.content,
      rating: this.reviewForm.rating,
      images: this.reviewForm.images
    };

    if (!this.isLoggedIn) {
      if (!this.reviewForm.guestName || !this.reviewForm.guestEmail) {
        this.reviewSubmitError = this.translate.instant('product.guest_fields_required');
        return;
      }
      payload.guestName = this.reviewForm.guestName;
      payload.guestEmail = this.reviewForm.guestEmail;
    }

    this.reviewSubmitting = true;
    this.reviewSubmitError = '';
    this.reviewSubmitSuccess = false;

    this.reviewsService.createReview(this.product._id, payload).subscribe({
      next: () => {
        this.reviewSubmitting = false;
        this.reviewSubmitSuccess = true;
        this.toast.success(this.translate.instant('product.review_submitted'));
        this.reviewForm = { rating: 0, content: '', guestName: '', guestEmail: '', images: [] };
        this.loadReviews(1);
      },
      error: (err: HttpErrorResponse) => {
        this.reviewSubmitting = false;
        this.reviewSubmitError = err.error?.message || this.translate.instant('product.review_submit_failed');
        this.toast.error(this.reviewSubmitError);
      }
    });
  }

  relatedCurrentIndex: number = 0;

  nextRelated(): void {
    if (this.relatedCurrentIndex < this.relatedProducts.length - 3) {
      this.relatedCurrentIndex++;
    }
  }

  prevRelated(): void {
    if (this.relatedCurrentIndex > 0) {
      this.relatedCurrentIndex--;
    }
  }

  nextReviewPage(): void {
  if (this.reviewsPage < this.reviewsTotalPages) {
    this.loadReviews(this.reviewsPage + 1);
  }
}

prevReviewPage(): void {
  if (this.reviewsPage > 1) {
    this.loadReviews(this.reviewsPage - 1);
  }
}
}
