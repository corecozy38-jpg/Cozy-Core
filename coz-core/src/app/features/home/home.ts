import { Component, ElementRef, signal, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';
import { ProductService } from '../../core/services/product.service';
import { CommonModule } from '@angular/common';
import { AdaptedProduct, FeaturedReview, Image, Product, Review } from '../../core/interfaces/product.interface';
import { Faq } from '../../core/interfaces/admin.interface';
import { SiteSettingsService } from '../../core/services/site-settings.service';
import { ReviewsService } from '../../core/services/reviews.service';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

interface FaqItem extends Faq {
  isOpen: boolean;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [TranslatePipe, RouterModule, CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit, OnDestroy {
  Math = Math;
  @ViewChild('productSlider') productSlider!: ElementRef<HTMLDivElement>;
  @ViewChild('testimonialSlider') testimonialSlider!: ElementRef<HTMLDivElement>;

  products = signal<AdaptedProduct[]>([]);
  faqItems = signal<FaqItem[]>([]);
  banner = signal<Image | null>(null);
  testimonials = signal<FeaturedReview[]>([]);

  isLoadingBanner = signal(true);
  isLoadingProducts = signal(true);
  isLoadingTestimonials = signal(true);
  isLoadingFaq = signal(true);
  error = false;

  selectedColorIndexMap = new Map<string, number>();
  currentIndex = 0;
  intervalId: any;
  currentLang: string = 'en';

  private destroy$ = new Subject<void>();

  constructor(
    private _productService: ProductService,
    public _langService: LanguageService,
    private _siteSettingService: SiteSettingsService,
    private _reviewsService: ReviewsService,
    private _route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.currentLang = this._langService.getCurrentLang();
    this._langService.currentLang$
      .pipe(takeUntil(this.destroy$))
      .subscribe(lang => {
        this.currentLang = lang;
      });

    this._route.fragment
      .pipe(
        filter(fragment => fragment === 'faq'),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.scrollToFaq();
      });

    this.loadBanner();
    this.loadTopProducts();
    this.loadActiveFaqs();
    this.loadFeaturedReviews();
    this.startAutoPlay();
  }

  private scrollToFaq() {
    const element = document.getElementById('faq');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  loadBanner() {
    this.isLoadingBanner.set(true);
    this._siteSettingService.getBanner().subscribe({
      next: (res) => {
        this.banner.set(res.data);
        this.isLoadingBanner.set(false);
      },
      error: (err) => {
        this.isLoadingBanner.set(false);
      }
    });
  }

  loadTopProducts() {
    this.isLoadingProducts.set(true);
    this._productService.getTopProducts(10).subscribe({
      next: (res) => {
        if (res && res.data) {
          const adaptedProducts = res.data.map((prod: Product) => this.adaptProduct(prod));
          this.products.set(adaptedProducts);
          adaptedProducts.forEach(product => {
            if (!this.selectedColorIndexMap.has(product.id)) {
              this.selectedColorIndexMap.set(product.id, 0);
            }
          });
        }
        this.isLoadingProducts.set(false);
      },
      error: (err) => {
        this.error = true;
        this.isLoadingProducts.set(false);
      }
    });
  }

  loadActiveFaqs() {
    this.isLoadingFaq.set(true);
    this._siteSettingService.getActiveFaqs().subscribe({
      next: (res) => {
        if (res && res.data) {
          const faqItemsData = res.data.map((faq: Faq) => ({
            ...faq,
            isOpen: false
          }));
          this.faqItems.set(faqItemsData);
        }
        this.isLoadingFaq.set(false);
      },
      error: (err) => {
        this.error = true;
        this.isLoadingFaq.set(false);
      }
    });
  }

  loadFeaturedReviews() {
    this.isLoadingTestimonials.set(true);
    this._reviewsService.getFeaturedReviews().subscribe({
      next: (res) => {
        if (res && res.data) {
          const featuredReviews = res.data.map((Freview: FeaturedReview) => ({
            ...Freview,
          }));
          this.testimonials.set(featuredReviews);
        }
        this.isLoadingTestimonials.set(false);
      },
      error: (err) => {
        this.error = true;
        this.isLoadingTestimonials.set(false);
      }
    });
  }

  private adaptProduct(prod: Product): any {
    let discountPercent = 0;
    if (prod.compareAtPrice && prod.compareAtPrice > prod.price) {
      discountPercent = Math.round(((prod.compareAtPrice - prod.price) / prod.compareAtPrice) * 100);
    }
    const isNew = (Date.now() - new Date(prod.createdAt).getTime()) < 30 * 24 * 60 * 60 * 1000;

    const colors = prod.variants.map(variant => ({
      name: variant.colorName,
      code: variant.colorCode || '#cccccc',
      image: variant.images?.[0]?.url || '',
      hoverImage: variant.images?.[1]?.url || variant.images?.[0]?.url || ''
    }));

    return {
      id: prod._id,
      name: prod.name,
      slug: prod.slug,
      price: prod.price,
      oldPrice: prod.compareAtPrice,
      rating: prod.rating || 0,
      reviewsCount: prod.reviewsCount || 0,
      isNew: isNew,
      discountPercent: discountPercent,
      colors: colors
    };
  }

  getSelectedColor(product: any) {
    const index = this.selectedColorIndexMap.get(product.id) ?? 0;
    return product.colors[index];
  }

  selectColor(product: any, colorIndex: number) {
    this.selectedColorIndexMap.set(product.id, colorIndex);
    this.products.set([...this.products()]);
  }

  scrollLeft() {
    this.productSlider?.nativeElement.scrollBy({ left: -300, behavior: 'smooth' });
  }

  scrollRight() {
    this.productSlider?.nativeElement.scrollBy({ left: 300, behavior: 'smooth' });
  }

  scrollTestimonialLeft() {
    this.testimonialSlider?.nativeElement.scrollBy({ left: -320, behavior: 'smooth' });
  }

  scrollTestimonialRight() {
    this.testimonialSlider?.nativeElement.scrollBy({ left: 320, behavior: 'smooth' });
  }

  startAutoPlay() {
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  stopAutoPlay() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.testimonials().length;
  }

  prevSlide() {
    this.currentIndex = (this.currentIndex - 1 + this.testimonials().length) % this.testimonials().length;
  }

  goToSlide(index: number) {
    this.currentIndex = index;
    this.stopAutoPlay();
    this.startAutoPlay();
  }

  toggleFaq(index: number) {
    this.faqItems.update(items => {
      const updated = [...items];
      updated[index].isOpen = !updated[index].isOpen;
      return updated;
    });
  }

  ngOnDestroy() {
    this.stopAutoPlay();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
