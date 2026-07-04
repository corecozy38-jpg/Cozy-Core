import { computed, Injectable, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { BehaviorSubject, map, startWith } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private currentLangSubject = new BehaviorSubject<string>('en');
  public currentLang$ = this.currentLangSubject.asObservable();
  lagSignal: Signal<string>;

  constructor(private translate: TranslateService) {
    const savedLang = localStorage.getItem('lang') || 'en';
    this.currentLangSubject.next(savedLang);

    this.lagSignal = toSignal(
      this.translate.onLangChange.pipe(
        startWith({ lang: savedLang } as LangChangeEvent),
        map((e: LangChangeEvent) => e.lang)
      ),
      { initialValue: savedLang }
    );
  }

  t(key: string) {
    return computed(() => {
      this.lagSignal();
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
