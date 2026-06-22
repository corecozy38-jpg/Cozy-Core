import { Component, signal } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-faq',
  imports: [TranslatePipe, FormsModule],
  templateUrl: './faq.html',
  styleUrl: './faq.css',
})
export class Faq {
  faqs = signal<any[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  showModal = false;
  isEditing = false;
  editingId: string | null = null;
  formData = {
    question: '',
    answer: '',
    category: 'general',
    isActive: true,   
  };
  saving = false;

  categories = ['general', 'shipping', 'returns', 'payment', 'products'];

  constructor(
    private _adminService: AdminService,
    private _toast: ToastService,
    private _confirmDialog: ConfirmDialogService,
    private _translate: TranslateService
  ) {}

  ngOnInit() {
    this.loadFaqs();
  }

  loadFaqs() {
    this.loading.set(true);
    this._adminService.getFaqs().subscribe({
      next: (res) => {
        this.faqs.set(res.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load FAQs');
        this.loading.set(false);
      },
    });
  }

  openAddModal() {
    this.isEditing = false;
    this.editingId = null;
    this.formData = { question: '', answer: '', category: 'general', isActive: true };
    this.showModal = true;
  }

  openEditModal(faq: any) {
    this.isEditing = true;
    this.editingId = faq._id;
    this.formData = {
      question: faq.question,
      answer: faq.answer,
      category: faq.category || 'general',
      isActive: faq.isActive !== undefined ? faq.isActive : true, 
    };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.saving = false;
    this.error.set(null);
  }

  saveFaq() {
    if (!this.formData.question || !this.formData.answer) {
      this.error.set('admin.faq.validation_required');
      return;
    }
    this.saving = true;
    this.error.set(null);

    const payload = { ...this.formData };
    if (this.isEditing && this.editingId) {
      this._adminService.updateFaq(this.editingId, payload).subscribe({
        next: () => {
          this._toast.success('admin.faq.update_success');
          this.closeModal();
          this.loadFaqs();
        },
        error: (err) => {
          this.error.set(err.error?.message || 'admin.faq.update_failed');
          this.saving = false;
        },
      });
    } else {
      this._adminService.createFaq(payload).subscribe({
        next: () => {
          this._toast.success('admin.faq.create_success');
          this.closeModal();
          this.loadFaqs();
        },
        error: (err) => {
          this.error.set(err.error?.message || 'admin.faq.create_failed');
          this.saving = false;
        },
      });
    }
  }

  async deleteFaq(id: string) {
    const confirmed = await this._confirmDialog.open({
      title: this._translate.instant('common.confirm'),
      message: this._translate.instant('admin.faq.delete_confirmation'),
      confirmText: this._translate.instant('common.delete'),
      cancelText: this._translate.instant('common.cancel'),
    });
    if (!confirmed) return;

    this._adminService.deleteFaq(id).subscribe({
      next: () => {
        this._toast.success('admin.faq.deleted_success');
        this.loadFaqs();
      },
      error: (err) => {
        this._toast.error(err.error?.message || 'admin.faq.delete_failed');
      },
    });
  }

  getCategoryLabel(category: string): string {
    const labels: any = {
      general: 'General',
      shipping: 'Shipping',
      returns: 'Returns',
      payment: 'Payment',
      products: 'Products',
    };
    return labels[category] || category;
  }

  faqCategoryDropdownOpen = false;
  selectedfaqCategory = '';

  togglefaqCategoryDropdown() {
    this.faqCategoryDropdownOpen = !this.faqCategoryDropdownOpen;
  }

  selectfaqCategory(category: string) {
    this.formData.category = category;
    this.faqCategoryDropdownOpen = false;
  }
}