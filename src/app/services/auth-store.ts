import { computed, Injectable, signal } from '@angular/core';

import { environment } from '../../environments/environment';

export interface UserInfo {
  preferred_username: string;
  email: string;
  name: string;
  roles: string[];
}

interface AuthMeResponse {
  isAuthenticated: boolean;
  user: UserInfo | null;
}

interface LogoutResponse {
  logoutUrl: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthStore {
  private readonly bffUrl = environment.bffUrl;

  // ── State ────────────────────────────────────────────────────
  readonly isAuthenticated = signal(false);
  readonly user = signal<UserInfo | null>(null);
  readonly loading = signal(true);

  // ── Derived State ────────────────────────────────────────────
  readonly roles = computed(() => this.user()?.roles ?? []);

  // ── ready: der Guard macht daraus `await authStore.ready` ─────
  readonly ready: Promise<void>;

  constructor() {
    // Session-Check läuft schon beim App-Start (loading ist initial true)
    this.ready = this.checkSession();
  }

  // ── Actions ──────────────────────────────────────────────────
  async checkSession(): Promise<void> {
    this.loading.set(true);
    try {
      const res = await fetch(`${this.bffUrl}/auth/me`, {
        credentials: 'include',
      });
      const data = (await res.json()) as AuthMeResponse;
      this.isAuthenticated.set(data.isAuthenticated);
      this.user.set(data.user);
    } catch {
      this.isAuthenticated.set(false);
      this.user.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  async logout(): Promise<void> {
    try {
      const res = await fetch(`${this.bffUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      });
      const data = (await res.json()) as LogoutResponse;
      this.isAuthenticated.set(false);
      this.user.set(null);
      if (data.logoutUrl) {
        window.location.href = data.logoutUrl;
      }
    } catch {
      this.isAuthenticated.set(false);
      this.user.set(null);
    }
  }
}
