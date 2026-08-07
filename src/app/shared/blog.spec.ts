import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { Blog } from '../feature/blog/blog.model';
import { BlogService } from './blog';

describe('BlogService', () => {
  let service: BlogService;
  let httpTesting: HttpTestingController;

  const apiUrl =
    'https://d-cap-blog-backend---v2.whitepond-b96fee4b.westeurope.azurecontainerapps.io/entries';

  const validBlog: Blog = {
    id: 1,
    title: 'Test-Blog',
    contentPreview: 'Vorschautext',
    author: 'Testautor',
    likes: 12,
    comments: 3,
    likedByMe: false,
    createdByMe: false,
    createdAt: '2026-08-06T10:00:00Z',
    updatedAt: '2026-08-06T10:00:00Z',
  };

  function createResponse(data: unknown[]) {
    return {
      data,
      pageIndex: 0,
      pageSize: 20,
      totalCount: data.length,
      maxPageSize: 50,
    };
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(BlogService);
    httpTesting = TestBed.inject(HttpTestingController);

    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    httpTesting.verify();
    vi.restoreAllMocks();
  });

  it('should return valid blogs', async () => {
    const resultPromise = service.getBlogs();
    const request = httpTesting.expectOne(apiUrl);

    expect(request.request.method).toBe('GET');
    request.flush(createResponse([validBlog]));

    await expect(resultPromise).resolves.toEqual([validBlog]);
  });

  it('should throw when a required field is missing', async () => {
    const blogWithoutTitle = {
      id: 1,
      contentPreview: 'Vorschautext',
      author: 'Testautor',
      likes: 12,
      comments: 3,
      likedByMe: false,
      createdByMe: false,
      createdAt: '2026-08-06T10:00:00Z',
      updatedAt: '2026-08-06T10:00:00Z',
    };

    const resultPromise = service.getBlogs();
    const request = httpTesting.expectOne(apiUrl);

    request.flush(createResponse([blogWithoutTitle]));

    await expect(resultPromise).rejects.toThrow('Das Backend hat ungültige Blog-Daten geliefert.');
  });

  it('should throw when a field has the wrong type', async () => {
    const blogWithWrongType = {
      ...validBlog,
      likes: 'zwölf',
    };

    const resultPromise = service.getBlogs();
    const request = httpTesting.expectOne(apiUrl);

    request.flush(createResponse([blogWithWrongType]));

    await expect(resultPromise).rejects.toThrow('Das Backend hat ungültige Blog-Daten geliefert.');
  });
});
