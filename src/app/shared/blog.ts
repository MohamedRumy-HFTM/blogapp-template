import { Injectable } from '@angular/core';

import blogData from '../data/blogs.json';
import { Blog } from '../feature/blog/blog.model';

@Injectable({
  providedIn: 'root',
})
export class BlogService {
  private readonly blogs = blogData as Blog[];

  getAll(): Blog[] {
    return this.blogs;
  }

  getById(id: number): Blog | undefined {
    return this.blogs.find((blog) => blog.id === id);
  }
}
