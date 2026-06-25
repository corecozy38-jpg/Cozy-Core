import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { Component, signal, computed } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';
import { AdminService } from '../../../core/services/admin.service';
import { FeaturedReview, Review } from '../../../core/interfaces/product.interface';
import { ReviewsService } from '../../../core/services/reviews.service';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
@Component({
  selector: 'app-reviews',
  imports: [TranslatePipe, RouterModule, CommonModule, FontAwesomeModule],
  templateUrl: './reviews.html',
  styleUrl: './reviews.css',
})
export class Reviews {
  faStar = faStar;
  reviews = signal<Review[]>([]);
  loading = signal(true);
  statusFilter = signal('all');
  featuredReviews = signal<FeaturedReview[]>([]);

  featuredMap = computed(() => {
    const map = new Map<string, string>();
    this.featuredReviews().forEach(item => {
      if (item.reviewId) {
        map.set(item.reviewId, item._id);
      }
    });
    return map;
  });

  constructor(
    private _toast: ToastService,
    private _confirmDialog: ConfirmDialogService,
    private _translate: TranslateService,
    private _adminService: AdminService,
    private _reviewsService: ReviewsService
  ) { }

  ngOnInit() {
    this.loadReviews();
    this.loadFeaturedReviews();
  }

  loadReviews() {
  this.loading.set(true);
  const isFeatured = this.statusFilter() === 'featured';
  const status = isFeatured ? 'all' : this.statusFilter();
  this._adminService.getAllReviews(status, isFeatured).subscribe({
    next: (res) => {
      this.reviews.set(res.data);
      this.loading.set(false);
    },
    error: () => this.loading.set(false)
  });
}

  loadFeaturedReviews() {
    this._reviewsService.getFeaturedReviews().subscribe({
      next: (res) => {
        this.featuredReviews.set(res.data);
      },
      error: (err) => {}
    });
  }
  filterByStatus(status: string) {
    if (this.statusFilter() === status) return;
    this.statusFilter.set(status);
    this.loadReviews();
  }

  updateStatus(reviewId: string, status: 'approved' | 'rejected') {
    this._adminService.updateReviewStatus(reviewId, status).subscribe({
      next: () => {
        this._toast.success('Review status updated');
        this.loadReviews();
      },
      error: () => this._toast.error('Update failed')
    });
  }

  toggleFeatured(review: Review) {
    const isFeatured = this.featuredMap().has(review._id);
    const featuredId = this.featuredMap().get(review._id);

    if (isFeatured && featuredId) {
      this._adminService.removeFeaturedReview(featuredId).subscribe({
        next: () => {
          this._toast.success('Review removed from featured');
          this.loadFeaturedReviews();
          this.loadReviews();
        },
        error: () => this._toast.error('Failed to remove from featured')
      });
    } else {
      this._adminService.addFeaturedReview(review._id).subscribe({
        next: () => {
          this._toast.success('Review added to featured');
          this.loadFeaturedReviews();
          this.loadReviews();
        },
        error: () => this._toast.error('Failed to add to featured')
      });
    }
  }


  async deleteReview(reviewId: string) {
    const confirmed = await this._confirmDialog.open({
      title: this._translate.instant('common.confirm'),
      message: this._translate.instant('admin.reviews.delete_confirmation'),
      confirmText: this._translate.instant('common.delete'),
      cancelText: this._translate.instant('common.cancel')
    });
    if (!confirmed) return;
    this._adminService.deleteReview(reviewId).subscribe({
      next: () => {
        this._toast.success('Review deleted');
        this.loadReviews();
        this.loadFeaturedReviews();
      },
      error: () => this._toast.error('Delete failed')
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
