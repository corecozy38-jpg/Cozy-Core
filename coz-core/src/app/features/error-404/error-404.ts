import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-error-404',
  imports: [TranslatePipe,RouterLink],
  templateUrl: './error-404.html',
  styleUrl: './error-404.css',
})
export class Error404 {

}
