import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./feature/blog/blog-overview-page/blog-overview-page').then(
        (m) => m.BlogOverviewPage,
      ),
  },
];
