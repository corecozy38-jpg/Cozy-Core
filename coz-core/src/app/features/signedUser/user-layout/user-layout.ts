import { Component, HostListener, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { RefreshTokenService } from '../../../core/services/refresh-token.service';
import { UserService } from '../../../core/services/user.service';
import { CommonModule } from '@angular/common';
import { User } from '../../../core/interfaces/user.interface';
@Component({
  selector: 'app-user-layout',
  imports: [RouterModule, TranslatePipe, CommonModule],
  templateUrl: './user-layout.html',
  styleUrl: './user-layout.css',
})
export class UserLayout {
  isSidebarOpen = signal(false);
  isLargeScreen = window.innerWidth >= 1024;
  user = signal<User | null>(null);

  constructor(
    private userService: UserService,
  ) {
    this.loadUserProfile();
  }

  loadUserProfile() {
    this.userService.getUserProfile().subscribe({
      next: (res) => this.user.set(res.data),
      error: () => this.user.set(null)
    });
  }

  @HostListener('window:resize')
  onResize() {
    this.isLargeScreen = window.innerWidth >= 1024;
    if (this.isLargeScreen) {
      this.isSidebarOpen.set(false);
    }
  }

  toggleSidebar() {
    this.isSidebarOpen.update(v => !v);
  }

  closeSidebar() {
    this.isSidebarOpen.set(false);
  }


}
