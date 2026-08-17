import { Component, computed, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login-page',
  imports: [MatButtonModule],
  templateUrl: './login-page.html',
})
export class LoginPage {
  // Query-Parameter kommen dank withComponentInputBinding() direkt als Inputs an
  readonly returnUrl = input('/');
  readonly error = input<string>();

  protected readonly errorMessage = computed(() => {
    switch (this.error()) {
      case 'access_denied':
        return 'Zugriff verweigert. Du hast keine Berechtigung für diesen Bereich.';
      case 'expired':
        return 'Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.';
      case 'failed':
        return 'Login fehlgeschlagen. Bitte erneut versuchen.';
      default:
        return null;
    }
  });

  protected login(): void {
    const target = encodeURIComponent(this.returnUrl());
    window.location.href = `${environment.bffUrl}/auth/login?returnUrl=${target}`;
  }
}
