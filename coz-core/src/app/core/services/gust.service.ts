import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GustService {
    private readonly GUEST_ID_KEY = 'guestId';
  getGuestId(): string {
    let guestId = localStorage.getItem(this.GUEST_ID_KEY);
    if (!guestId) {
      guestId = crypto.randomUUID();
      localStorage.setItem(this.GUEST_ID_KEY, guestId);
    }
    return guestId;
  }

  clearGuestId() {
    localStorage.removeItem(this.GUEST_ID_KEY);
  }
}
