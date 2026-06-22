import { Component, HostListener, signal } from '@angular/core';
import { RefreshTokenService } from '../../../core/services/refresh-token.service';
import { Router, RouterModule } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { Toast } from '../../../shared/components/toast/toast';
import { Footer } from '../../../shared/components/footer/footer';
import { Scroller } from '../../../shared/components/scroller/scroller';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-admin-layout',
  imports: [TranslatePipe,CommonModule,RouterModule,
    Toast, Footer,Scroller,ConfirmDialog
  ],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout {
  isSidebarOpen = signal(false);
  isLargeScreen = window.innerWidth >= 1024;

  constructor(
    private _refreshtokenService: RefreshTokenService,
    private _router: Router,
    private _confirmDialogService:ConfirmDialogService,
    private _translate: TranslateService
  ) {}

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
