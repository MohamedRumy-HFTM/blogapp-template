import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, convertToParamMap, RouterStateSnapshot } from '@angular/router';
import { vi } from 'vitest';

import { BlogService } from '../../shared/blog';
import { Blog } from './blog.model';
import { blogResolver } from './blog.resolver';

describe('blogResolver', () => {
  const blog = { id: 862, title: 'Live-Blog' } as Blog;
  const blogService = {
    getById: vi.fn<(id: number) => Blog | undefined>(),
    getBlogs: vi.fn<() => Promise<Blog[]>>(),
  };

  beforeEach(() => {
    blogService.getById.mockReset();
    blogService.getBlogs.mockReset();

    TestBed.configureTestingModule({
      providers: [{ provide: BlogService, useValue: blogService }],
    });
  });

  const resolve = (id: string) =>
    TestBed.runInInjectionContext(() =>
      blogResolver(
        { paramMap: convertToParamMap({ id }) } as ActivatedRouteSnapshot,
        {} as RouterStateSnapshot,
      ),
    );

  it('returns the cached blog without calling the backend', async () => {
    blogService.getById.mockReturnValue(blog);

    expect(await resolve('862')).toBe(blog);
    expect(blogService.getBlogs).not.toHaveBeenCalled();
  });

  it('loads from the backend on a cache miss (direct navigation)', async () => {
    blogService.getBlogs.mockResolvedValue([blog]);

    expect(await resolve('862')).toBe(blog);
  });

  it('returns undefined for an unknown id', async () => {
    blogService.getBlogs.mockResolvedValue([blog]);

    expect(await resolve('1')).toBeUndefined();
  });

  it('returns undefined when the backend fails', async () => {
    blogService.getBlogs.mockRejectedValue(new Error('offline'));

    expect(await resolve('862')).toBeUndefined();
  });
});
