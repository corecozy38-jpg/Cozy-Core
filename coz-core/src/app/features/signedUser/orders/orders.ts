import { Component, signal } from '@angular/core';
import { Order } from '../../../core/interfaces/order.interface';
import { OrderesService } from '../../../core/services/orderes.service';
import { ToastService } from '../../../core/services/toast.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-orders',
  imports: [TranslatePipe,RouterModule],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders {
      orders = signal<Order[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  totalPages = 1;
  currentPage = 1;
  limit = 10;

  constructor(
    private _orderService: OrderesService,
    private _toast: ToastService,
    private _translate :TranslateService
  ) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading.set(true);
    this._orderService.getMyOrders(this.currentPage, this.limit).subscribe({
      next: (res) => {
        if (res.success) {
          this.orders.set(res.data);
          this.totalPages = res.pagination.totalPages;
        } else {
          this.orders.set([]);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || this._translate.instant('admin.orders.error'));
        this.loading.set(false);
        this._toast.error(this.error()!);
      }
    });
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadOrders();
  }


  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString();
  }
}
