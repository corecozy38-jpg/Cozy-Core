import { Component, signal } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { TranslatePipe } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AboutInfo, AttributeItem, ColorItem, ContactInfo, OrderGuide, OrderGuideImage, TermItem } from '../../../core/interfaces/settings';
import { SiteSettingsService } from '../../../core/services/site-settings.service';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { Image } from '../../../core/interfaces/product.interface';

@Component({
  selector: 'app-settings',
  imports: [TranslatePipe, FormsModule, CommonModule, DragDropModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  contact = signal<ContactInfo>({ phone: '', email: '', instagram: '' });
  about = signal<AboutInfo>({ title: '', description: '' });
  terms = signal<TermItem[]>([]);
  orderGuide = signal<OrderGuide>({ images: [] });
  banner = signal<Image>({ url: '', publicId: '' });

  productTypes = signal<AttributeItem[]>([]);
  collectionTypes = signal<AttributeItem[]>([]);
  colors = signal<ColorItem[]>([]);
  sizes = signal<string[]>([]);

  loading = signal(true);
  saving = signal(false);
  uploading = signal(false);
  uploadingBanner = signal(false);
  error = signal<string | null>(null);
  activeTab = 'contact';

  constructor(
    private _adminService: AdminService,
    private _toast: ToastService,
    private _siteSettingsService: SiteSettingsService
  ) { }

  ngOnInit() {
    this.loadAllSettings();
  }

  loadAllSettings() {
    this.loading.set(true);
    this._siteSettingsService.getContact().subscribe({
      next: (res) => { this.contact.set(res.data); },
      error: () => { }
    });
    this._siteSettingsService.getAbout().subscribe({
      next: (res) => { this.about.set(res.data); },
      error: () => { }
    });
    this._siteSettingsService.getTerms().subscribe({
      next: (res) => {
        this.terms.set((res.data) || []);
      },
      error: () => { }
    });
    this._siteSettingsService.getOrderGuide().subscribe({
      next: (res) => { this.orderGuide.set(res.data); },
      error: () => { }
    });
    this._siteSettingsService.getBanner().subscribe({
      next: (res) => { this.banner.set(res.data); },
      error: () => { }
    });
    this._siteSettingsService.getAttributes().subscribe({
      next: (res) => {
        this.productTypes.set(res.data.productTypes || []);
        this.collectionTypes.set(res.data.collectionTypes || []);
        this.colors.set(res.data.colors || []);
        this.sizes.set(res.data.sizes || []);
      },
      error: () => { }
    });
    setTimeout(() => this.loading.set(false), 500);
  }

  dropOrderGuideImage(event: CdkDragDrop<any[]>): void {
    const currentImages = this.orderGuide().images;
    const newImages = [...currentImages];
    moveItemInArray(newImages, event.previousIndex, event.currentIndex);
    this.orderGuide.set({ images: newImages });
  }

  saveSettings() {
    this.saving.set(true);
    this.error.set(null);

    const tab = this.activeTab;

    switch (tab) {
      case 'contact':
        this._adminService.updateContactInfo({
          phone: this.contact().phone,
          email: this.contact().email,
          instagram: this.contact().instagram
        }).subscribe({
          next: () => {
            this._toast.success('admin.settings.save_success');
            this.saving.set(false);
          },
          error: (err) => {
            this.error.set(err.error?.message || 'admin.settings.save_failed');
            this.saving.set(false);
          }
        });
        break;

      case 'about':
        this._adminService.updateAboutInfo({
          title: this.about().title,
          description: this.about().description
        }).subscribe({
          next: () => {
            this._toast.success('admin.settings.save_success');
            this.saving.set(false);
          },
          error: (err) => {
            this.error.set(err.error?.message || 'admin.settings.save_failed');
            this.saving.set(false);
          }
        });
        break;

      case 'terms':
        this._adminService.updateTermsAndConditions({
          terms: this.terms()
        }).subscribe({
          next: () => {
            this._toast.success('admin.settings.save_success');
            this.saving.set(false);
          },
          error: (err) => {
            this.error.set(err.error?.message || 'admin.settings.save_failed');
            this.saving.set(false);
          }
        });
        break;

      case 'orderGuide':
        const cleanedImages = this.orderGuide().images.map((img: OrderGuideImage) => ({
          url: img.url,
          publicId: img.publicId,
          displayOrder: img.displayOrder
        }));
        this._adminService.updateOrderGuide({
          images: cleanedImages
        }).subscribe({
          next: () => {
            this._toast.success('admin.settings.save_success');
            this.saving.set(false);
          },
          error: (err) => {
            this.error.set(err.error?.message || 'admin.settings.save_failed');
            this.saving.set(false);
          }
        });
        break;

      case 'banner':
        this._adminService.updateBanner({
          url: this.banner().url,
          publicId: this.banner().publicId
        }).subscribe({
          next: () => {
            this._toast.success('admin.settings.save_success');
            this.saving.set(false);
          },
          error: (err) => {
            this.error.set(err.error?.message || 'admin.settings.save_failed');
            this.saving.set(false);
          }
        });
        break;

      case 'attributes':
        this._adminService.updateAttributes({
          productTypes: this.productTypes(),
          collectionTypes: this.collectionTypes(),
          colors: this.colors(),
          sizes: this.sizes()
        }).subscribe({
          next: () => {
            this._toast.success('admin.settings.save_success');
            this.saving.set(false);
            this._siteSettingsService.notifyAttributesUpdated();
          },
          error: (err) => {
            this.error.set(err.error?.message || 'admin.settings.save_failed');
            this.saving.set(false);
          }
        });
        break;

      default:
        this.saving.set(false);
    }
  }

  addProductType() {
    this.productTypes.update(items => [...items, { name: '', name_ar: '' }]);
  }

  removeProductType(index: number) {
    this.productTypes.update(items => items.filter((_, i) => i !== index));
  }

  addCollectionType() {
    this.collectionTypes.update(items => [...items, { name: '', name_ar: '' }]);
  }

  removeCollectionType(index: number) {
    this.collectionTypes.update(items => items.filter((_, i) => i !== index));
  }

  addColor() {
    this.colors.update(items => [...items, { name: '', name_ar: '', code: '#000000' }]);
  }

  removeColor(index: number) {
    this.colors.update(items => items.filter((_, i) => i !== index));
  }

  addSize() {
    this.sizes.update(items => [...items, '']);
  }

  removeSize(index: number) {
    this.sizes.update(items => items.filter((_, i) => i !== index));
  }

  onBannerImageSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;

  const file = input.files[0];
  const formData = new FormData();
  formData.append('image', file);

  this.uploadingBanner.set(true);
  this._adminService.uploadImage(formData).subscribe({
    next: (res) => {
      const imageData = res.data || res;
      const newImage = { url: imageData.url || '', publicId: imageData.publicId || '' };
      if (newImage.url && newImage.publicId) {
        this._adminService.updateBanner(newImage).subscribe({
          next: () => {
            this.banner.set(newImage);
            this._toast.success('Banner updated successfully');
            this.uploadingBanner.set(false);
          },
          error: (err) => {
            this._toast.error(err.error?.message || 'Failed to save banner');
            this.uploadingBanner.set(false);
          }
        });
      } else {
        this._toast.error('Invalid response from server');
        this.uploadingBanner.set(false);
      }
      input.value = '';
    },
    error: (err) => {
      this._toast.error(err.error?.message || 'Upload failed');
      this.uploadingBanner.set(false);
      input.value = '';
    }
  });
}

  removeBannerImage(): void {
    this.banner.set({ url: '', publicId: '' });
  }

  addTerm(): void {
    const current = this.terms();
    this.terms.set([...current, { title: '', content: '' }]);
  }

  removeTerm(index: number): void {
    const current = this.terms();
    this.terms.set(current.filter((_, i) => i !== index));
  }

  removeOrderGuideImage(index: number): void {
    const current = this.orderGuide().images;
    current.splice(index, 1);
    this.orderGuide.set({ images: [...current] });
  }

  onOrderGuideImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const formData = new FormData();
    formData.append('image', file);

    this.uploading.set(true);
    this._adminService.uploadImage(formData).subscribe({
      next: (res) => {
        const imageData = res.data || res;
        const newImage = {
          url: imageData.url || '',
          publicId: imageData.publicId || ''
        };
        if (newImage.url && newImage.publicId) {
          const current = this.orderGuide().images;
          this.orderGuide.set({ images: [...current, newImage] });
          this._toast.success('Image uploaded successfully');
        } else {
          this._toast.error('Invalid response from server');
        }
        this.uploading.set(false);
        input.value = '';
      },
      error: (err) => {
        this._toast.error(err.error?.message || 'Upload failed');
        this.uploading.set(false);
        input.value = '';
      }
    });
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  getTabClass(tab: string): string {
    return this.activeTab === tab
      ? 'px-5 py-2.5 bg-gray-900 text-white rounded-full text-sm font-medium shadow-sm hover:bg-gray-800 transition'
      : 'px-5 py-2.5 bg-gray-100 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-200 transition';
  }
}
