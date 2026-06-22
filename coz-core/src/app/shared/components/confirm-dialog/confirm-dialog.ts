import { Component } from '@angular/core';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-confirm-dialog',
  imports: [TranslatePipe],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
})
export class ConfirmDialog {
    constructor(public _confirmService: ConfirmDialogService){}
}
