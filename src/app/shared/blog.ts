import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import blogData from '../data/blogs.json';
import { Blog } from '../feature/blog/blog.model';
import { BlogPageSchema } from '../feature/blog/blog.schema';

@Injectable({
  providedIn: 'root',
})
export class BlogService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'https://d-cap-blog-backend---v2.whitepond-b96fee4b.westeurope.azurecontainerapps.io/entries';

  private blogs = blogData as Blog[];

  async getBlogs(): Promise<Blog[]> {
    try {
      const response = await firstValueFrom(this.http.get<unknown>(this.apiUrl));
      const result = BlogPageSchema.safeParse(response);

      if (!result.success) {
        console.error('Das Backend hat ungültige Blog-Daten geliefert.', result.error);
        return [];
      }

      this.blogs = result.data.data;
      return this.blogs;
    } catch (error) {
      console.error('Blogs konnten nicht geladen werden.', error);
      return [];
    }
  }

  async createBlog(blog: Blog): Promise<Blog> {
    try {
      return await firstValueFrom(this.http.post<Blog>(this.apiUrl, blog));
    } catch (error) {
      console.error('Der Blog konnte nicht erstellt werden.', error);
      throw error;
    }
  }

  async updateBlog(id: string, blog: Blog): Promise<Blog> {
    try {
      return await firstValueFrom(this.http.put<Blog>(`${this.apiUrl}/${id}`, blog));
    } catch (error) {
      console.error(`Der Blog mit der ID ${id} konnte nicht aktualisiert werden.`, error);
      throw error;
    }
  }

  async deleteBlog(id: string): Promise<void> {
    try {
      return await firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
    } catch (error) {
      console.error(`Der Blog mit der ID ${id} konnte nicht gelöscht werden.`, error);
      throw error;
    }
  }

  getAll(): Blog[] {
    return this.blogs;
  }

  getById(id: number): Blog | undefined {
    return this.blogs.find((blog) => blog.id === id);
  }
}
