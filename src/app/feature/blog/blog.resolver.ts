import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

import { BlogService } from '../../shared/blog';
import { Blog } from './blog.model';

export const blogResolver: ResolveFn<Blog | undefined> = (route) => {
  const blogService = inject(BlogService);
  const id = Number(route.paramMap.get('id'));
  return blogService.getById(id);
};
