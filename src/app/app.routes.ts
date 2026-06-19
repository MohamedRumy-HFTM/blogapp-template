import { Routes } from '@angular/router';

import { BlogOverviewPage } from './feature/blog/blog-overview-page/blog-overview-page';
import { blogResolver } from './feature/blog/blog.resolver';

export const routes: Routes = [
  {
    path: '',
    component: BlogOverviewPage,
  },
  {
    path: 'blog/:id',
    resolve: { blog: blogResolver },
    loadComponent: () =>
      import('./feature/blog/blog-detail-page/blog-detail-page').then((m) => m.BlogDetailPage),
  },
  {
    path: 'about',
    loadComponent: () => import('./feature/about-page/about-page').then((m) => m.AboutPage),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./feature/not-found-page/not-found-page').then((m) => m.NotFoundPage),
  },
];
