import { Component, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-scroller',
  imports: [],
  templateUrl: './scroller.html',
  styleUrl: './scroller.css',
})
export class Scroller {
  isVisible = false;
  isRtl = false;
  private langSub?: Subscription;
  constructor(private _langService: LanguageService) { }

  ngOnInit() {
    this.langSub = this._langService.currentLang$.subscribe(lang => {
      this.isRtl = lang === 'ar';
    });
  }

  ngOnDestroy() {
    this.langSub?.unsubscribe();
  }
  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isVisible = window.scrollY > 250;
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
