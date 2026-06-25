import { Component, signal } from '@angular/core';
import { Address, User } from '../../../core/interfaces/user.interface';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { TranslatePipe } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-details',
  imports: [TranslatePipe,RouterModule,CommonModule],
  templateUrl: './user-details.html',
  styleUrl: './user-details.css',
})
export class UserDetails {
    user = signal<User | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _adminService: AdminService,
    private _toast: ToastService
  ) {}

  ngOnInit() {
    const userId = this._route.snapshot.paramMap.get('id');
    if (userId) {
      this.loadUser(userId);
    }
  }

  loadUser(userId: string) {
    this.loading.set(true);
    this._adminService.getUserById(userId).subscribe({
      next: (res) => {
        this.user.set(res.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load user');
        this.loading.set(false);
      }
    });
  }

  goBack() {
    this._router.navigate(['/admin/users']);
  }

  getInitials(name: string): string {
    return name?.charAt(0).toUpperCase() || '?';
  }

  getAddressesCount(addresses: Address[]): number {
    return addresses?.length || 0;
  }

}
