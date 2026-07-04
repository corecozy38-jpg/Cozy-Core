import { computed, Injectable, Signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private currentLangSubject = new BehaviorSubject<string>('en');
  public currentLang$ = this.currentLangSubject.asObservable();

  public currentLangSignal: Signal<string>;

  constructor(private translate: TranslateService) {
    const savedLang = localStorage.getItem('lang') || 'en';
    this.currentLangSubject.next(savedLang);

    this.currentLangSignal = this.translate.currentLang as Signal<string>;
  }

  t(key: string) {
    return computed(() => {
      this.currentLangSignal();
      return this.translate.instant(key);
    });
  }

  setLanguage(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
    this.currentLangSubject.next(lang);

    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', lang);
  }

  getCurrentLang(): string {
    return this.currentLangSubject.value;
  }
}
