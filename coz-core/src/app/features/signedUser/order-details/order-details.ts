import { Component, signal } from '@angular/core';
import { Order } from '../../../core/interfaces/order.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderesService } from '../../../core/services/orderes.service';
import { ToastService } from '../../../core/services/toast.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-order-details',
  imports: [TranslatePipe],
  templateUrl: './order-details.html',
  styleUrl: './order-details.css',
})
export class OrderDetails {
  order = signal<Order | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(
    private _route: ActivatedRoute,
    private _orderService: OrderesService,
    private _toast: ToastService,
    private _router: Router,
    private _translate :TranslateService
  ) {}

  ngOnInit() {
    const orderId = this._route.snapshot.paramMap.get('id');
    if (!orderId) {
      this.error.set('Invalid order ID');
      this.loading.set(false);
      return;
    }
    this.loadOrder(orderId);
  }

  loadOrder(orderId: string) {
    this.loading.set(true);
    this._orderService.getOrderById(orderId).subscribe({
      next: (res) => {
        this.order.set(res.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || this._translate.instant('admin.error.FTL'));
        this.loading.set(false);
        this._toast.error(this.error()!);
      }
    });
  }


  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString();
  }

  goBack() {
    this._router.navigate(['/user/orders']);
}
}
