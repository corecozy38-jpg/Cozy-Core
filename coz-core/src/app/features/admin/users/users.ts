import { RouterModule } from '@angular/router';
import { Component, signal } from '@angular/core';
import { User } from '../../../core/interfaces/user.interface';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-users',
  imports: [TranslatePipe,CommonModule,RouterModule,FormsModule],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users {
  Math=Math;
  users = signal<User[]>([]);
  openUserId=signal<string | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  totalUsers = 0;
  totalPages = 1;
  currentPage = 1;
  limit = 10;
  searchQuery = '';
  searchDebounce: any;
  adminId:string ='';

  constructor(
    private _adminService: AdminService,
    private _toast: ToastService,
    private _confirmDialog: ConfirmDialogService,
    private _translate:TranslateService,
    private _userService:UserService
  ) {
    this._userService.getUserId().subscribe({
      next:(res)=>
        this.adminId = res
    });
  }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    this._adminService.getUsers({
      page: this.currentPage,
      limit: this.limit,
      search: this.searchQuery.trim() || undefined
    }).subscribe({
      next: (res) => {
        this.users.set(res.data);
        this.totalUsers = res.pagination.totalUsers;
        this.totalPages = res.pagination.totalPages;
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load users');
        this.loading.set(false);
      }
    });
  }

  onSearchInput() {
    if (this.searchDebounce) clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => {
      this.currentPage = 1;
      this.loadUsers();
    }, 400);
  }

  clearSearch() {
    this.searchQuery = '';
    this.currentPage = 1;
    this.loadUsers();
  }

  async updateRole(userId: string, newRole: 'user' | 'admin') {
    const confirmed = await this._confirmDialog.open({
      title: this._translate.instant('common.confirm'),
      message: this._translate.instant('admin.users.change_role_confirmation'),
      confirmText: this._translate.instant('common.delete'),
      cancelText: this._translate.instant('common.cancel')
    });
    if (!confirmed) return;

    this._adminService.updateUserRole(userId, newRole).subscribe({
      next: () => {
        this._toast.success('admin.users.role_updated');
        this.loadUsers();
      },
      error: (err) => {
        this._toast.error(err.error?.message || 'admin.users.role_update_failed');
      }
    });
  }

  async deleteUser(userId: string) {
    const confirmed = await this._confirmDialog.open({
      title: this._translate.instant('common.confirm'),
      message: this._translate.instant('admin.users.delete_confirmation'),
      confirmText: this._translate.instant('common.delete'),
      cancelText: this._translate.instant('common.cancel')
    });
    if (!confirmed) return;

    this._adminService.deleteUser(userId).subscribe({
      next: () => {
        this._toast.success('admin.users.deleted_success');
        this.loadUsers();
      },
      error: (err) => {
        this._toast.error(err.error?.message || 'admin.users.delete_failed');
      }
    });
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadUsers();
  }

  getInitials(name: string): string {
    return name?.charAt(0).toUpperCase() || '?';
  }

  getRoleBadgeClass(role: string): string {
    return role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700';
  }

  userRoleDropdownOpen = false;
  selecteduserRole = '';
  userRoles = ['admin','user']
  toggleuserRoleDropdown(userId:string) {
    this.openUserId.set(this.openUserId()===userId? null : userId);
  }
  isOpen(userId:string):boolean{
        return this.openUserId()===userId;
  }
}
