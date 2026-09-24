import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginPage } from './login-page';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginPage],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
  });

  // Open-Redirect-Schutz: nur interne Pfade dürfen als returnUrl durchgehen
  it.each([
    ['/add-blog', '/add-blog'],
    ['/', '/'],
    ['https://evil.example/phish', '/'],
    ['//evil.example', '/'],
    ['/\\evil.example', '/'],
    ['javascript:alert(1)', '/'],
  ])('returnUrl %s → %s', (returnUrl, expected) => {
    fixture.componentRef.setInput('returnUrl', returnUrl);
    expect(component['safeReturnUrl']()).toBe(expected);
  });
});
