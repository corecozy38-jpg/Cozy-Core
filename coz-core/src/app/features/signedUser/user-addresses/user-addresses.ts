import { Component, HostListener, signal } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { UserService } from '../../../core/services/user.service';
import { Address, AddressWithId } from '../../../core/interfaces/user.interface';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-addresses',
  imports: [TranslatePipe, FormsModule],
  templateUrl: './user-addresses.html',
  styleUrl: './user-addresses.css',
})
export class UserAddresses {
  addresses = signal<AddressWithId[]>([]);

  loading = signal(true);
  error = signal<string | null>(null);

  showModal = false;
  isEditing = false;
  editingId: string | null = null;
  addressForm: Address = {
    governorate: '',
    city: '',
    street: '',
    apartment: '',
    postalCode: '',
    country: 'Egypt'
  };
  saving = false;

  governoratesList: string[] = [];

    isGovernorateDropdownOpen = false;


  constructor(
    private _userService: UserService,
    private _toast: ToastService,
    private _confirmDialog: ConfirmDialogService,
    private _translate: TranslateService
  ) { }

  ngOnInit() {
    this.loadGovernorates();
    this.loadAddresses();
  }

  loadGovernorates() {
    this._translate.get('governorates.list').subscribe((list: string[]) => {
      this.governoratesList = list;
    });
  }

  loadAddresses() {
    this.loading.set(true);
    this._userService.getAddresses().subscribe({
      next: (res) => {
        this.addresses.set(res.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load addresses');
        this.loading.set(false);
      }
    });
  }

  openAddModal() {
    this.isEditing = false;
    this.editingId = null;
    this.addressForm = {
      governorate: '',
      city: '',
      street: '',
      apartment: '',
      postalCode: '',
      country: 'Egypt'
    };
    this.showModal = true;
  }

  openEditModal(address: AddressWithId) {
    this.isEditing = true;
    this.editingId = address._id!;
    this.addressForm = {
      country: address.country || 'Egypt',
      governorate: address.governorate,
      city: address.city,
      street: address.street,
      apartment: address.apartment || null,
      postalCode: address.postalCode || null
    };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.saving = false;
    this.error.set(null);
  }

  async deleteAddress(addressId: string) {
    const confirmed = await this._confirmDialog.open({
      title: this._translate.instant('common.confirm'),
      message: this._translate.instant('addresses.delete_confirmation'),
      confirmText: this._translate.instant('common.delete'),
      cancelText: this._translate.instant('common.cancel')
    });
    if (!confirmed) return;

    this._userService.removeAddress(addressId).subscribe({
      next: () => {
        this._toast.success(this._translate.instant('addresses.deleted_success'));
        this.loadAddresses();
      },

      error: (err) => {
        this._toast.error(err.error?.message || this._translate.instant('addresses.delete_failed'));
      }
    });
  }

  saveAddress() {
    if (!this.addressForm.governorate || !this.addressForm.city || !this.addressForm.street) {
      this.error.set(this._translate.instant('addresses.validation_required'));
      return;
    }
    this.saving = true;
    this.error.set(null);

    if (this.isEditing && this.editingId) {
      this._userService.updateAddress(this.editingId, this.addressForm).subscribe({
        next: () => {
          this._toast.success(this._translate.instant('addresses.update_success'));
          this.closeModal();
          this.loadAddresses();
        },
        error: (err) => {
          this.error.set(err.error?.message || this._translate.instant('addresses.update_failed'));
          this.saving = false;
        }
      });
    } else {

      this._userService.addAddresses([this.addressForm] ).subscribe({
        next: () => {
          this._toast.success(this._translate.instant('addresses.add_success'));
          this.closeModal();
          this.loadAddresses();
        },
        error: (err) => {
          this.error.set(err.error?.message || this._translate.instant('addresses.add_failed'));
          this.saving = false;
        }
      });
    }
  }


  toggleGovernorateDropdown() {
    this.isGovernorateDropdownOpen = !this.isGovernorateDropdownOpen;
  }

  selectGovernorate(gov: string) {
    this.addressForm.governorate = gov;
    this.isGovernorateDropdownOpen = false;
  }


  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.isGovernorateDropdownOpen = false;
    }
  }
}
