import { Component } from '@angular/core';
import { AboutInfo, ContactForm, ContactInfo } from '../../core/interfaces/settings';
import { SiteSettingsService } from '../../core/services/site-settings.service';
import { LanguageService } from '../../core/services/language.service';
import { ToastService } from '../../core/services/toast.service';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-about-us',
  imports: [FormsModule, TranslatePipe],
  templateUrl: './about-us.html',
  styleUrl: './about-us.css',
})
export class AboutUs {
    about: AboutInfo= {
    title: '',
    description: '',
    title_ar: '',
    description_ar: ''
  };
  contact: ContactInfo = {
    phone: '',
    email: '',
    instagram: ''
  };
  loading = true;
  currentLang = 'en';
  form: ContactForm = { name: '', email: '', subject: '', message: '' };
  submitting = false;
  submitted = false;

  constructor(
    private _settingsService: SiteSettingsService,
    private _langService: LanguageService,
    private _toast: ToastService,
    private _translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.currentLang = this._langService.getCurrentLang();
    this._langService.currentLang$.subscribe((lang) => {
      this.currentLang = lang;
    });

    this._settingsService.getAbout().subscribe({
      next: (res) => {
        this.about = res.data;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });

    this._settingsService.getContact().subscribe({
      next: (res) => {
        this.contact = res.data;
      },
      error: () => {}
    });
  }

  getAboutTitle(): string {
    return this.currentLang === 'ar' ? (this.about.title_ar || this.about.title) : this.about.title;
  }

  getAboutDescription(): string {
    return this.currentLang === 'ar' ? (this.about.description_ar || this.about.description) : this.about.description;
  }

  onSubmit(): void {
    if (!this.form.name || !this.form.email || !this.form.message) {
      this._toast.error(this._translate.instant('about.form_validation_error'));
      return;
    }

    this.submitting = true;
    this.submitted = false;

    this._settingsService.sendMessage(this.form).subscribe({
      next: (res) => {
        this.submitting = false;
        this.submitted = true;
        this._toast.success(this._translate.instant('about.form_success'));
        this.form = { name: '', email: '', subject: '', message: '' };
      },
      error: (err) => {
        this.submitting = false;
        const errorMsg = err.error?.message || 'about.form_error';
        this._toast.error(this._translate.instant(errorMsg));
      }
    });
  }
}
