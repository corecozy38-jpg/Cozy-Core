import { Component, HostListener, OnInit, signal } from '@angular/core';
import { Address, AddressWithId, userProfile } from '../../core/interfaces/user.interface';
import { CartService } from '../../core/services/cart.service';
import { OrderesService } from '../../core/services/orderes.service';
import { UserService } from '../../core/services/user.service';
import { RefreshTokenService } from '../../core/services/refresh-token.service';
import { ToastService } from '../../core/services/toast.service';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-check-out',
  imports: [TranslatePipe, FormsModule],
  templateUrl: './check-out.html',
  styleUrl: './check-out.css',
})
export class CheckOut implements OnInit{
  cartItems = signal<any[]>([]);
  totalPrice = signal(0);
  loadingCart = signal(true);

  isLoggedIn = false;
  userProfile = signal<userProfile | null>(null);

  addresses = signal<AddressWithId[]>([]);
  showAddressDropdown = signal(false);
  selectedAddressId = signal<string | null>(null);

  shippingAddress = {
    fullName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    governorate: '',
    country: 'Egypt',
    apartment: '',
    postalCode: ''
  };
  notes = '';

  submitting = signal(false);
  error = signal<string | null>(null);
  governoratesList: string[] = [];
  isGovernorateDropdownOpen = false;

    constructor(
    private _cartService: CartService,
    private _orderService: OrderesService,
    private _userService: UserService,
    private _refreshTokenService: RefreshTokenService,
    private _toast: ToastService,
    private _router: Router,
    private _translate: TranslateService,
    private _confirmDialogService : ConfirmDialogService
  ) {}

  ngOnInit() {
      this.isLoggedIn = !!this._refreshTokenService.getAccessToken();
    this.loadGovernorates();
    this.loadCart();
    if (this.isLoggedIn) {
      this.loadUserData();
      this.loadAddresses();
    }
  }

  loadGovernorates() {
    this._translate.get('governorates.list').subscribe((list: string[]) => {
      this.governoratesList = list;
    });
  }

  loadCart() {
    this.loadingCart.set(true);
    this._cartService.getCart().subscribe({
      next: (cart) => {
        this.cartItems.set(cart.items || []);
        this.totalPrice.set(cart.totalPrice || 0);
        this.loadingCart.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 
          `${this._translate.instant('error.FTL')} ${this._translate.instant('cart.title')} `);
        this.loadingCart.set(false);
      }
    });
  }

  loadUserData() {
    this._userService.getUserProfile().subscribe({
      next: (res) => {
        const profile = res;
        this.userProfile.set(profile);
        this.shippingAddress.fullName = profile.data.fullName;
        this.shippingAddress.email = profile.data.email;
        this.shippingAddress.phone = profile.data.phone;
      },
      error: () => {}
    });
  }

  loadAddresses() {
    this._userService.getAddresses().subscribe({
      next: (res) => {
        this.addresses.set(res.data);
      },
      error: () => {}
    });
  }

  selectAddress(address: AddressWithId) {
    this.selectedAddressId.set(address._id!);
    this.shippingAddress.street = address.street;
    this.shippingAddress.city = address.city;
    this.shippingAddress.governorate = address.governorate;
    this.shippingAddress.apartment = address.apartment || '';
    this.shippingAddress.postalCode = address.postalCode || '';
    this.shippingAddress.country = address.country || 'Egypt';
    this.showAddressDropdown.set(false);
  }

  fillAddressFromSaved() {
    if (!this.isLoggedIn) return;
    this.showAddressDropdown.set(!this.showAddressDropdown());
  }

  closeAddressDropdown() {
    setTimeout(() => this.showAddressDropdown.set(false), 200);
  }

  toggleGovernorateDropdown() {
    this.isGovernorateDropdownOpen = !this.isGovernorateDropdownOpen;
  }

  selectGovernorate(gov: string) {
    this.shippingAddress.governorate = gov;
    this.isGovernorateDropdownOpen = false;
  }

  validateForm(): boolean {
    const { fullName, email, phone, street, city, governorate } = this.shippingAddress;
    if (!fullName || !email || !phone || !street || !city || !governorate) {
      this.error.set(this._translate.instant('checkout.validation_required'));
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.error.set('auth.email_invalid');
      return false;
    }
    const phoneRegex = /^(01)[0-9]{9}$/;
    if (!phoneRegex.test(phone)) {
      this.error.set(this._translate.instant('auth.phone_invalid'));
      return false;
    }
    return true;
  }

  async submitOrder() {
    if (!this.validateForm()) return;
    if (this.cartItems().length === 0) {
      this.error.set(this._translate.instant('checkout.cart_empty'));
      return;
    }
    const confirmed = await this._confirmDialogService.open({
    title: this._translate.instant('orders.place_order'),
    message: this._translate.instant('orders.place_order_confirmation'),
    confirmText: this._translate.instant('orders.place_order_confirm'),
    cancelText: this._translate.instant('profile_.logout_cancel')
  });

  if (!confirmed) return;
    this.submitting.set(true);
    this.error.set(null);

    const orderData = {
      shippingAddress: this.shippingAddress,
      notes: this.notes
    };

    this._orderService.createOrder(orderData).subscribe({
      next: (res) => {
        const isLogedIn= this._refreshTokenService.getAccessToken()? true : false;
        this._toast.success(this._translate.instant('checkout.order_placed'));
        this._cartService.updateCartCount();
        if (isLogedIn) {
          this._router.navigate(['/user/orders']);
        }else{
          this._router.navigate(['home']);
        }
      },
      error: (err) => {
        this.error.set(err.error?.message || this._translate.instant('checkout.order_failed'));
        this.submitting.set(false);
      }
    });
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.address-dropdown') && !target.closest('.governorate-dropdown')) {
      this.showAddressDropdown.set(false);
      this.isGovernorateDropdownOpen = false;
    }
  }
}
