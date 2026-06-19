import { Component, inject, signal } from '@angular/core';

import { BlogService } from '../../../shared/blog';
import { BlogCard } from '../blog-card/blog-card';
import { Blog } from '../blog.model';

@Component({
  selector: 'app-blog-overview-page',
  imports: [BlogCard],
  templateUrl: './blog-overview-page.html',
  styleUrl: './blog-overview-page.scss',
})
export class BlogOverviewPage {
  private readonly blogService = inject(BlogService);

  protected readonly blogs = signal<Blog[]>(this.blogService.getAll());

  protected onLike(blogId: number): void {
    this.blogs.update((blogs) =>
      blogs.map((blog) => {
        if (blog.id !== blogId) {
          return blog;
        }

        const likedByMe = !blog.likedByMe;

        return {
          ...blog,
          likedByMe,
          likes: blog.likes + (likedByMe ? 1 : -1),
        };
      }),
    );
  }
}
