import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

import { BlogService } from '../../shared/blog';
import { Blog } from './blog.model';

export const blogResolver: ResolveFn<Blog | undefined> = async (route) => {
  const blogService: BlogService = inject(BlogService);
  const id = Number(route.paramMap.get('id'));

  const cached = blogService.getById(id);
  if (cached) {
    return cached;
  }

  // Direktaufruf/Reload: Der Cache kennt erst die Mock-Daten, also vom Backend nachladen
  try {
    return (await blogService.getBlogs()).find((blog) => blog.id === id);
  } catch {
    return undefined; // Detailseite zeigt dann "Blog-Post nicht gefunden."
  }
};
