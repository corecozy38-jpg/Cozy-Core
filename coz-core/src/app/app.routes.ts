import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { profileGuard } from './core/guards/profile-guard';
import { adminGuard } from './core/guards/admin-guard';
import { Error404 } from './features/error-404/error-404';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./features/home/home').then(m => m.Home) },
  { path: 'products', loadComponent: () => import('./features/products/products').then(m => m.Products) },
  { path: 'collections/:collectionName', loadComponent: () => import('./features/products/products').then(m => m.Products) },
  { path: 'search', loadComponent: () => import('./features/products/products').then(m => m.Products) },

  { path: 'auth', loadComponent: () => import('./features/auth/auth').then(m => m.Auth), canActivate: [authGuard] },

  { path: 'product-details/:slug', loadComponent: () => import('./features/product-details/product-details').then(m => m.ProductDetails) },

  { path: 'cart', loadComponent: () => import('./features/cart/cart').then(m => m.Cart) },

  { path: 'auth/verify-email', loadComponent: () => import('./features/verify-email/verify-email').then(m => m.VerifyEmail) },

  {
    path: 'user',
    loadComponent: () => import('./features/signedUser/user-layout/user-layout').then(m => m.UserLayout),
    canActivate: [profileGuard],
    children: [
      { path: 'profile', loadComponent: () => import('./features/signedUser/profile/profile').then(m => m.Profile) },
      { path: 'orders', loadComponent: () => import('./features/signedUser/orders/orders').then(m => m.Orders) },
      { path: 'addresses', loadComponent: () => import('./features/signedUser/user-addresses/user-addresses').then(m => m.UserAddresses) },
      { path: 'order/:id', loadComponent: () => import('./features/signedUser/order-details/order-details').then(m => m.OrderDetails) },
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
    ]
  },

  { path: "orders/checkout", loadComponent: () => import('./features/check-out/check-out').then(m => m.CheckOut) },

  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-layout/admin-layout').then(m => m.AdminLayout),
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/admin/dashboard/dashboard').then(m => m.Dashboard) },
      { path: 'products', loadComponent: () => import('./features/admin/admin-products/products').then(m => m.adminProducts) },
      { path: 'products/new', loadComponent: () => import('./features/admin/product-form/product-form').then(m => m.ProductFormComponent) },
      { path: 'products/:slug/edit', loadComponent: () => import('./features/admin/product-form/product-form').then(m => m.ProductFormComponent) },
      { path: 'orders', loadComponent: () => import('./features/admin/admin-orders/admin-orders').then(m => m.AdminOrders) },
      { path: 'reviews', loadComponent: () => import('./features/admin/reviews/reviews').then(m => m.Reviews) },
      { path: 'users', loadComponent: () => import('./features/admin/users/users').then(m => m.Users) },
      { path: 'settings', loadComponent: () => import('./features/admin/settings/settings').then(m => m.Settings) },
      { path: 'faq', loadComponent: () => import('./features/admin/faq/faq').then(m => m.Faq) },
      { path: 'users/:id', loadComponent: () => import('./features/admin/user-details/user-details').then(m => m.UserDetails) },
    ]
  },

  { path: 'contact-us', loadComponent: () => import('./features/about-us/about-us').then(m => m.AboutUs) },
  { path: 'about-us', loadComponent: () => import('./features/about-us/about-us').then(m => m.AboutUs) },
  { path: 'terms-conditions', loadComponent: () => import('./features/terms-and-condtions/terms-and-condtions').then(m => m.TermsAndCondtions) },
  { path: 'order-guide', loadComponent: () => import('./features/order-guide/order-guide').then(m => m.OrderGuide) },

  { path: '**', component : Error404 },
];
