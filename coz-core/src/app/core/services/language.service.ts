import { computed, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, map, startWith } from 'rxjs';
import enTranslations from "../../../../public/i18n/en.json"
@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private currentLangSubject = new BehaviorSubject<string>('en');
  public currentLang$ = this.currentLangSubject.asObservable();
  lagSignal:any;

  constructor(private translate: TranslateService) {
    this.translate.setTranslation('en',enTranslations);
    const savedLang = localStorage.getItem('lang') || 'en';
    this.setLanguage(savedLang);
    this.lagSignal = toSignal(this.translate.onLangChange.pipe(
    startWith({ lang: this.translate.getCurrentLang() }),
    map(e => e.lang)
  ),
    { initialValue: this.translate.getCurrentLang() }
  )
  }
    t(key:string){
      return computed(()=>{
          this.lagSignal();
          return this.translate.instant(key);
      })
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
