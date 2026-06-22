import { Component } from '@angular/core';
import { SiteSettingsService } from '../../core/services/site-settings.service';
import { LanguageService } from '../../core/services/language.service';
import { TermItem } from '../../core/interfaces/settings';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-terms-and-condtions',
  imports: [TranslatePipe],
  templateUrl: './terms-and-condtions.html',
  styleUrl: './terms-and-condtions.css',
})
export class TermsAndCondtions {
  terms: TermItem[] = [];
  loading = true;
  currentLang = 'en';

  constructor(
    private _settingsService: SiteSettingsService,
    private langService: LanguageService
  ) {}

  ngOnInit(): void {
    this.currentLang = this.langService.getCurrentLang();
    this.langService.currentLang$.subscribe((lang) => {
      this.currentLang = lang;
    });

    this._settingsService.getTerms().subscribe({
      next: (res) => {
        this.terms = res.data  || [];
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  getTitle(item: any): string {
    return this.currentLang === 'ar' ? item.title_ar : item.title;
  }

  getContent(item: any): string {
    return this.currentLang === 'ar' ? item.content_ar : item.content;
  }

}
