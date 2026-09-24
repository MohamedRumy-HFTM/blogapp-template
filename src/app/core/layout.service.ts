import { DestroyRef, inject, Injectable, signal } from '@angular/core';

// 767.98px statt 767px: fängt auch fraktionale Viewport-Breiten ab
const MOBILE_QUERY = '(max-width: 767.98px)';

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  private readonly mediaQuery = window.matchMedia(MOBILE_QUERY);

  readonly isMobile = signal(this.mediaQuery.matches);

  constructor() {
    const onChange = (event: MediaQueryListEvent) => this.isMobile.set(event.matches);
    this.mediaQuery.addEventListener('change', onChange);

    inject(DestroyRef).onDestroy(() => {
      this.mediaQuery.removeEventListener('change', onChange);
    });
  }
}
