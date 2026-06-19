import { Component, signal } from '@angular/core';

import blogData from '../../../data/blogs.json';
import { BlogCard } from '../blog-card/blog-card';
import { Blog } from '../blog.model';

@Component({
  selector: 'app-blog-overview-page',
  imports: [BlogCard],
  templateUrl: './blog-overview-page.html',
  styleUrl: './blog-overview-page.scss',
})
export class BlogOverviewPage {
  protected readonly blogs = signal<Blog[]>(blogData as Blog[]);

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
