import { Router, RouterLink } from '@angular/router';
import { Component, signal } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { RefreshTokenService } from '../../../core/services/refresh-token.service';
import { User, userProfile } from '../../../core/interfaces/user.interface';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-profile',
  imports: [TranslatePipe, FormsModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  user = signal<User | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  editMode = false;
  editFullName = '';
  editPhone = '';

  showPasswordModal = false;
  changePasswordData = {
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  };
  changingPassword = false;
  passwordError = '';

  showDeleteModal = false;
  deletePassword = '';
  deleteError = '';
  isDeleting = false;

  isAdmin: boolean = false;

  constructor(
    private _userService: UserService,
    private _authService: AuthService,
    private _toast: ToastService,
    private _tokenService: RefreshTokenService,
    private _router: Router,
    private _translate: TranslateService,
    private _confirmDialogService: ConfirmDialogService
  ) { }

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.loading.set(true);
    this._userService.getUserProfile().subscribe({
      next: (res) => {
        this.user.set(res.data);
        this.isAdmin = this.user()?.role === 'admin';
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 
          `${this._translate.instant('error.FTL')} ${this._translate.instant('nav.profile')} `);
        this.loading.set(false);
      }
    });
  }

  enableEdit() {
    if (!this.user()) return;
    this.editFullName = this.user()!.fullName;
    this.editPhone = this.user()!.phone || '';
    this.editMode = true;
  }

  cancelEdit() {
    this.editMode = false;
    this.editFullName = '';
    this.editPhone = '';
    this.error.set(null);
  }

  saveProfile() {
    if (!this.editFullName.trim()) {
      this.error.set('auth.full_name_required');
      return;
    }
    const updateData: any = { fullName: this.editFullName };
    if (this.editPhone) updateData.phone = this.editPhone;

    this._userService.updateUserProfile(updateData).subscribe({
      next: (res) => {
        this.user.set(res.data);
        this.editMode = false;
        this._toast.success('Profile updated successfully');
        this.error.set(null);
      },
      error: (err) => {
        this.error.set(err.error?.message || this._translate.instant('admin.orders.update_failed'));
      }
    });
  }

  openPasswordModal() {
    this.showPasswordModal = true;
    this.passwordError = '';
    this.changePasswordData = {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    };
  }

  closePasswordModal() {
    this.showPasswordModal = false;
  }

  changePassword() {
    this.passwordError = '';
    const { currentPassword, newPassword, confirmNewPassword } = this.changePasswordData;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      this.passwordError = 'auth.fill_all_fields';
      return;
    }
    if (newPassword !== confirmNewPassword) {
      this.passwordError = 'auth.passwords_not_match';
      return;
    }
    if (newPassword.length < 8) {
      this.passwordError = 'auth.password_min_length';
      return;
    }

    this.changingPassword = true;
    this._authService.changePassword({
      currentPassword,
      newPassword,
      confirmNewPassword
    }).subscribe({
      next: () => {
        this._toast.success(this._translate.instant('auth.password_changed'));
        this.closePasswordModal();
        this.changingPassword = false;
      },
      error: (err) => {
        this.passwordError = err.error?.message || this._translate.instant('auth.change_password_failed');
        this.changingPassword = false;
      }
    });
  }

  openDeleteModal() {
    this.showDeleteModal = true;
    this.deletePassword = '';
    this.deleteError = '';
    this.isDeleting = false;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.deletePassword = '';
    this.deleteError = '';
    this.isDeleting = false;
  }

  confirmDeleteAccount() {
    if (!this.deletePassword || this.deletePassword.length < 6) {
      this.deleteError = 'Please enter your password to confirm deletion';
      return;
    }

    this.isDeleting = true;
    this.deleteError = '';

    this._authService.deleteAccount({ password: this.deletePassword }).subscribe({
      next: () => {
        this._toast.success(this._translate.instant('profile.account_deleted'));
        this.closeDeleteModal();
        this._tokenService.clearAccessToken();
        this._router.navigate(['/home']);
      },
      error: (err) => {
        this.deleteError = err.error?.message || 'Failed to delete account';
        this.isDeleting = false;
      }
    });
  }

  getUserInitials(): string {
    if (!this.user()) return 'U';
    return this.user()!.fullName.charAt(0).toUpperCase();
  }

  async logout() {
    const confirmed = await this._confirmDialogService.open({
      title: this._translate.instant('profile_.logout'),
      message: this._translate.instant('profile_.logout_confirmation'),
      confirmText: this._translate.instant('profile_.logout_confirm'),
      cancelText: this._translate.instant('profile_.logout_cancel')
    });

    if (!confirmed) return;
    this._tokenService.clearAccessToken();
    this._router.navigate(['/auth']);
  }
}