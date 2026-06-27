import { Component, signal, OnInit } from '@angular/core';
import { LanguageService } from '../../core/services/language.service';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Address } from '../../core/interfaces/user.interface';
import { RefreshTokenService } from '../../core/services/refresh-token.service';
import { Image } from '../../core/interfaces/product.interface';
import { SiteSettingsService } from '../../core/services/site-settings.service';

type AuthMode = 'login' | 'register' | 'forgot' | 'verify-otp' | 'reset-password';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './auth.html',
  styleUrls: ['./auth.css']
})
export class Auth implements OnInit {
  mode = signal<AuthMode>('login');
  banner = signal<Image | null>(null);

  loading = false;
  errorMessage = signal<string | null>(null);
  isLoadingBanner = signal(true);

  fullName = '';
  email = '';
  password = '';
  confirmPassword = '';
  otp = '';
  verificationToken = '';
  resetToken = '';
  phone = '';
  addresses: Address[] = [
    { country: 'Egypt', governorate: '', city: '', street: '', apartment: '', postalCode: '' }
  ];

  governoratesList: string[] = [];

  fullNameTouched = false;
  emailTouched = false;
  passwordTouched = false;
  confirmPasswordTouched = false;
  phoneTouched = false;

  otpTimerSeconds = 0;
  otpTimerInterval: any = null;
  otpExpired = false;

  governorateDropdownOpenForIndex: boolean[] = [];
  selectedGovernorateForIndex: string[] = [];

  showPassword = false;
  showConfirmPassword = false;
  showNewPassword = false;
  showResetPassword = false;
  showResetConfirmPassword = false;

  constructor(
    private _languageService: LanguageService,
    private _router: Router,
    private _authService: AuthService,
    private _refreshTokenService: RefreshTokenService,
    private translate: TranslateService,
    private _siteSettingService: SiteSettingsService
    
  ) { }

  ngOnInit() {
    const storedVerificationToken = sessionStorage.getItem('verificationToken');
    const storedResetToken = sessionStorage.getItem('resetToken');
    if (storedVerificationToken) this.verificationToken = storedVerificationToken;
    if (storedResetToken) this.resetToken = storedResetToken;

    this.loadBanner();
    this.loadGovernorates();
    this.initGovernorateTrackers();
  }

  loadBanner() {
    this.isLoadingBanner.set(true);
    this._siteSettingService.getBanner().subscribe({
      next: (res) => {
        this.banner.set(res.data);
        this.isLoadingBanner.set(false);
      },
      error: () => {
        this.isLoadingBanner.set(false);
      }
    });
  }

  initGovernorateTrackers() {
    this.governorateDropdownOpenForIndex = this.addresses.map(() => false);
    this.selectedGovernorateForIndex = this.addresses.map(addr => addr.governorate);
  }

  loadGovernorates() {
    this.translate.get('governorates.list').subscribe((list: string[]) => {
      this.governoratesList = list;
    });
  }

  setMode(newMode: AuthMode) {
    if (this.mode() === 'verify-otp') {
      this.stopOtpTimer();
    }
    this.mode.set(newMode);
    this.errorMessage.set(null);

    if (newMode === 'login') {
      this.password = '';
    } else if (newMode === 'register') {
      this.fullName = '';
      this.confirmPassword = '';
      this.phone = '';
      this.addresses = [{ country: 'Egypt', governorate: '', city: '', street: '', apartment: '', postalCode: '' }];
      this.fullNameTouched = false;
      this.emailTouched = false;
      this.passwordTouched = false;
      this.confirmPasswordTouched = false;
      this.phoneTouched = false;
      this.initGovernorateTrackers();
    } else if (newMode === 'forgot') {
      this.email = '';
    } else if (newMode === 'verify-otp') {
      this.otp = '';
    } else if (newMode === 'reset-password') {
      this.password = '';
      this.confirmPassword = '';
    }
  }

  addAddress() {
    this.addresses.push({
      country: 'Egypt',
      governorate: '',
      city: '',
      street: '',
      apartment: '',
      postalCode: ''
    });
    this.governorateDropdownOpenForIndex.push(false);
    this.selectedGovernorateForIndex.push('');
  }

  removeAddress(index: number) {
    if (this.addresses.length > 1) {
      this.addresses.splice(index, 1);
      this.governorateDropdownOpenForIndex.splice(index, 1);
      this.selectedGovernorateForIndex.splice(index, 1);
    }
  }

  validateFullName(): boolean {
    return this.fullName.trim().length > 0;
  }

  validateEmail(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }

  validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!password) {
      errors.push('auth.password_required');
      return { valid: false, errors };
    }
    if (password.length < 8) errors.push('auth.password_min_length');
    if (!/[A-Z]/.test(password)) errors.push('auth.password_need_upper');
    if (!/[a-z]/.test(password)) errors.push('auth.password_need_lower');
    if (!/[0-9]/.test(password)) errors.push('auth.password_need_digit');
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) errors.push('auth.password_need_special');
    return { valid: errors.length === 0, errors };
  }

  validateConfirmPassword(): boolean {
    return this.confirmPassword === this.password;
  }

  validatePhone(): boolean {
    if (!this.phone) return true;
    const phoneRegex = /^(01)[0-9]{9}$/;
    return phoneRegex.test(this.phone);
  }

  getFullNameError(): string | null {
    if (!this.fullNameTouched) return null;
    return this.validateFullName() ? null : 'auth.full_name_required';
  }

  getEmailError(): string | null {
    if (!this.emailTouched) return null;
    if (!this.email) return 'auth.email_required';
    return this.validateEmail() ? null : 'auth.email_invalid';
  }

  getPasswordErrors(): string[] {
    if (!this.passwordTouched) return [];
    const result = this.validatePasswordStrength(this.password);
    return result.errors;
  }

  getConfirmPasswordError(): string | null {
    if (!this.confirmPasswordTouched) return null;
    return this.validateConfirmPassword() ? null : 'auth.passwords_not_match';
  }

  getPhoneError(): string | null {
    if (!this.phoneTouched) return null;
    return this.validatePhone() ? null : 'auth.phone_invalid';
  }

  private validateRegister(): boolean {
    this.fullNameTouched = true;
    this.emailTouched = true;
    this.passwordTouched = true;
    this.confirmPasswordTouched = true;
    this.phoneTouched = true;

    if (!this.validateFullName()) return false;
    if (!this.email || !this.validateEmail()) return false;
    const pwdValid = this.validatePasswordStrength(this.password).valid;
    if (!pwdValid) return false;
    if (!this.validateConfirmPassword()) return false;
    if (!this.validatePhone()) return false;

    const hasValidAddress = this.addresses.some(addr =>
      addr.governorate.trim() && addr.city.trim() && addr.street.trim()
    );
    if (!hasValidAddress) {
      this.errorMessage.set('auth.address_required');
      return false;
    }
    return true;
  }

  startOtpTimer(seconds: number = 300) {
    this.stopOtpTimer();
    this.otpTimerSeconds = seconds;
    this.otpExpired = false;
    this.otpTimerInterval = setInterval(() => {
      if (this.otpTimerSeconds > 0) {
        this.otpTimerSeconds--;
      } else {
        this.stopOtpTimer();
        this.otpExpired = true;
        this.errorMessage.set('auth.otp_expired');
      }
    }, 1000);
  }

  stopOtpTimer() {
    if (this.otpTimerInterval) {
      clearInterval(this.otpTimerInterval);
      this.otpTimerInterval = null;
    }
  }

  getFormattedOtpTime(): string {
    const minutes = Math.floor(this.otpTimerSeconds / 60);
    const seconds = this.otpTimerSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  onLogin() {
    if (!this.email || !this.password) {
      this.errorMessage.set('auth.fill_all_fields');
      return;
    }
    this.loading = true;
    this._authService.Login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this._refreshTokenService.setAccessToken(res.accessToken);
        this._router.navigate(['/']);
      },
      error: (err) => {
        const message = err.error?.message || 'auth.login_failed';

        if (message.toLowerCase().includes('verify your email')) {
          this.errorMessage.set('auth.verify_email_first');
        } else if (message.toLowerCase().includes('expired. a new link has been sent')) {
          this.errorMessage.set('auth.verification_link_expired_sent_new');
        } else if (message.toLowerCase().includes('recently sent')) {
          this.errorMessage.set('auth.verification_email_recently_sent');
        } else {
          this.errorMessage.set(message);
        }

        this.loading = false;
      }
    });
  }

  resendVerification() {
    if (!this.email) {
      this.errorMessage.set('auth.email_required');
      return;
    }
    this.loading = true;
    this._authService.resendVerification({ email: this.email }).subscribe({
      next: () => {
        this.errorMessage.set('auth.verification_email_sent');
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'auth.resend_failed');
        this.loading = false;
      }
    });
  }

  onRegister() {
    if (!this.validateRegister()) return;
    this.loading = true;

    const cleanAddresses = this.addresses.filter(addr =>
      addr.governorate.trim() && addr.city.trim() && addr.street.trim()
    );
    cleanAddresses.forEach(addr => {
      addr.apartment = addr.apartment || null;
      addr.postalCode = addr.postalCode || null;
    });

    this._authService.Register({
      fullName: this.fullName,
      email: this.email,
      password: this.password,
      confirmPassword: this.confirmPassword,
      address: cleanAddresses,
      phone: this.phone,
    }).subscribe({
      next: () => {
        this.errorMessage.set('auth.verification_email_sent');
        this.loading = false;
        this.mode.set('login');
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'auth.register_failed');
        this.loading = false;
      }
    });
  }

  onForgotPassword() {
    if (!this.email) {
      this.errorMessage.set('auth.email_required');
      return;
    }
    this.loading = true;
    this._authService.forgetPassword({ email: this.email }).subscribe({
      next: (res) => {
        this.verificationToken = res.verificationToken;
        sessionStorage.setItem('verificationToken', this.verificationToken);
        this.setMode('verify-otp');
        this.loading = false;
        this.startOtpTimer(300);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'auth.forgot_failed');
        this.loading = false;
      }
    });
  }

  onVerifyOTP() {
    if (!this.otp) {
      this.errorMessage.set('auth.otp_required');
      return;
    }
    if (this.otpExpired) {
      this.errorMessage.set('auth.otp_expired');
      return;
    }
    this.loading = true;
    this._authService.verifyOtp({ token: this.verificationToken, otp: this.otp }).subscribe({
      next: (res) => {
        this.stopOtpTimer();
        this.resetToken = res.resetToken;
        sessionStorage.setItem('resetToken', this.resetToken);
        this.setMode('reset-password');
        this.loading = false;
      },
      error: (err) => {
        let msg = err.error?.message || 'auth.otp_invalid';
        if (msg.toLowerCase().includes('expired')) {
          this.stopOtpTimer();
          this.otpExpired = true;
          msg = 'auth.otp_expired';
        }
        this.errorMessage.set(msg);
        this.loading = false;
      }
    });
  }

  onResetPassword() {
    if (!this.password || !this.confirmPassword) {
      this.errorMessage.set('auth.fill_all_fields');
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMessage.set('auth.passwords_not_match');
      return;
    }
    this.loading = true;
    this._authService.resetPassword({
      token: this.resetToken,
      password: this.password,
      confirmPassword: this.confirmPassword
    }).subscribe({
      next: () => {
        this.setMode('login');
        this.errorMessage.set('auth.password_reset_success');
        sessionStorage.removeItem('resetToken');
        sessionStorage.removeItem('verificationToken');
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'auth.reset_failed');
        this.loading = false;
      }
    });
  }

  toggleGovernorateDropdown(index: number) {
    this.governorateDropdownOpenForIndex[index] = !this.governorateDropdownOpenForIndex[index];
  }

  selectGovernorate(gov: string, index: number) {
    this.addresses[index].governorate = gov;
    this.governorateDropdownOpenForIndex[index] = false;
  }
}
