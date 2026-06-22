import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterModule, TranslatePipe, FormsModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer  {
  currentYear = new Date().getFullYear();
}
