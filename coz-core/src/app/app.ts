import { Component, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Navbar } from './shared/components/navbar/navbar';
import { Footer } from './shared/components/footer/footer';
import { Scroller } from './shared/components/scroller/scroller';
import { Toast } from './shared/components/toast/toast';
import { ConfirmDialog } from './shared/components/confirm-dialog/confirm-dialog';
import { filter } from 'rxjs';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer, Scroller,Toast,ConfirmDialog],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit{
  protected readonly title = signal('coz-core');
  constructor(private _route:Router){

  }

  ngOnInit() {

    this._route.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(
      () => {
        window.scrollTo(0, 0);
      }
    )

  }

}
