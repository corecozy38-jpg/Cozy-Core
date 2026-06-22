import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '../../../core/services/language.service';
import { AuthService } from '../../../core/services/auth.service';
import { RefreshTokenService } from '../../../core/services/refresh-token.service';
import { catchError, filter, map, Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../core/services/cart.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe, FormsModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class Navbar implements OnInit, OnDestroy {
  isCollectionsOpen = false;
  isMobileMenuOpen = false;
  isProfileMenuOpen = false;
  isSearchModalOpen = false;
  searchQuery = '';
  cartCount: number = 0;
  isLoggedIn = false;
  private cartSubscription?: Subscription;
  private authSubscription?: Subscription;
  private routerSubscription?: Subscription;
  hideSearch: boolean = true;
  isAdmin:boolean = false;

  constructor(
    public _languageService: LanguageService,
    private _authService: AuthService,
    private _tokenService: RefreshTokenService,
    private _router: Router,
    private _cartService: CartService,
    private _userService : UserService,
  ) {}

  ngOnInit() {
    this._userService.getUserRole().subscribe({
    next: (role) => {
      this.isAdmin = role === 'admin';
    },
    error: () => {
      this.isAdmin = false;
    }
  });

    this.cartSubscription = this._cartService.cartCount$.subscribe(count => {
      this.cartCount = count;
    });

    this.checkLoginStatus();
    this.authSubscription = this._tokenService.accessToken$.subscribe(() => {
      this.checkLoginStatus();
    });

    this.routerSubscription = this._router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const currentUrl = this._router.url;
        this.hideSearch = currentUrl.includes('/search') ||
          currentUrl.includes('/collections') ||
          currentUrl.includes('/products');
      });
  }

  ngOnDestroy() {
    this.cartSubscription?.unsubscribe();
    this.authSubscription?.unsubscribe();
    this.routerSubscription?.unsubscribe();
  }

  checkLoginStatus() {
    this.isLoggedIn = !!this._tokenService.getAccessToken();
  }

  toggleCollections() {
    this.isCollectionsOpen = !this.isCollectionsOpen;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleProfileMenu() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  closeProfileMenu() {
    this.isProfileMenuOpen = false;
  }

  toggleLanguage() {
    const newLang = this._languageService.getCurrentLang() === 'en' ? 'ar' : 'en';
    this._languageService.setLanguage(newLang);
  }

  openSearchModal() {
    this.isSearchModalOpen = true;
  }

  closeSearchModal() {
    this.isSearchModalOpen = false;
    this.searchQuery = '';
  }

  performSearch() {
    if (this.searchQuery.trim()) {
      this._router.navigate(['/search'], { queryParams: { q: this.searchQuery } });
      this.closeSearchModal();
    }
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    const target = event.target as HTMLElement;

    if (!target.closest('.collections-dropdown') ) {
      this.isCollectionsOpen = false;
    }

    if (!target.closest('.profile-dropdown')) {
      this.isProfileMenuOpen = false;
    }

    if (window.innerWidth < 768 && !target.closest('.mobile-menu')) {
      this.isMobileMenuOpen = false;
    }
}
}
