import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-verify-email',
  imports: [TranslatePipe],
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.css',
})
export class VerifyEmail {
    loading = true;
  message = '';
  isSuccess = false;

  constructor(
    private _route: ActivatedRoute,
    private _authService: AuthService,
    private _router: Router
  ) {}

  ngOnInit() {
    const token = this._route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.message = 'auth.invalid_verification_link';
      this.loading = false;
      return;
    }
    this._authService.verifyEmail(token).subscribe({
      next: (res) => {
        this.message = res.message || 'auth.verification_success';
        this.isSuccess = true;
        this.loading = false;
      },
      error: (err) => {
        this.message = err.error?.message || 'auth.verification_failed';
        this.isSuccess = false;
        this.loading = false;
      }
    });
  }


  goToLogin() {
    this._router.navigate(['/auth']);
  }
}
