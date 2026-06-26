import { Component, DOCUMENT, effect, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

const THEME_KEY = 'theme-preference';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatToolbarModule, MatButtonModule, MatIconModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = 'HFTM Web Applications (IN353)';

  private readonly document = inject(DOCUMENT);

  // Start: gespeicherte Präferenz (localStorage) ODER System-Einstellung (prefers-color-scheme)
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
