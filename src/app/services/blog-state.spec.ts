import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { Blog } from '../feature/blog/blog.model';
import { BlogService } from '../shared/blog';
import { BlogStateService } from './blog-state';

function createBlog(id: number, author = 'Anna'): Blog {
  return {
    id,
    title: `Blog ${id}`,
    contentPreview: `Vorschau ${id}`,
    author,
    likes: 5,
    comments: 0,
    likedByMe: false,
    createdByMe: false,
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: '2026-10-01T10:00:00Z',
  };
}

describe('BlogStateService', () => {
  // BlogService gemockt: kein HttpClient, kein echter HTTP-Call
  const blogService = { getBlogs: vi.fn<() => Promise<Blog[]>>() };

  beforeEach(() => {
    localStorage.clear();
    blogService.getBlogs.mockReset();

    TestBed.configureTestingModule({
      providers: [{ provide: BlogService, useValue: blogService }],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Erst im Test erzeugen, damit localStorage vorher präpariert werden kann
  const createService = () => TestBed.inject(BlogStateService);

  async function loadWith(service: BlogStateService, blogs: Blog[]): Promise<void> {
    blogService.getBlogs.mockResolvedValueOnce(blogs);
    await service.loadBlogs();
  }

  // ── Aufgabe 1: Service-Test ───────────────────────────────────
  it('should start with empty blogs array', () => {
    const service = createService();

    expect(service.blogs()).toEqual([]);
    expect(service.loading()).toBe(false);
    expect(service.error()).toBeNull();
  });

  it('should update loading state', async () => {
    const service = createService();
    let respond!: (blogs: Blog[]) => void;
    blogService.getBlogs.mockReturnValueOnce(new Promise((resolve) => (respond = resolve)));

    const loading = service.loadBlogs();
    expect(service.loading()).toBe(true);

    respond([createBlog(1)]);
    await loading;
    expect(service.loading()).toBe(false);
  });

  it('should calculate blog count', async () => {
    const service = createService();

    await loadWith(service, [createBlog(1), createBlog(2)]);

    expect(service.blogCount()).toBe(2);
  });

  it('should set an error and stop loading when the backend fails', async () => {
    const service = createService();
    blogService.getBlogs.mockRejectedValueOnce(new Error('offline'));

    await service.loadBlogs();

    expect(service.error()).toBe('Blogs konnten nicht geladen werden.');
    expect(service.loading()).toBe(false);
    expect(service.blogs()).toEqual([]);
  });

  // ── Aufgabe 3: Signal-Testing ─────────────────────────────────
  describe('signals', () => {
    it('blogCount() follows its source', async () => {
      const service = createService();

      await loadWith(service, [createBlog(1), createBlog(2), createBlog(3)]);
      expect(service.blogCount()).toBe(3);

      await loadWith(service, []);
      expect(service.blogCount()).toBe(0);
    });

    it('authors() and filteredBlogs() follow the selected author', async () => {
      const service = createService();
      await loadWith(service, [createBlog(1, 'Anna'), createBlog(2, 'Ben'), createBlog(3, 'Anna')]);

      expect(service.authors()).toEqual(['Anna', 'Ben']);

      service.setAuthor('Ben');
      expect(service.filteredBlogs().map((blog) => blog.id)).toEqual([2]);
      expect(service.blogCount()).toBe(3); // zählt alle Blogs, unabhängig vom Filter

      service.setAuthor('all');
      expect(service.filteredBlogs()).toHaveLength(3);
    });

    it('effect() persists the selected author to localStorage', () => {
      const service = createService();
      // Auf dem Prototyp spionieren: localStorage.setItem = … würde bei Storage nur einen Eintrag anlegen
      const setItem = vi.spyOn(Storage.prototype, 'setItem');

      service.setAuthor('Ben');
      TestBed.tick(); // Effects laufen erst beim nächsten Change-Detection-Durchlauf

      expect(setItem).toHaveBeenLastCalledWith('selectedAuthor', 'Ben');
    });

    it('restores the selected author from localStorage', () => {
      localStorage.setItem('selectedAuthor', 'Ben');

      expect(createService().selectedAuthor()).toBe('Ben');
    });

    it('toggleLike() flips likedByMe and adjusts the counter', async () => {
      const service = createService();
      await loadWith(service, [createBlog(1)]);

      service.toggleLike(1);
      expect(service.blogs()[0]).toMatchObject({ likedByMe: true, likes: 6 });

      service.toggleLike(1);
      expect(service.blogs()[0]).toMatchObject({ likedByMe: false, likes: 5 });
    });
  });

  // ── Aufgabe 3: Edge Cases ─────────────────────────────────────
  describe('edge cases', () => {
    it('falls back to "all" when localStorage has no value (null)', () => {
      expect(createService().selectedAuthor()).toBe('all');
    });

    it('handles an empty blog list', async () => {
      const service = createService();
      await loadWith(service, []);

      expect(service.blogCount()).toBe(0);
      expect(service.authors()).toEqual([]);
      expect(service.filteredBlogs()).toEqual([]);
    });

    it('returns no blogs for an unknown author', async () => {
      const service = createService();
      await loadWith(service, [createBlog(1, 'Anna')]);

      service.setAuthor('Unbekannt');

      expect(service.filteredBlogs()).toEqual([]);
    });

    it('ignores toggleLike() for an unknown id', async () => {
      const service = createService();
      await loadWith(service, [createBlog(1)]);
      const before = service.blogs();

      service.toggleLike(999);

      expect(service.blogs()).toEqual(before);
    });

    it('clears an old error on the next successful load', async () => {
      const service = createService();
      blogService.getBlogs.mockRejectedValueOnce(new Error('offline'));
      await service.loadBlogs();

      await loadWith(service, [createBlog(1)]);

      expect(service.error()).toBeNull();
      expect(service.blogCount()).toBe(1);
    });
  });
});
