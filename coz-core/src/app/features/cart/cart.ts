import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CartService } from '../../core/services/cart.service';
import { CartItem, CartI } from '../../core/interfaces/cart.interface';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css']
})
export class Cart implements OnInit {
  items: CartItem[] = [];
  totalPrice = 0;
  loading = true;
  error = false;

  constructor(
    private cartService: CartService,
    private translate: TranslateService,
    private toast: ToastService,
    private _confirmDialogService: ConfirmDialogService
  ) { }

  ngOnInit() {
    this.loadCart();
  }

  loadCart() {
    this.loading = true;
    this.error = false;
    this.cartService.getCart().subscribe({
      next: (res) => {
        this.items = res?.items || [];
        this.totalPrice = res?.totalPrice || 0;
        this.loading = false;
      },
      error: (err) => {
        this.error = true;
        this.loading = false;
        this.toast.error(this.translate.instant('cart.error'));
      }
    });
  }

  updateQuantity(item: CartItem, newQty: number) {
    if (newQty < 1 || newQty > item.maxQuantity) return;
    this.cartService.updateQuantity(item.itemId, newQty).subscribe({
      next: (res: CartI) => {
        this.items = res.items;
        this.totalPrice = res.totalPrice;
        this.toast.success(this.translate.instant('cart.quantity_updated'));
      },
      error: () => {
        this.error = true;
        this.toast.error(this.translate.instant('cart.update_failed'));
      }
    });
  }

  removeItem(itemId: string) {
    this.cartService.removeItem(itemId).subscribe({
      next: (res: CartI) => {
        this.items = res.items;
        this.totalPrice = res.totalPrice;
        this.toast.success(this.translate.instant('cart.item_removed'));
      },
      error: () => {
        this.error = true;
        this.toast.error(this.translate.instant('cart.remove_failed'));
      }
    });
  }

  async clearCart() {
    const confirmed = await this._confirmDialogService.open({
      title: this.translate.instant('cart.clear_title'),
      message: this.translate.instant('cart.clear_cart_confirmation'),
      confirmText: this.translate.instant('cart.clear_confirm'),
      cancelText: this.translate.instant('cart.clear_cancel')
    });

    if (!confirmed) return;

    this.cartService.clearCart().subscribe({
      next: () => {
        this.items = [];
        this.totalPrice = 0;
        this.toast.success(this.translate.instant('cart.cart_cleared'));
      },
      error: () => {
        this.error = true;
        this.toast.error(this.translate.instant('cart.clear_failed'));
      }
    });
  }


  retry() {
    this.loadCart();
  }

  get isCartEmpty(): boolean {
    return !this.items || this.items.length === 0;
  }


  get hasUnavailableItems(): boolean {
    return this.items.some(item => item.quantity > item.maxQuantity);
  }
  // CAN'T PAY IF PRODUCT IS OUT OF STOCK
  get isCartReadyForCheckout(): boolean {
    return !this.isCartEmpty && !this.hasUnavailableItems;
  }
}
