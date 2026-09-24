import { Component, DOCUMENT, effect, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

import { AuthStore } from '../../services/auth-store';
import { LayoutService } from '../layout.service';

const THEME_KEY = 'theme-preference';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
  ],
})
export class SidebarComponent {
  private readonly document = inject(DOCUMENT);

  protected readonly authStore = inject(AuthStore);
  protected readonly layout = inject(LayoutService);
  protected readonly title = 'HFTM Web Applications (IN353)';

  protected readonly isDarkMode = signal(this.getInitialDarkMode());

  constructor() {
    effect(() => {
      this.document.documentElement.classList.toggle('dark-theme', this.isDarkMode());
    });
  }

  protected toggleDarkMode(): void {
    this.isDarkMode.update((dark) => !dark);
    localStorage.setItem(THEME_KEY, this.isDarkMode() ? 'dark' : 'light');
  }

  private getInitialDarkMode(): boolean {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored !== null) {
      return stored === 'dark';
    }

    const prefersDark = this.document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)');
    return prefersDark?.matches ?? false;
  }
}
