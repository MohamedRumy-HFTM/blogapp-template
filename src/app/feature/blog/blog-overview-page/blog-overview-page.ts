import { Component, inject, OnInit, signal } from '@angular/core';

import { BlogService } from '../../../services/blog';
import { BlogCard } from '../blog-card/blog-card';
import { Blog } from '../blog.model';

@Component({
  selector: 'app-blog-overview-page',
  imports: [BlogCard],
  templateUrl: './blog-overview-page.html',
  styleUrl: './blog-overview-page.scss',
})
export class BlogOverviewPage implements OnInit {
  private readonly blogService = inject(BlogService);

  protected readonly blogs = signal<Blog[]>([]);
  protected readonly loading = signal(false);

  async ngOnInit(): Promise<void> {
    this.loading.set(true);

    try {
      const blogs = await this.blogService.getBlogs();
      this.blogs.set(blogs);
    } finally {
      this.loading.set(false);
    }
  }

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
