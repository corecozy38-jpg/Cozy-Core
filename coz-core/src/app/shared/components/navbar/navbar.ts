import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '../../../core/services/language.service';
import { AuthService } from '../../../core/services/auth.service';
import { RefreshTokenService } from '../../../core/services/refresh-token.service';
import { filter, Subscription, map } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../core/services/cart.service';
import { UserService } from '../../../core/services/user.service';
import { SiteSettingsService } from '../../../core/services/site-settings.service';

interface NavLink {
  label: string;
  path: string;
  children?: { label: string; path: string }[];
}

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
  isAdmin: boolean = false;

  private readonly staticNavLinks: NavLink[] = [
    { label: 'nav.home', path: '/home' },
    {
      label: 'nav.collections',
      path: '#',
      children: [
        { label: 'nav.summer_collection', path: '/collections/summer' },
        { label: 'nav.winter_collection', path: '/collections/winter' },
        { label: 'nav.all_products', path: '/products' }
      ]
    }
  ];

  navLinks: NavLink[] = [];

  userLinks: NavLink[] = [
    { label: 'nav.profile', path: '/user/profile' },
    { label: 'nav.orders', path: '/user/orders' }
  ];

  constructor(
    public _languageService: LanguageService,
    private _siteSettingsService: SiteSettingsService,
    private _tokenService: RefreshTokenService,
    private _router: Router,
    private _cartService: CartService,
    private _userService: UserService,
  ) {}

  ngOnInit() {
    this.navLinks = JSON.parse(JSON.stringify(this.staticNavLinks));

    this._siteSettingsService.getAvailableCollections().subscribe({
      next: (res) => {
        const collections = res.data || [];
        const collectionsIndex = this.navLinks.findIndex(link => link.label === 'nav.collections');

        if (collections.length > 0) {
          const collectionChildren = collections.map((collection: string) => ({
            label: `nav.${collection.toLowerCase()}_collection`,
            path: `/collections/${collection.toLowerCase()}`
          }));
          collectionChildren.push({ label: 'nav.all_products', path: '/products' });

          if (collectionsIndex !== -1) {
            this.navLinks[collectionsIndex].children = collectionChildren;
          }
        } else {
          if (collectionsIndex !== -1) {
            this.navLinks.splice(collectionsIndex, 1);
          }
          const allProductsExists = this.navLinks.some(link => link.label === 'nav.all_products');
          if (!allProductsExists) {
            this.navLinks.push({ label: 'nav.all_products', path: '/products' });
          }
        }
      },
      error: () => {
        console.warn('Failed to load collections, using default links.');
      }
    });

    this._userService.getUserRole().subscribe({
      next: (role) => { this.isAdmin = role === 'admin'; },
      error: () => { this.isAdmin = false; }
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
    if (!target.closest('.collections-dropdown')) {
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