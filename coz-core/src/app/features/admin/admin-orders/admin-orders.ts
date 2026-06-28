import { Component, signal } from '@angular/core';
import { OrderesService } from '../../../core/services/orderes.service';
import { ToastService } from '../../../core/services/toast.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Order } from '../../../core/interfaces/order.interface';
import { AdminService } from '../../../core/services/admin.service';
import { DropdownOption, GenericDropList } from '../../../shared/components/generic-drop-list/generic-drop-list';

@Component({
  selector: 'app-admin-orders',
  imports: [TranslatePipe, RouterModule, GenericDropList],
  templateUrl: './admin-orders.html',
  styleUrl: './admin-orders.css',
})
export class AdminOrders {
  orders = signal<Order[]>([]);
  loading = signal(true);
  error = signal(false);

  currentPage = 1;
  totalPages = 1;
  totalOrders = 0;
  limit = 10;
  statusFilter = 'all';

  orderStatusOptions: DropdownOption[] = [
    { value: 'pending', label: 'admin.orders.filter_pending' },
    { value: 'completed', label: 'admin.orders.filter_completed' },
    { value: 'cancelled', label: 'admin.orders.filter_cancelled' },
  ];

  constructor(
    private adminService: AdminService,
    private toast: ToastService,
    private _translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    this.error.set(false);

    this.adminService.getAllOrdersForAdmin(this.currentPage, this.limit, this.statusFilter).subscribe({
      next: (res) => {
        this.orders.set(res.data);
        this.totalPages = res.pagination.totalPages;
        this.totalOrders = res.pagination.totalOrders;
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  changeStatus(orderId: string, newStatus: string): void {
    if (!newStatus) return;

    const validStatuses = ['pending', 'completed', 'cancelled'] as const;
    if (!validStatuses.includes(newStatus as any)) {
      this.toast.error('Invalid status');
      return;
    }

    const order = this.orders().find((o) => o._id === orderId);
    if (!order) {
      this.toast.error('Order not found');
      return;
    }
    const oldStatus = order.status;

    this.orders.update((orders) =>
      orders.map((o) =>
        o._id === orderId ? { ...o, status: newStatus as typeof oldStatus } : o
      )
    );

    this.adminService.updateOrderStatus(orderId, newStatus).subscribe({
      next: () => {
        this.toast.success('Order status updated');
      },
      error: () => {
        this.orders.update((orders) =>
          orders.map((o) => (o._id === orderId ? { ...o, status: oldStatus } : o))
        );
        this.toast.error('Failed to update status');
      },
    });
  }

  filterByStatus(status: string): void {
    this.statusFilter = status;
    this.currentPage = 1;
    this.loadOrders();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadOrders();
    }
  }

  getStatusClass(status: string): string {
    const classes: any = {
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      completed: 'bg-green-50 text-green-700 border-green-200',
      cancelled: 'bg-red-50 text-red-700 border-red-200',
    };
    return classes[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  }

  getStatusLabel(status: string): string {
    const labels: any = {
      pending: this._translate.instant('admin.orders.filter_pending'),
      completed: this._translate.instant('admin.orders.filter_completed'),
      cancelled: this._translate.instant('admin.orders.filter_cancelled'),
    };
    return labels[status] || status;
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }
}
